const express = require('express');
const multer = require('multer');
const router = express.Router();
const { handleXMLUpload }= require('../controllers/xmlController');
const upload = multer({ dest: 'uploads/'});


router.post('/upload-xml', upload.single('file'), handleXMLUpload);

module.exports = router;