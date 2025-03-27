const pool = require('../config/db');

const getPanelBrands = async (req, res) => {
    try {
        const isDCR = req.query.isDCR === 'true';
        const query = `
            SELECT DISTINCT name 
            FROM panel_brands
            WHERE is_dcr = ${isDCR}
        `;
        const result = await pool.query(query);
        const brands = result.rows.map(row => row.name)
        res.json(brands);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const getPanelCapacityVariants = async (req, res) => {
    try {
        const isDCR = req.query.isDCR === 'true';
        const panelBrand = req.query.panelBrand;
        const result = await pool.query(`
            SELECT DISTINCT pp.capacity_variant
            FROM panel_pricings pp
            JOIN panel_brands pb ON pp.panel_brand_id = pb.id
            WHERE pb.is_dcr = $1 AND pb.name = $2
        `, [isDCR, panelBrand]);

        res.json(result.rows.map(row => row.capacity_variant));
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const getPanelCost = async (req, res) => {
    try {
        const { isDCR, panelBrand, capacity_variant } = req.query;
        const result = await pool.query(`
            SELECT pp.price_per_watt 
            FROM panel_pricings pp
            JOIN panel_brands pb ON pp.panel_brand_id = pb.id
            WHERE pb.is_dcr = $1 AND pb.name = $2 AND pp.capacity_variant = $3
        `, [isDCR === 'true', panelBrand, Number(capacity_variant)]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No panel cost found" });
        }

        res.json(Number(result.rows[0].price_per_watt));
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const getAllPanelBrands = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT name AS "PanelBrand", is_dcr AS "isDCR"
            FROM panel_brands
            ORDER BY
            name ASC;
            `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const getPanelPriceTable = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
            pp.id AS "id", 
            pb.is_dcr AS "isDCR", 
            pb.name AS "panelBrand", 
            pp.capacity_variant AS "panelCapacity", 
            pp.price_per_watt AS "pricePerWatt"
            FROM panel_pricings pp
            JOIN panel_brands pb ON pp.panel_brand_id = pb.id
            ORDER BY 
                pb.name ASC, 
                pb.is_dcr DESC;`)
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const getPanelBrandTable = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name AS "panelBrand", is_dcr AS "isDCR" FROM panel_brands
            ORDER BY
             name ASC,
             is_dcr DESC;`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const updatePanelDetails = async (req, res) => {
    try {
        const { price } = req.body;
        const id = req.query.id;

        const result = await pool.query(`
                UPDATE panel_pricings
                SET  price_per_watt = $1
                WHERE id = $2
                RETURNING *`, [Number(price), Number(id)]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Panel not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};


const addCapacityVariantToExistingPanelBrand = async (req, res) => {
    try {
        const { panel_brand_id, capacity, price } = req.body;
        if (panel_brand_id == "") {
            res.status(200).send("Nothing to add")
            return;
        }
        if (!Array.isArray(capacity) || !Array.isArray(price) || capacity.length !== price.length) {
            return res.status(400).json({ error: "The 'capacity' and 'price' arrays must have the same length." });
        }
        const values = capacity
            .map((cap, index) => {
                if (cap === '') return '';
                return `(${panel_brand_id}, ${Number(cap)}, ${Number(price[index])})`;
            }).filter(entry => entry !== '').join(',');
        if (values.length == 0) {
            res.status(200).send("Nothing to add")
            return;
        }
        const result = await pool.query(`INSERT INTO panel_pricings ( panel_brand_id, capacity_variant, price_per_watt)
                VALUES ${values}`);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};



const deletePanelDetails = async (req, res) => {
    try {
        const id = req.query.id;
        const result = await pool.query(`
            DELETE FROM panel_pricings
            WHERE id = $1
            RETURNING id, panel_brand_id AS "PanelBrandId", capacity_variant AS "PanelCapacity", price_per_watt AS "PricePerWatt";
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Panel not found" });
        }

        res.status(200).json({ message: "Panel deleted successfully", data: result.rows[0] });
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};


const addPanelBrand = async (req, res) => {
    try {
        const { name, isDCR } = req.body;
        const result = await pool.query(`
            INSERT INTO panel_brands (name, is_dcr) 
            VALUES ($1,$2) 
            RETURNING id, name AS "PanelBrand", is_dcr as "isDCR";
        `, [name, isDCR]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};


const updatePanelBrand = async (req, res) => {
    try {
        const { panelBrand, isDCR } = req.body;
        const id = req.params.id;
        const result = await pool.query(`
            UPDATE panel_brands 
            SET name = $1, isDCR = $3  
            WHERE id = $2
            RETURNING id, name AS "PanelBrand", is_dcr AS "isDCR";
        `, [panelBrand, id, isDCR]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Panel brand not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};


const deletePanelBrand = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid brand ID" });
        }
        const result = await pool.query(
            `DELETE FROM panel_brands WHERE id = $1 
            RETURNING id, name AS "PanelBrand", is_dcr AS "isDCR"`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Panel brand not found" });
        }

        res.json({ message: "Panel brand deleted successfully", data: result.rows[0] });
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};

const getAllCapacitesAsPerPanelBrandId = async (req, res) => {
    try {
        const { id } = req.query;
        const query = `SELECT capacity_variant FROM panel_pricings WHERE panel_brand_id = ${Number(id)}`
        const result = await pool.query(query);
        const variants = result.rows.map(row => row.capacity_variant)
        res.json(variants);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = {
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
};