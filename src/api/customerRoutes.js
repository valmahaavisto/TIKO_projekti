const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/customers/:sposti', (req, res) => {
    console.log(`Incoming request: GET /api/customers/${req.params.sposti}`);
    customerController.getCustomerEmail(req, res);
});

module.exports = router;