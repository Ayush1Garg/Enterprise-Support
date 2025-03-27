const express = require('express');
const { getInverterBrandsBasedOnPanelBrands,
    getInverterCostBasedOnInverterBrandAndCapacity,
    getAllInverterBrands,
    getAllInverters,
    getInverterBrandTable,
    getInverterPanelCompatibilityTable,
    getAllCapacitesAsPerInverterBrand,
    checkPanelInverterCombinationPresence,
    addInverterBrand,
    addCapacityVariantToExistingInverterBrand,
    addInverterPanelCombination,
    deleteInverterBrand,
    deleteInverterCapacityVariant,
    deleteInverterPanelCombination,
    updateInverterPrice
} = require('../controllers/inverterController');
const router = express.Router();

//GET Routes
router.get('/invBrandsBasedOnPanelBrands', getInverterBrandsBasedOnPanelBrands);
router.get('/inverterCostBasedOnInverterBrandAndCapacity', getInverterCostBasedOnInverterBrandAndCapacity);
router.get('/allInverterBrands', getAllInverterBrands);
router.get('/allInverters', getAllInverters);
router.get('/inverterBrandTable', getInverterBrandTable);
router.get('/getInverterPanelCompatibilityTable', getInverterPanelCompatibilityTable);
router.get('/getAllCapacitesAsPerInverterBrand', getAllCapacitesAsPerInverterBrand);
router.get('/checkPanelInverterCombinationPresence', checkPanelInverterCombinationPresence)

//POST Routes
router.post('/addCapacityVariantToExistingInverterBrand', addCapacityVariantToExistingInverterBrand)
router.post('/addInverterBrands', addInverterBrand)
router.post('/addInverterPanelCombination', addInverterPanelCombination)

//PUT
router.put('/updatePriceOfExistingInverter', updateInverterPrice)

//DELETE
router.delete('/deleteInverterBrand', deleteInverterBrand)
router.delete('/deleteInverterCapacityVariant', deleteInverterCapacityVariant)
router.delete('/deleteInverterPanelCombination', deleteInverterPanelCombination)

module.exports = router;
