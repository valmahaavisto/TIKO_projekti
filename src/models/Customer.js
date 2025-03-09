const pool = require('../config/db');

const getCustomerByEmail = async (sposti) => {
    console.log(`Fetching the customer with email ${sposti}.`);
    try {
        const result = await pool.query('SELECT * FROM Asiakas WHERE sposti = $1', [sposti]);
        if (result.rows.length === 0) {
            console.log('No customer found with this email.');
            return null;
        }
        console.log('Found the customer with email:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.log('Error fetching the customer by email: ', error)
        throw error;
    }
};

module.exports = {getCustomerByEmail};