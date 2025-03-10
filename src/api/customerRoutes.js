const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

//router.use(express.json());


router.get('/customers/:sposti', (req, res) => {
    console.log(`Incoming request: GET /api/customers/${req.params.sposti}`);
    customerController.getCustomerByEmail(req, res);
});

// HÄIKKÄÄ TÄSSÄ??
router.post('/customers/login', (req, res) => {
    console.log('Incoming request: POST /api/customers/login');
    customerController.getCustomerByEmailPassword(req, res);
});

router.get('/customers', (req, res) => {
    console.log(`Incoming request: GET /api/customers}`);
    customerController.getCustomers(req, res);   
})


module.exports = router;