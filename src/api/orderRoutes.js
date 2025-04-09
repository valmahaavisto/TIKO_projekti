const express = require("express");
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/orders/getOrderById', (req, res) => {
	console.log('Incoming request: GET /api/orders/getOrderById');
	orderController.getOrderById(req, res);
});

router.post('/orders/createOrder', (req,res) => {
	console.log('Incoming request: POST /api/orders/createOrder');
	orderController.createOrder(req,res);
});

router.post('/orders/deleteOrder', (req,res) => {
	console.log('Incoming request: POST /api/orders/deleteOrder');
	orderController.deleteOrder(req,res);
});

router.get('/orders/getOrderId', (req,res) => {
	console.log('Incoming request. GET /api/orders/getOrderId');
	orderController.getOrderId(req,res);
});

router.get('/orders/countShippingCosts', (req, res) => {
	console.log('Incoming request: GET /api/orders/countShippingCosts');
	orderController.countShippingCosts(req,res); 
});

router.post('/orders/addToOrder', (req, res) => {
    console.log('Incoming request: POST /api/orders/addToOrder');
    orderController.addToOrder(req, res);
}); 

router.post('/orders/removeFromOrder', (req, res) => {
    console.log('Incoming request: POST /api/orders/removeFromOrder');
    orderController.removeFromOrder(req, res);
}); 

router.post('/orders/shipOrder', (req, res) => {
	console.log('Incoming request: POST /api/orders/shipOrder');
	orderController.shipOrder(req, res);
});

module.exports = router;