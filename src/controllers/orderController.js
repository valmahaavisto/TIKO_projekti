const pool = require("../config/db");
const Order = require("../models/Order");

const getAllOrders = async (req, res) => {
  try {
    const allOrders = await Order.getAllOrders();
    if (!allOrders) {
      return res.status(404).json({ error: "No orders found." });
    }
    res.json(allOrders);
  } catch (err) {
    console.error("Error fetching all orders:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

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
		console.error("Error getting order with id:", err.message);
		res.status(500).json({error: "Internal Server Error"});
	}
};

const countShippingCosts = async (req, res) => {
	const { copy_id } = req.query;
	if(!copy_id) {
		return res.status(400).json({error: "Copy id is required" });
	} 
	try {
		const costs = await Order.countShippingCosts(copy_id);
		if(costs) {
			res.status(200).json(costs);
		} else {
			res.status(404).json({error: "Costs not found"});
		}
	} catch (error) {
		console.error("Error countingt shiping costs:", err.message);
		res.status(500).json({error: "Internal Server Error" });

	}
};

const addToOrder = async (req, res) => {
  const { order_id, copy_id } = req.body;
  if (!order_id || !copy_id) {
    return res.status(400).json({ error: "Order id and copy id are required" });
  }

  try {
    const result = await Order.addToOrder(order_id, copy_id);
    if (result) {
      res.status(200).json({ message: `Book copy ${copy_id} added to order ${order_id}` });
    } else {
      res.status(404).json({ error: "Failed to add book copy to order" });
    }
  } catch (error) {
    console.error("Error adding book copy to order:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const removeFromOrder = async (req, res) => {
  const { order_id, copy_id } = req.body;
  if (!order_id || !copy_id) {
    return res.status(400).json({ error: "Order id and copy id are required" });
  }

  try {
    const result = await Order.removeFromOrder(order_id, copy_id);
    if (result) {
      res.status(200).json({ message: `Book copy ${copy_id} removed from order ${order_id}` });
    } else {
      res.status(404).json({ error: "Failed to remove book copy from order" });
    }
  } catch (error) {
    console.error("Error removing book copy from order:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  countShippingCosts,
  addToOrder,
  removeFromOrder
};