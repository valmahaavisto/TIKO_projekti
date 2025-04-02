const pool = require('../config/db');
const Book = require("../models/Book");

const getAllOrders = async () => {
    try {
        const order_check= await pool.query('SELECT * FROM BookOrder ORDER BY order_id');
		console.log(order_check.rows); // for tests
        if (order_check.rows.length === 0) {
            console.log('No orders found.');
            return null;
        }
        return order_check.rows;
    } catch (error) {
        console.log('Error fetching all orders: ', error);
        throw error;
    }
};

const getOrderById = async (order_id) => {
   try {
        const order_check = await pool.query('SELECT * FROM BookOrder WHERE order_id = $1', [order_id]);
        if (order_check.rows.length === 0) {
            console.log(`Order ${order_id} does not exist.`);
            return null;
        }
        const books = await pool.query('SELECT copy_id, book_id FROM BookCopy WHERE order_id = $1', [order_id]);
		if (books.rows.length === 0) {
			console.log(`No books in order ${order_id}.`); 
			return [];
		}
		console.log(`Found order ${books.rows} with id: ${order_id}.`);
		return books.rows;
    } catch (error) {
        console.log('Error fetching the order by id: ', error)
        throw error;
    }
};


const createOrder = async (customer_id) => {
	try {
		const customer_check = await pool.query('SELECT name FROM Customer WHERE customer_id = $1', [customer_id]);
		if(customer_check.rows.length > 0) {
			await pool.query(`INSERT INTO BookOrder (customer_id, confirmation_time, status, total_weight, costs) VALUES
				($1, DEFAULT, 0, 0.00, 0.00)`, [customer_id]);
			const order_check = await pool.query('SELECT order_id FROM BookOrder WHERE customer_id = $1', [customer_id]);
			if(order_check.rows.length > 0) {
				const order_id = order_check.rows[0].order_id;
				console.log(`Order ${order_id} created for customer ${customer_id}.`);
				return order_id;
			} else {
				console.log('Order does not exist.');
				return null;
			}
        } else {
            console.log('The customer id does not exist.');
			return null;
        }    
    } catch (error) {
        console.log('Error creating order.', error);
        throw error;
    }
};

const deleteOrder = async (order_id) => {
	try {
		const order_check = await pool.query('SELECT * FROM BookOrder WHERE order_id = $1', [order_id]);
		if (order_check.rows.length === 0) {
			console.log(`Order ${order_id} does not have an order.`);
			return false;
		}
		const status = order_check.rows[0].status;
		if (status === 1) {
			console.log(`Order ${order_id} has been shipped.`);
			return false;
		}
		await pool.query('DELETE FROM BookOrder WHERE order_id=$1', [order_id]);
		console.log(`Order ${order_id} has been deleted.`);
		return true;
	} catch (error) {
		console.log('Error deleting order:', error);
		throw error;
	}
 }

const getOrderId = async(customer_id) => {
	try {
		const order_check = await pool.query('SELECT * FROM BookOrder WHERE customer_id = $1 ORDER BY order_id DESC', [customer_id]);
    	if (order_check.rows.length === 0) {
			console.log(`Customer ${customer_id} does not have an order. New order created.`);
			const order_id = createOrder(customer_id);
			return order_id;
		}
		const status = order_check.rows[0].status;
		if (status === 1) {
			console.log(`Customer ${customer_id} has shipped order(s). New order created.`);
			const order_id = createOrder(customer_id);
			return order_id;
		}
		const order_id = order_check.rows[0].order_id;
		console.log(`Customer ${customer_id} has active order ${order_id}.`);
		return order_id;
	} catch (error) {
        console.log('Error getting order id:', error);
        throw error;
    }
}

// for single shipment, to be updated
const countShippingCosts = async (order_id) => {
    try {
        const order_check = await pool.query('SELECT * FROM BookOrder WHERE order_id = $1', [order_id]);
    	if (order_check.rows.length === 0) {
			console.log(`Order ${order_id} does not exist.`);
			return null;
    	} 
        const total_weight = order_check.rows[0].total_weight;
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
		const order_check = await pool.query('SELECT * FROM BookOrder WHERE order_id = $1', [order_id]);
    	if (order_check.rows.length === 0) {
			console.log(`Order ${order_id} does not exist.`);
			return false;
    	} 
		const copy_check = await pool.query('SELECT * FROM BookCopy WHERE copy_id = $1', [copy_id]);
		if (copy_check.rows.length === 0){
			console.log(`Book copy ${copy_id} does not exist.`);
			return false;
		}
        const status = copy_check.rows[0].status;
		if (status === 0) {
            const book_id = copy_check.rows[0].book_id;
            const weight = await Book.getBookWeightById(book_id);
			// const weight = 0.25; // for testing
            await pool.query('UPDATE BookOrder SET total_weight = total_weight + $1 WHERE order_id = $2', [weight, order_id]);
            await pool.query('UPDATE BookCopy SET status = 1, order_id = $1, timestamp = CURRENT_TIMESTAMP WHERE copy_id =$2', [order_id, copy_id]);
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
        const copy_check = await pool.query('SELECT * FROM BookCopy WHERE copy_id = $1', [copy_id]);
		if (copy_check.rows.length === 0){
			console.log(`Book copy ${copy_id} does not exist.`);
			return false;
		}
        const status = copy_check.rows[0].status;
        const order_id = copy_check.rows[0].order_id;
        if (status === 1 && order_id !== null) {
            const book_id = copy_check.rows[0].book_id;
            const weight = await Book.getBookWeightById(book_id);
			// const weight = 0.25; // for testing
            await pool.query ('UPDATE BookOrder SET total_weight = total_weight - $1 WHERE order_id = $2', [weight, order_id]);
            await pool.query('UPDATE BookCopy SET status = 0, order_id = NULL, timestamp = NULL WHERE copy_id = $1', [copy_id]);
            console.log(`Book copy ${copy_id} removed from the order ${order_id}.`);

			const empty_check = ('SELECT * FROM bookCopy WHERE order_id = $1', [order_id]);
			if (empty_check.rows.length === 0){
				console.log(`Book copy ${copy_id} was only element in order ${order_id}, so order is now to be deleted.`);
				const deleted = deleteOrder(order_id);
				return deleted;
			}
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
		const order_check = await pool.query('SELECT * FROM BookOrder WHERE order_id = $1', [order_id]);
    	if (order_check.rows.length === 0) {
			console.log(`Order ${order_id} does not exist.`);
			return false;
    	}
		const item_check = await pool.query('SELECT copy_id FROM BookCopy WHERE order_id = $1', [order_id]);
		if (item_check.rows.length === 0) {
			console.log(`Order ${order_id} does not have any items.`);
			return false;
		}
		const status = order_check.rows[0].status;
		if(!status) {
			await pool.query ('UPDATE BookOrder SET status = 1 WHERE order_id = $1', [order_id]);
			const copyIds = item_check.rows.map(row => row.copy_id);
            await pool.query('UPDATE BookCopy SET status = 2, sale_time = CURRENT_TIMESTAMP WHERE copy_id = ANY($1::int[])', [copyIds]);			console.log(`Order ${order_id} has been shipped.`);
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

module.exports = {getOrderById, getAllOrders, createOrder, deleteOrder, getOrderId, countShippingCosts, addToOrder, removeFromOrder, shipOrder}
