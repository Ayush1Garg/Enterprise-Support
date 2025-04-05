const express = require('express');
const { generateFile, previewFile, generateModelAgreement } = require('../controllers/docxController');
const router = express.Router();

router.get('/preview', previewFile);
router.post('/generate-file', generateFile);
router.post('/generateModelAgreement', generateModelAgreement);

module.exports = router;