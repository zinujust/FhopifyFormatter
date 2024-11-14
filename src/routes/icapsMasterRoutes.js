import express from 'express';
import icapsMaster from '../model/IcapsMaster.js'
import xlsx from 'xlsx';
import upload from '../middleware/multerFunctions.js';

const router = express.Router();

router.post('/upload-icaps', upload.single('file'), (req, res) => {
    if(!req.file){
        return res.status(400).send({message: 'No files were uploaded.'});
    }

    try {
        const workbook = xlsx.read(req.file.buffer, {type: 'buffer'});
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = xlsx.utils.sheet_to_json(worksheet);
        res.json({message: 'File uploaded successfully', data: jsonData.length});
    }
    catch (error){
        console.error(`Error processing file: ${error}`);
        res.status(500).send({mesage: `Error processing file`});   
    }
});

export default router;