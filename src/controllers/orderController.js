const pool = require("../config/db");
const Order = require("../models/Order");

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

const createOrder = async (req,res) => {
	const { customer_id } = req.query;
	if (!customer_id) {
		return res.status(400).json({error: "Customer id is required." });
	}
	try {
		const result = await Order.createOrder(customer_id);
		if(result) {
			res.status(200).json(result);
		} else {
			res.status(404).json({ error: "Failed to create an order for customer." });
		}
	} catch (error) {
    	console.error("Error creating order:", error.message);
   		res.status(500).json({ error: "Internal Server Error" });
  	}
};

const deleteOrder = async(req,res) => {
	const {order_id} = req.query;
	if(!order_id) {
		return res.status(400).json({error: "Order id is required."});
	}
	try {
		const result = await Order.deleteOrder(order_id);
		if(result) {
			res.status(200).json({ message: `Order ${order_id} has been deleted.` });
		} else {
			res.status(404).json({ error: "Failed to delete order." });
		}
	} catch(error) {
		console.error("Error deleting order:", error.message);
		res.status(500).json({ error: "Internal server Error"});
	}
}

const getOrderId = async(req, res) => {
	const {customer_id} = req.query;
	if (!customer_id) {
		return res.status(400).json({error: "Customer id is required." });
	}
	try {
		const id = await Order.getOrderId(customer_id);
		if(id) {
			res.status(200).json(id);
		} else {
			res.status(404).json({ error: "Failed to get order id for customer." });
		}
	} catch (error) {
    	console.error("Error getting order id:", error.message);
   		res.status(500).json({ error: "Internal Server Error" });
  	}
};

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

const addToOrder = async (req, res) => {
  const { order_id, copy_id } = req.body;
  if (!order_id || !copy_id) {
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

const shipOrder = async (req, res) => {
	const { order_id } = req.query;
	if(!order_id) {
		return res.status(400).json({error: "Order id is required" });
	} 
	try {
		const result = await Order.shipOrder(order_id);
		if(result){
			res.status(200).json({ message: `Order ${order_id} has been shipped.` });
		} else {
      		res.status(404).json({ error: "Failed to ship the order." });
    	}
	} catch (error) {
    	console.error("Error shipping order:", error.message);
    	res.status(500).json({ error: "Internal Server Error" });
  	}
};

module.exports = {getOrderById, createOrder, deleteOrder, getOrderId, countShippingCosts, addToOrder, removeFromOrder, shipOrder};