const pool = require('../config/db');

const getErectionCost = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            return res.status(400).json({ error: "Missing 'id' parameter" });
        }

        const result = await pool.query(`SELECT * FROM erection_commissioning_pricing WHERE id = $1`, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No erection and commissioning cost found" });
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const getErectionCostTable = async (req, res) => {
    try {
        const response = await pool.query(`SELECT * FROM erection_commissioning_pricing ORDER BY id ASC`);
        res.json(response.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}

const updateEncCost = async (req, res) => {
    try {
        const id = req.query.id;
        const { structure_per_watt, earth_wire, main_wire, connection_wire, three_earthing_rod, lightning_arrester, insulator, acdb, dcdb, piping_and_accessories, labour_per_watt } = req.body;
        if (!id) {
            return res.status(400).json({ error: "Missing 'id' parameter" });
        }
        if (!structure_per_watt || !earth_wire || !main_wire || !connection_wire ||
            !three_earthing_rod || !lightning_arrester || !insulator ||
            !acdb || !dcdb || !piping_and_accessories || !labour_per_watt)
            return res.status(400).json({ error: "Missing required fields" });
        const result = await pool.query(`
            UPDATE erection_commissioning_pricing SET structure_per_watt = $1, earth_wire = $2, main_wire = $3, 
            connection_wire = $4, three_earthing_rod = $5, lightning_arrester = $6, insulator = $7, acdb = $8, 
            dcdb = $9, piping_and_accessories = $10, labour_per_watt = $11
            WHERE id = $12 RETURNING *`,
            [
                Number(structure_per_watt), Number(earth_wire), Number(main_wire), Number(connection_wire),
                Number(three_earthing_rod), Number(lightning_arrester), Number(insulator), Number(acdb),
                Number(dcdb), Number(piping_and_accessories), Number(labour_per_watt), Number(id)
            ]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    getErectionCost,
    getErectionCostTable,
    updateEncCost
};