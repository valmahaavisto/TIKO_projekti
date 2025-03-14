const express = require("express");
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/orders', (req, res) => {
    console.log('Incoming request: GET /api/orders');
    orderController.getAllOrders(req, res);
}); 

router.get('/orders/getOrderById', (req, res) => {
	console.log('Incoming request. GET /api/orders/getOrderById');
	orderController.getOrderById(req, res);
});

router.get('/orders/countShippingCosts', (req, res) => {
	console.log('Incoming request. GET /api/orders/countShippingCosts');
	orderController.countShippingCosts(req,res); 
});

router.get('/orders/addToOrder', (req, res) => {
    console.log('Incoming request: GET /api/orders/addToOrder');
    orderController.addToOrder(req, res);
}); 

router.get('/orders/removeFromOrder', (req, res) => {
    console.log('Incoming request: GET /api/orders/removeFromOrder');
    orderController.removeFromOrder(req, res);
}); 

// coming
// router.get('/orders/shipOrder', (req, res) => {
//     console.log('Incoming request: GET /api/orders/shipOrder');
//     orderController.shipOrder(req, res);
// });

module.exports = router;