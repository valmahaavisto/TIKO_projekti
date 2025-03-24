const Customer = require('../models/Customer');



const getR3 = async (req, res) => {
    try {
        const data = await Customer.getR3();
        if (data === null) {
            console.log('No data found for R3.');
            return res.status(204).send();
        }
        const headers = ['asiakastunnus', 'nimi', 'lkm'];
        const rows = (data || []).map(row => `${row.asiakastunnus},${row.nimi},${row.lkm}`); // tsekkaa matchaako kyselyn kans
        const csvContent = [headers.join(','), ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="raportti3.csv"');
        console.log('R3 CSV created successfully.');
        res.send(csvContent);
    } catch (error) {
        console.log('Error fetching R3: ', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};


const getCustomerByEmail = async (req, res) => {
    console.log(`Received GET request: /api/customers/${req.params.email}`);
    try {
        const customer = await Customer.getCustomerByEmail(req.params.email);
        if (!customer) {
            console.log('Customer not found by email ${req.params.email}.');
            return res.status(404).json({ error: 'Customer not found' });
        }
        console.log('Sending the data to client:', customer);
        res.json(customer);
    } catch (error) {
         console.log('Error fetching customer by email:', error);
         res.status(500).json({error: 'Internal Server Error'});   
    }
};


const getCustomerLogin = async (req, res) => { 
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
    try {
        const customer = await Customer.getCustomerLogin(email, password);
        if (!customer) {
            console.log('Customer not found by email: ${email} and password: ${password}.');
            return res.status(404).json({ error: 'Customer not found' });
        }
        console.log('Sending the data to client:', customer);
        res.json({ message: 'Login successful', customer });
    } catch (error) {
        console.log('Error fetching customer by email and password:', error);
        res.status(500).json({error: 'Internal Server Error'});   
    }
};


const registerCustomer = async (req, res) => {
    const { name, address, postalCode, email, password } = req.body;
    if (!name || !address || !postalCode || !email || !password) {
        return res.status(400).json({ error: 'Some registration data is missing.' });
      }
    try {
        const registration = await Customer.registerNewCustomer(name, address, postalCode, email, password);
        if (registration.success) {
            return res.status(201).json({
                success: true,
                message: registration.message,
            });
        } else {
            return res.status(400).json({
                success: false,
                error: registration.message,
            });
        }
    } catch (error) {
        console.log('Error with new customer register:', error);
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

module.exports = { getR3, getCustomerByEmail, getCustomerLogin, registerCustomer, getCustomers };