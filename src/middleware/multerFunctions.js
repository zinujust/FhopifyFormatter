import multer from 'multer';

const upload = multer({
    limits: {fileSize: 50 * 1024 * 1024},
    storage: multer.memoryStorage(),
})

export default upload;