const pool = require('../config/db');

// Not needed, for testing
const getCustomerByEmail = async (email) => {
    console.log(`Fetching the customer with email ${email}.`);
    try {
        const result = await pool.query('SELECT * FROM Customer WHERE email = $1', [email]);
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


const getCustomerLogin = async (email, password) => {
    try {
        const result = await pool.query('SELECT * FROM Customer WHERE email = $1 AND password = $2', [email, password]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.log('Error in customer login: ', error)
        throw error;
    }
};

const registerNewCustomer = async (name, address, postalCode, email, password) => {
    try {
        const result = await pool.query(
            'INSERT INTO Customer (name, address, postal_code, email, password) VALUES ($1, $2, $3, $4, $5)',
            [name, address, postalCode, email, password]
        );
        if (result.rowCount > 0) {
            return {
                success: true,
                message: "Registration successful!"
            };
        } else {
            return {
                success: false,
                message: "Registration failed."
            };
        }
    } catch (error) {
        console.log('Error in customer registration: ', error)
        throw error;
    }
};


// get last year orders grouped by customer
const getR3 = async () => {
    try {
        const result = await pool.query(`
            SELECT
                Customer.customer_id AS asiakastunnus,
                Customer.name AS nimi,
                count(*) as lkm
            FROM
                Customer
            INNER JOIN
                BookOrder
            ON
                Customer.customer_id = BookOrder.customer_id
            WHERE
                confirmation_time >= DATE(EXTRACT(YEAR FROM CURRENT_DATE) - 1 || '-01-01') 
                AND confirmation_time < DATE(EXTRACT(YEAR FROM CURRENT_DATE) || '-01-01')
                AND confirmation_time IS NOT NULL
            GROUP BY
                Customer.customer_id, Customer.name
            ORDER BY
                Customer.name ASC;
            `);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows;
    } catch (error) {
        console.log('Error fetching R3: ', error)
        throw error;
    }
};

// Not needed, for testing
const getAllCustomers = async () => {
    try {
        const result = await pool.query('SELECT * FROM Customer ORDER BY customer_id');
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows;
    } catch (error) {
        console.log('Error fetching all customers: ', error)
        throw error;
    }
};

module.exports = {getCustomerByEmail, getCustomerLogin, registerNewCustomer, getR3, getAllCustomers};