import multer from "multer";

const uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 5000000 },
});

const uploading = uploader.single("image");

export { uploading };
