const pool = require("../config/db");
const Order = require("../models/Order");

// tested and works
const getAllOrders = async (req, res) => {
	console.log("Fetching all orders...");
 	try {
    	const allOrders = await Order.getAllOrders();
    	if (!allOrders) {
      		return res.status(404).json({ error: "No orders found." });
    	}
    	res.json(allOrders);
  	} catch (error) {
    	console.error("Error fetching all orders:", error.message);
    	res.status(500).json({ error: "Internal Server Error" });
  	}
};


// tested and works
const getOrderById = async (req, res) => {
	const { order_id } = req.query;
	if(!order_id) {
		return res.status(400).json({error: "Order id is required" });
	}
	try {
		const order = await Order.getOrderById(order_id);
		if(order) {
			res.status(200).json(order);
		} else { 
			res.status(404).json({error: "Order not found"});
		}
	} catch (error) {
		console.error("Error getting order with id:", error.message);
		res.status(500).json({error: "Internal Server Error"});
	}
};

// creates the order but check the return value
const createOrder = async (req,res) => {
	const { customer_id } = req.query;
	if (!customer_id) {
		return res.status(400).json({error: "Customer id is required." });
	}
	try {
		const result = await Order.createOrder(customer_id);
		if(result) {
			res.status(200).json({ message: `Order created for customer ${customer_id}.` });
		} else {
			res.status(404).json({ error: "Failed to create an order for customer." });
		}
	} catch (error) {
    	console.error("Error creating order:", error.message);
   		res.status(500).json({ error: "Internal Server Error" });
  	}
};

//not tested
const countShippingCosts = async (req, res) => {
	const { order_id } = req.query;
	if(!order_id) {
		return res.status(400).json({error: "Order id is required" });
	} 
	try {
		const costs = await Order.countShippingCosts(order_id);
		if(costs) {
			res.status(200).json(costs);
		} else {
			res.status(404).json({error: "Costs not found"});
		}
	} catch (error) {
		console.error("Error countingt shiping costs:", error.message);
		res.status(500).json({error: "Internal Server Error" });

	}
};

// tested and working
const addToOrder = async (req, res) => {
  const { order_id, copy_id } = req.body;
  if (!order_id || !copy_id) {
	console.log("Order ID or Copy ID is missing"); // for testing
    return res.status(400).json({ error: "Order id and copy id are required." });
  }
  try {
    const result = await Order.addToOrder(order_id, copy_id);
    if (result) {
      return res.status(200).json({ message: `Book copy ${copy_id} added to order ${order_id}.` });
    } else {
      return res.status(404).json({ error: "Failed to add book copy to order." });
    }
  } catch (error) {
    console.error("Error adding book copy to order:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


//tested and works
const removeFromOrder = async (req, res) => {
  const { copy_id } = req.query;
  if (!copy_id) {
    return res.status(400).json({ error: "Copy id is required." });
  }
  try {
    const result = await Order.removeFromOrder(copy_id);
    if (result) {
      res.status(200).json({ message: `Book copy ${copy_id} removed from order.` });
    } else {
      res.status(404).json({ error: "Failed to remove book copy from order." });
    }
  } catch (error) {
    console.error("Error removing book copy from order:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {getAllOrders, getOrderById, createOrder, countShippingCosts, addToOrder, removeFromOrder};