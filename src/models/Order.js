const pool = require('../config/db');
const Book = require("../models/Book");

const getAllOrders = async () => {
    try {
        const orderCheck= await pool.query('SELECT * FROM BookOrder ORDER BY order_id');
		console.log(orderCheck.rows); // for tests
        if (orderCheck.rows.length === 0) {
            console.log('No orders found.');
            return null;
        }
        return orderCheck.rows;
    } catch (error) {
        console.log('Error fetching all orders: ', error);
        throw error;
    }
};

const getOrderById = async (order_id) => {
   try {
        const orderCheck = await pool.query('SELECT * FROM BookOrder WHERE order_id = $1', [order_id]);
        if (orderCheck.rows.length === 0) {
            console.log(`Order ${order_id} does not exist.`);
            return null;
        }
        console.log('Found the order with id:', orderCheck.rows[0]);
        const booksInOrder = await pool.query('SELECT copy_id, book_id FROM BookCopy WHERE order_id = $1', [order_id]);
		if (booksInOrder.rows.length === 0) {
			console.log(`No books in order ${order_id}.`); 
			return [];
		}
		return booksInOrder.rows;
    } catch (error) {
        console.log('Error fetching the order by id: ', error)
        throw error;
    }
};


const createOrder = async (customer_id) => {
	try {
		const customer_id_result = await pool.query('SELECT name FROM Customer WHERE customer_id = $1', [customer_id]);
		if(customer_id_result.rows.length > 0) {
			const result = await pool.query(`INSERT INTO BookOrder (customer_id, confirmation_time, status, total_weight, costs) VALUES
				($1, DEFAULT, 0, 0.00, 0.00)`, [customer_id]);
            console.log(`Order created for customer ${customer_id}.`);
			return true;

        } else {
            console.log('The customer id does not exist.');
			return null;
        }    
    } catch (error) {
        console.log('Error creating order.', error);
        throw error;
    }
};


// for single shipment, to be updated
const countShippingCosts = async (order_id) => {
    try {
        const orderCheck = await pool.query('SELECT * FROM BookOrder WHERE order_id = $1', [order_id]);
    	if (orderCheck.rows.length === 0) {
			console.log(`Order ${order_id} does not exist.`);
			return null;
    	} 
        const total_weight = orderCheck.rows[0].total_weight;
		if (total_weight > 0) {
			const weight_limits_result = await pool.query('SELECT weight_limit FROM ShippingRates WHERE weight_limit >= $1 ORDER BY weight_limit ASC LIMIT 1', [total_weight]);
        	if (weight_limits_result.rows.length > 0) {
           		const weight_limit = weight_limits_result.rows[0].weight_limit;
            	const shipping_rate_result = await pool.query('SELECT price FROM ShippingRates WHERE weight_limit = $1', [weight_limit]);
            	const shipping_cost = shipping_rate_result.rows[0].price;
				await pool.query('UPDATE BookOrder SET costs = $1 WHERE order_id = $2', [shipping_cost, order_id]);
            	console.log(`The shipping cost for order ${order_id} is ${shipping_cost} based on a total weight of ${total_weight} kg.`);
            	return shipping_cost;
        	} else {
            	// weight over the limits
				console.log(`Weight ${total_weight} is too much to send in one shipment`)
            	return null;
        	}
		} else {
			console.log(`The order ${order_id} does not have any items.`);
			return "0.00";
		}
    } catch (error) {
        console.log('Error counting shipment costs:', error);
        throw error;
    }
};

const addToOrder = async (order_id, copy_id) => {
    try {
		const orderCheck = await pool.query('SELECT * FROM BookOrder WHERE order_id = $1', [order_id]);
    	if (orderCheck.rows.length === 0) {
			console.log(`Order ${order_id} does not exist.`);
			return false;
    	} 
		const copyCheck = await pool.query('SELECT * FROM BookCopy WHERE copy_id = $1', [copy_id]);
		if (copyCheck.rows.length === 0){
			console.log(`Book copy ${copy_id} does not exist.`);
			return false;
		}
        const status = copyCheck.rows[0].status;
		if (status === 0) {
            const book_id = copyCheck.rows[0].book_id;
            // const weight = await Book.getBookWeightById(book_id);
			const weight = 0.25; // for testing
            await pool.query('UPDATE BookOrder SET total_weight = total_weight + $1 WHERE order_id = $2', [weight, order_id]);
            await pool.query('UPDATE BookCopy SET status = 1, order_id = $1 WHERE copy_id =$2', [order_id, copy_id]);
            console.log(`Book copy ${copy_id} added to order ${order_id}.`);
			return true;
        } else {
            console.log(`Book copy ${copy_id} is not free, status is ${status}.`);
			return false;
        }    
    } catch (error) {
        console.log('Error adding book copy to order.', error);
        throw error;
    }
};

const removeFromOrder = async (copy_id) => {
    try {
        const copyCheck = await pool.query('SELECT * FROM BookCopy WHERE copy_id = $1', [copy_id]);
		if (copyCheck.rows.length === 0){
			console.log(`Book copy ${copy_id} does not exist.`);
			return false;
		}
        const status = copyCheck.rows[0].status;
        const order_id = copyCheck.rows[0].order_id;
        if (status === 1 && order_id !== null) {
            const book_id = copyCheck.rows[0].book_id;
            // const weight = await Book.getBookWeightById(book_id);
			const weight = 0.25; // for testing
            await pool.query ('UPDATE BookOrder SET total_weight = total_weight - $1 WHERE order_id = $2', [weight, order_id]);
            await pool.query('UPDATE BookCopy SET status = 0, order_id = NULL WHERE copy_id = $1', [copy_id]);
            console.log(`Book copy ${copy_id} removed from the order ${order_id}.`);
            return true;
        } else {
            console.log('The book copy is not in order.');
            return false;
        }
    } catch (error) {
        console.log('Error removing book copy from order.');
        throw error;
    }
};


const shipOrder = async (order_id) => {
	try {
		const orderCheck = await pool.query('SELECT * FROM BookOrder WHERE order_id = $1', [order_id]);
    	if (orderCheck.rows.length === 0) {
			console.log(`Order ${order_id} does not exist.`);
			return false;
    	}
		const itemCheck = await pool.query('SELECT copy_id FROM BookCopy WHERE order_id = $1', [order_id]);
		if (itemCheck.rows.length === 0) {
			console.log(`Order ${order_id} does not have any items.`);
			return false;
		}
		const status = orderCheck.rows[0].status;
		if(!status) {
			await pool.query ('UPDATE BookOrder SET status = 1 WHERE order_id = $1', [order_id]);
			const copyIds = itemCheck.rows.map(row => row.copy_id);
            await pool.query('UPDATE BookCopy SET status = 2 WHERE copy_id = ANY($1::int[])', [copyIds]);			console.log(`Order ${order_id} has been shipped.`);
			console.log(`Order ${order_id} has been shipped.`);
			return true;
		} else {
			console.log(`No available order with id ${order_id} to ship.`);
			return false;
		}
	} catch (error) {
		console.log('Error shipping order.');
		throw error;
	}
};

module.exports = {getOrderById, getAllOrders, createOrder, countShippingCosts, addToOrder, removeFromOrder, shipOrder}
