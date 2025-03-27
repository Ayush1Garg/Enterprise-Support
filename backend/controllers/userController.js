const pool = require('../config/db');

const authenticateLogin = async (req, res) => {
    try {
        const { user_name, passkey } = req.query;
        // console.log(user_name, passkey);
        const result = await pool.query(`SELECT * FROM login_details WHERE name = $1 AND passkey = $2`, [user_name, passkey]);
        // console.log(result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { authenticateLogin };