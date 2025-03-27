const express = require('express');
const {
    getPanelBrands,
    getAllPanelBrands,
    getPanelCapacityVariants,
    getPanelCost,
    getPanelPriceTable,
    getPanelBrandTable,
    updatePanelDetails,
    addCapacityVariantToExistingPanelBrand,
    deletePanelDetails,
    addPanelBrand,
    updatePanelBrand,
    deletePanelBrand,
    getAllCapacitesAsPerPanelBrandId
} = require('../controllers/panelController');

const router = express.Router();

// GET Routes
router.get('/panelBrands', getPanelBrands);
router.get('/allPanelBrands', getAllPanelBrands);
router.get('/panelCapacityVariants', getPanelCapacityVariants);
router.get('/panel_cost', getPanelCost);
router.get('/getPanelPriceTable', getPanelPriceTable)
router.get('/getPanelBrandsTable', getPanelBrandTable)
router.get('/getAllCapacitesAsPerPanelBrandId', getAllCapacitesAsPerPanelBrandId) //

// POST Routes (Adding new data)
router.post('/addPanelBrand', addPanelBrand); //
router.post('/addCapacityVariantToExistingPanelBrand', addCapacityVariantToExistingPanelBrand);

// PUT Routes (Updating existing data)
router.put('/panelBrandsTable/:id', updatePanelBrand);
router.put('/updatePriceOfExistingPanelCapacityVariant', updatePanelDetails);

// DELETE Routes (Removing data)
router.delete('/panelBrandsTable/:id', deletePanelBrand);
router.delete('/deletePanelCapacityVariant', deletePanelDetails);

module.exports = router;