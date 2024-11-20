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
  hierarchyBuffer
) {
  try {
    setIcaps(readFromExcel(icapsBuffer));
    setEcdb(readFromExcel(ecdbBuffer));
    setImages(readImagesFromExcel(imagesBuffer));
    setHierarchy(readFromExcel(hierarchyBuffer));
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
    return xlsx.utils.sheet_to_json(worksheet);
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

function buildSkuMap(jsonMain, jsonAlt) {
  try {
    const skuMap = {};

    jsonMain.forEach((item) => {
      const image = item["ITEM_IMG_URL_1500Variant"]?.endsWith(".JPG")
        ? item["ITEM_IMG_URL_1500Variant"]
        : item["ITEM_IMG_URL_750Variant"];

      skuMap[item["ITEMNUMBER"]] = { 1: image };
    });

    jsonAlt.forEach((item) => {
      const image = item["ALT_IMG_URL_1500Variant"]?.endsWith(".JPG")
        ? item["ALT_IMG_URL_1500Variant"]
        : item["ALT_IMG_URL_750Variant"];

      const nextID = Object.keys(skuMap[item["ITEMNUMBER"]]).length + 1;
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

    return filteredData.reduce((acc, item) => {
      acc[item["Item Number"]] = item;
      return acc;
    }, {});
  } catch (error) {
    throw new Error(
      `Error comparing and filtering ICAPS with syndicated items: ${error.message}`
    );
  }
}

function compareAndFilterIcapsWithHierarchy(json1, json2) {
  try {
    if (!json1 || !json2) {
      return [];
    }

    const fetchHierarchy = new Set(json2.map((item) => item["Item Number"]));
    return json1.filter((item) => fetchHierarchy.has(item["Item Number"]));
  } catch (error) {
    throw new Error(
      `Error comparing and filtering ICAPS with hierarchy: ${error.message}`
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
