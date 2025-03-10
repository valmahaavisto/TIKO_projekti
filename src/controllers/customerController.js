const Customer = require('../models/Customer');


const getCustomerByEmail = async (req, res) => {
    console.log(`Received GET request: /api/customers/${req.params.sposti}`);
    try {
        const customerEmail = await Customer.getCustomerByEmail(req.params.sposti);
        if (!customerEmail) {
            console.log('Customer not found by email ${req.params.sposti}.');
            return res.status(404).json({ error: 'Customer not found' });
        }
        console.log('Sending the data to client:', customerEmail);
        res.json(customerEmail);
    } catch (error) {
         console.log('Error fetching customer by email:', error);
         res.status(500).json({error: 'Internal Server Error'});   
    }
};


const getCustomerByEmailPassword = async (req, res) => { 
    const { sposti, salasana } = req.body;
    if (!sposti || !salasana) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
    try {
        const customer = await Customer.getCustomerByEmailPassword(sposti, salasana);
        if (!customer) {
            console.log('Customer not found by email: ${sposti} and password: ${salasana}.');
            return res.status(404).json({ error: 'Customer not found' });
        }
        console.log('Sending the data to client:', customer);
        res.json({ message: 'Login successful', customer });
    } catch (error) {
        console.log('Error fetching customer by email and password:', error);
        res.status(500).json({error: 'Internal Server Error'});   
    }
};


const getCustomers = async (req, res) => {
    try {
        allCustomers = await Customer.getAllCustomers();
        if (! allCustomers) {
            return res.status(404).json({ error: 'Not found all customers.' });
        }
        res.json(allCustomers)     
    } catch (error) {
        console.log('Error fetching all customers: ', error);
        res.status(500).json({error: 'Internal Server Error'});   
  } 
};

module.exports = { getCustomerByEmail, getCustomerByEmailPassword, getCustomers };