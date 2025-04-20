const express = require('express');
const { generateFile, previewFile, generateQuotation} = require('../controllers/docxController');
const router = express.Router();

router.get('/preview', previewFile);
router.post('/generate-file', generateFile);
router.post('/generateQuotation', generateQuotation);

module.exports = router;