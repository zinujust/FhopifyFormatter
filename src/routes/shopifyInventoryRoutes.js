import express from "express";
import { uploadFields } from "../middleware/multerFunctions.js";
import {
  mergedData,
  readAndExtractSourceData,
} from "../utils/utilFunctions.js";

const router = express.Router();

router.post("/upload-files", uploadFields, (req, res) => {
  if (
    !req.files["icaps"] ||
    !req.files["ecdb"] ||
    !req.files["images"] ||
    !req.files["hierarchy"]
  ) {
    return res
      .status(400)
      .send("All files (icaps, ecdb, images, hierarchy) are required.");
  }

  try {
    const icapsBuffer = req.files["icaps"][0].buffer;
    const ecdbBuffer = req.files["ecdb"][0].buffer;
    const imagesBuffer = req.files["images"][0].buffer;
    const hierarchyBuffer = req.files["hierarchy"][0].buffer;

    let fileStorage = readAndExtractSourceData(
      icapsBuffer,
      ecdbBuffer,
      imagesBuffer,
      hierarchyBuffer
    );

    if (
      !fileStorage.icaps ||
      !fileStorage.ecdb ||
      !fileStorage.images ||
      !fileStorage.hierarchy
    ) {
      return res.status(400).send({ message: `An error occurred` });
    }

    let data = mergedData(
      fileStorage.icaps,
      fileStorage.ecdb,
      fileStorage.images,
      fileStorage.hierarchy
    );
    const bom = "\uFEFF";
    data = bom + data;

    res.setHeader("Content-Type", "text/csv", "charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="shopifyData.csv"'
    );

    res.status(200).send(data);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `An error occurred: ${error.message}` });
  }
});

export default router;
