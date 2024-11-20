import multer from "multer";

export const upload = multer({
  limits: { fileSize: 100 * 1024 * 1024 },
  storage: multer.memoryStorage(),
});

export const uploadFields = upload.fields([
  { name: "icaps", maxCount: 1 },
  { name: "ecdb", maxCount: 1 },
  { name: "images", maxCount: 1 },
  { name: "hierarchy", maxCount: 1 },
]);
