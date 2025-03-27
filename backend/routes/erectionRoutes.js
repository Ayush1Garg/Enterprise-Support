const express = require('express');
const {
    getErectionCost,
    getErectionCostTable,
    updateEncCost
} = require('../controllers/erectionController');
const router = express.Router();

// GET Routes
router.get('/erection_and_commissioning_cost', getErectionCost);
router.get('/erectionCommissioningCostTable', getErectionCostTable);

// PUT Routes
router.put('/updateEncCost', updateEncCost);

module.exports = router;
