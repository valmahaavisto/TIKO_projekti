const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

//router.use(express.json());


router.get('/customers/export-r3', (req, res) => {
    console.log('Incoming request: GET /api/customers/export-r3');
    customerController.getR3(req, res);
});


router.get('/customers/:email', (req, res) => {
    console.log(`Incoming request: GET /api/customers/${req.params.email}`);
    customerController.getCustomerByEmail(req, res);
});


router.post('/customers/login', (req, res) => {
    console.log('Incoming request: POST /api/customers/login');
    customerController.getCustomerLogin(req, res);
});


router.post('/customers/register', (req, res) => {
    console.log('Incoming request: POST /api/customers/register');
    customerController.registerCustomer(req, res);
});


router.get('/customers', (req, res) => {
    console.log(`Incoming request: GET /api/customers}`);
    customerController.getCustomers(req, res);   
})


module.exports = router;