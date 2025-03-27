const express = require('express');
const { generateFile, previewFile } = require('../controllers/docxController');
const router = express.Router();

router.get('/preview', previewFile);
router.post('/generate-file', generateFile);

module.exports = router;