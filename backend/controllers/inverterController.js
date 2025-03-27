const pool = require('../config/db');

const getInverterBrandsBasedOnPanelBrands = async (req, res) => {
    try {
        const panelBrand = req.query.panelBrand;
        const isDCR = req.query.isDCR == 'true';

        const panelBrandIdResult = await pool.query(`
            SELECT id FROM panel_brands WHERE name = $1 AND is_dcr = $2
        `, [panelBrand, isDCR]);

        const panelBrandIds = panelBrandIdResult.rows.map(row => row.id);
        if (panelBrandIds.length === 0) return res.json([]);

        const inverterBrandIdResult = await pool.query(`
            SELECT inverter_brand_id FROM inverter_with_panel WHERE panel_brand_id = ANY($1)
        `, [panelBrandIds]);

        const inverterBrandIds = inverterBrandIdResult.rows.map(row => row.inverter_brand_id);
        if (inverterBrandIds.length === 0) return res.json([]);

        const inverterBrandNameResult = await pool.query(`
            SELECT DISTINCT name FROM inverter_brands WHERE id = ANY($1)
        `, [inverterBrandIds]);

        res.json(inverterBrandNameResult.rows.map(row => row.name));
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const getAllInverterBrands = async (req, res) => {
    try {
        const inverterBrandNameResult = await pool.query(`
            SELECT DISTINCT name AS "Inverter_Brand" FROM inverter_brands
            `);
        res.json(inverterBrandNameResult.rows.map(row => row.Inverter_Brand));
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}

const getInverterCostBasedOnInverterBrandAndCapacity = async (req, res) => {
    try {
        const { inverterBrand, inverterCapacity } = req.query;
        const result = await pool.query(`
            SELECT ip.price 
            FROM inverter_pricings ip
            JOIN inverter_brands ib ON ip.inverter_brand_id = ib.id
            WHERE ib.name = $1 AND ip.capacity = $2
        `, [inverterBrand, Number(inverterCapacity)]);

        if (result.rows.length === 0) return res.status(404).json({ error: "No inverter cost found" });

        res.json(Number(result.rows[0].price));
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const getInverterBrandTable = async (req, res) => {
    try {
        const result = await pool.query(`SELECT id, name AS "Inverter_Brand_Name" FROM inverter_brands`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}

const getAllInverters = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT ip.id,  ib.name AS "Inverter_Brand", ip.price, ip.capacity
            FROM inverter_pricings ip
            JOIN inverter_brands ib ON ip.inverter_brand_id = ib.id
            ORDER BY
                ib.name ASC,
                ip.capacity ASC
            `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}

const getInverterPanelCompatibilityTable = async (req, res) => {
    try {
        const response = await pool.query(`
            SELECT ipc.id AS "id",  ib.name AS "inverterBrandName", pb.name AS "panelBrandName",
            pb.is_dcr AS "isDCR"
            FROM inverter_with_panel ipc
            JOIN inverter_brands ib ON ipc.inverter_brand_id = ib.id
            JOIN panel_brands pb ON ipc.panel_brand_id = pb.id
            ORDER BY ib.name ASC, pb.name ASC;`);
        res.json(response.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}

const checkPanelInverterCombinationPresence = async (req, res) => {
    try {
        const { inverterBrandId, panelBrandId } = req.query;
        const result = await pool.query(`
            SELECT id FROM inverter_with_panel
            WHERE inverter_brand_id = $1 AND panel_brand_id = $2
            `, [Number(inverterBrandId), Number(panelBrandId)]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}

const addInverterPanelCombination = async (req, res) => {
    try {
        const { inverterBrandId, panelBrandId } = req.body;
        if (inverterBrandId == "" || panelBrandId == "") {
            res.status(400).send('Invalid request');
            return;
        }
        const response = await pool.query(`INSERT INTO inverter_with_panel (inverter_brand_id, panel_brand_id)
        VALUES ($1,$2) RETURNING *`, [Number(inverterBrandId), Number(panelBrandId)]);
        res.json(response.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}

const addInverterBrand = async (req, res) => {
    try {
        const { name } = req.body;
        const result = await pool.query(`INSERT INTO inverter_brands (name) VALUES ($1)
            RETURNING *`, [name]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}

const addCapacityVariantToExistingInverterBrand = async (req, res) => {
    try {
        const { name, capacity, price } = req.body;
        if (name == "") {
            res.status(200).send("Nothing to add")
            return;
        }
        if (!Array.isArray(capacity) || !Array.isArray(price) || capacity.length !== price.length) {
            return res.status(400).json({ error: "The 'capacity' and 'price' arrays must have the same length." });
        }
        const inverterBrandIdResult = await pool.query(`SELECT id from inverter_brands WHERE name=$1`, [name]);
        const inverterBrandId = inverterBrandIdResult.rows[0].id;
        const values = capacity
            .map((cap, index) => {
                if (cap === '') return '';
                return `(${inverterBrandId}, ${Number(cap)}, ${Number(price[index])})`;
            }).filter(entry => entry !== '').join(',');
        if (values.length == 0) {
            res.status(200).send("Nothing to add")
            return;
        }
        const result = await pool.query(`INSERT INTO inverter_pricings (inverter_brand_id,capacity,price) VALUES ${values}`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}

const getAllCapacitesAsPerInverterBrand = async (req, res) => {
    try {
        const name = req.query.name;
        const query = `
        SELECT ip.capacity FROM inverter_pricings ip JOIN inverter_brands ib ON ip.inverter_brand_id = ib.id WHERE ib.name = '${name}'
        `
        const response = await pool.query(query);
        res.json(response.rows.map(row => row.capacity));
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}

const deleteInverterBrand = async (req, res) => {
    try {
        const id = req.query.id;
        const result = await pool.query(`DELETE FROM inverter_brands WHERE id = $1 RETURNING *`, [Number(id)]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
}

const deleteInverterCapacityVariant = async (req, res) => {
    try {
        const id = req.query.id;
        const response = await pool.query(`DELETE FROM inverter_pricings WHERE id = $1 RETURNING *`, [Number(id)]);
        const responseData = response.rows[0];
        res.json(responseData);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
}

const updateInverterPrice = async (req, res) => {
    try {
        const id = req.query.id;
        const { price } = req.body;
        const result = await pool.query(`UPDATE inverter_pricings SET price = $1 WHERE
            id = $2 RETURNING *`, [Number(price), Number(id)]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}

const deleteInverterPanelCombination = async (req, res) => {
    try {
        const id = req.query.id;
        if (id == "" || typeof (id) == "undefined") {
            res.status(400).send('Invalid request');
            return;
        }
        const result = await pool.query(`DELETE FROM inverter_with_panel WHERE id = $1 RETURNING *`, [Number(id)]);
        res.json(result.rows);
    } catch (erer) {
        console.error('Error executing query', erer);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    getInverterBrandsBasedOnPanelBrands,
    getAllInverterBrands,
    getInverterCostBasedOnInverterBrandAndCapacity,
    getInverterBrandTable,
    getAllInverters,
    getInverterPanelCompatibilityTable,
    getAllCapacitesAsPerInverterBrand,
    checkPanelInverterCombinationPresence,
    addInverterBrand,
    addCapacityVariantToExistingInverterBrand,
    addInverterPanelCombination,
    deleteInverterBrand,
    updateInverterPrice,
    deleteInverterPanelCombination,
    deleteInverterCapacityVariant
};