import xlsx from "xlsx";
import {
  getFileStorage,
  setEcdb,
  setHierarchy,
  setIcaps,
  setImages
} from "../model/fileStore.js";
import { createShopifyCSV } from "./shopifyFunctions.js";

export function readAndExtractSourceData(
  icapsBuffer,
  ecdbBuffer,
  imagesBuffer,
  heirarchyBuffer
) {
  try {
    setIcaps(readFromExcel(icapsBuffer));
    setEcdb(readFromExcel(ecdbBuffer));
    setImages(readImagesFromExcel(imagesBuffer));
    setHierarchy(readFromExcel(heirarchyBuffer));
    return getFileStorage();
  } catch (error) {
    throw new Error(
      `Error reading and extracting source data: ${error.message}`
    );
  }
}

function readFromExcel(file) {
  try {
    const workbook = xlsx.read(file, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    return jsonData;
  } catch (error) {
    throw new Error(`Error reading from Excel: ${error.message}`);
  }
}

function readImagesFromExcel(file) {
  try {
    const workbook = xlsx.read(file, { type: "buffer" });

    const sheet1Name = "MAIN IMAGE URLs";
    const sheet2Name = "ALTERNATE IMAGE URLs";

    if (
      !workbook.SheetNames.includes(sheet1Name) ||
      !workbook.SheetNames.includes(sheet2Name)
    ) {
      throw new Error(
        `Workbook does not contain the required sheets: ${sheet1Name}, ${sheet2Name}`
      );
    }

    const worksheet1 = workbook.Sheets[sheet1Name];
    const worksheet2 = workbook.Sheets[sheet2Name];
    const jsonMain = xlsx.utils.sheet_to_json(worksheet1);
    const jsonAlt = xlsx.utils.sheet_to_json(worksheet2);

    return buildSkuMap(jsonMain, jsonAlt);
  } catch (error) {
    throw new Error(`Error reading images from Excel: ${error.message}`);
  }
}

function buildSkuMap(obj1, obj2) {
  try {
    const skuMap = {};

    let idCounter = 1;

    obj1.forEach((item) => {
      let LARGE_IMAGE = "ITEM_IMG_URL_1500Variant";
      let MED_IMAGE = "ITEM_IMG_URL_750Variant";
      let image =
        item[LARGE_IMAGE] && item[LARGE_IMAGE].endsWith(".JPG")
          ? item[LARGE_IMAGE]
          : item[MED_IMAGE];

      skuMap[item["ITEMNUMBER"]] = {
        1: image,
      };
    });

    obj2.forEach((item) => {
      let LARGE_IMAGE = "ALT_IMG_URL_1500Variant";
      let MED_IMAGE = "ALT_IMG_URL_750Variant";
      let image =
        item[LARGE_IMAGE] && item[LARGE_IMAGE].endsWith(".JPG")
          ? item[LARGE_IMAGE]
          : item[MED_IMAGE];

      let nextID = Object.keys(skuMap[item["ITEMNUMBER"]]).length + 1;

      skuMap[item["ITEMNUMBER"]][nextID] = image;
    });

    return skuMap;
  } catch (error) {
    throw new Error(`Error building SKU map: ${error.message}`);
  }
}

export function compareAndFilterIcapsWithSyndicatedItems(json1, json2) {
  try {
    if (!json1 || !json2) {
      return [];
    }

    const fetchSKU = new Set(json2.map((item) => item["Item Number"]));
    const filteredData = json1.filter((item) =>
      fetchSKU.has(item["Item Number"])
    );

    const result = filteredData.reduce((acc, item) => {
      acc[item["Item Number"]] = item;
      return acc; // Added return statement here
    }, {});

    return result;
  } catch (error) {
    throw new Error(
      `Error comparing and filtering ICAPS with syndicated items: ${error.message}`
    );
  }
}

export function mergedData(icaps, ecdb, images, hierarchy) {
  try {
    const filteredData = compareAndFilterIcapsWithSyndicatedItems(icaps, ecdb);
    return createShopifyCSV(filteredData, images, hierarchy);
  } catch (error) {
    throw new Error(`Error merging data: ${error.message}`);
  }
}
