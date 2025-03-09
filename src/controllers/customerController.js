const Customer = require('../models/Customer');

const getCustomerEmail = async (req, res) => {
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

module.exports = {getCustomerEmail};