const pool = require('../config/db');
const Book = require('./Book');

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
		if(customer_check.rows.length === 0) {
			console.log('The customer id does not exist.');
			return null;
		}
		await pool.query(`INSERT INTO BookOrder (customer_id, confirmation_time, status, total_weight, costs) VALUES
			($1, DEFAULT, 0, 0.00, 0.00)`, [customer_id]);
		const order_check = await pool.query('SELECT order_id FROM BookOrder WHERE customer_id = $1 ORDER BY order_id DESC', [customer_id]);
		if(order_check.rows.length === 0) {
			console.log('Order does not exist.');
			return null;
		}
		const order_id = order_check.rows[0].order_id;
		console.log(`Order ${order_id} created for customer ${customer_id}.`);
		return order_id;
    } catch (error) {
        console.log('Error creating order.', error);
        throw error;
    }
};

const deleteOrder = async (order_id) => {
	try {
		const order_check = await pool.query('SELECT * FROM BookOrder WHERE order_id = $1', [order_id]);
		if (order_check.rows.length === 0) {
			console.log(`Order ${order_id} does not exist.`);
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
			const order_id = await createOrder(customer_id);
			return order_id;
		}
		const status = order_check.rows[0].status;
		if (status === 1) {
			console.log(`Customer ${customer_id} has shipped order(s). New order created.`);
			const order_id = await createOrder(customer_id);
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

const countShippingCosts = async(order_id) => {
    try {
        const order_check = await pool.query('SELECT * FROM BookOrder WHERE order_id = $1', [order_id]);
    	if (order_check.rows.length === 0) {
			console.log(`Order ${order_id} does not exist.`);
			return 0;
    	} 

        const copy_check = await pool.query('SELECT copy_id FROM BookCopy WHERE order_id = $1', [order_id]);
        if (copy_check.rows.length === 0) {
            console.log(`Order ${order_id} does not have any items.`);
            return 0;
        }
        const copy_ids = copy_check.rows.map(row => row.copy_id);
        let shipping_cost = 0;
        let total_shipping_cost = 0;
        let total_weight = 0;
        for (copy of copy_ids) {
            const book_result = await pool.query('SELECT book_id FROM BookCopy WHERE copy_id = $1', [copy]);
            const book_id = book_result.rows[0].book_id;
            const weight = parseFloat(await Book.getBookWeightById(book_id));
            if (total_weight + weight <= 2.00){
                total_weight += weight;
            } else {
                total_shipping_cost += shipping_cost;
                total_weight = weight;
            }
            const weight_limit_result = await pool.query('SELECT weight_limit FROM ShippingRates WHERE weight_limit >= $1 ORDER BY weight_limit ASC LIMIT 1', [total_weight]);
            const weight_limit = weight_limit_result.rows[0].weight_limit;
            const shipping_rate_result = await pool.query('SELECT price FROM ShippingRates WHERE weight_limit = $1', [weight_limit]);
            shipping_cost = parseFloat(shipping_rate_result.rows[0].price);
        }
		if (total_weight > 0) {
        	total_shipping_cost += shipping_cost;
		}
        return total_shipping_cost;
    } catch (error) {
        console.log('Error counting shipping costs:', error);
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
		if(status !== 0) {
			console.log(`Book copy ${copy_id} is not free, status is ${status}.`);
			return false;
		}
		const book_id = copy_check.rows[0].book_id;
		const weight = await Book.getBookWeightById(book_id);
		await pool.query('UPDATE BookOrder SET total_weight = total_weight + $1 WHERE order_id = $2', [weight, order_id]);
		await pool.query('UPDATE BookCopy SET status = 1, order_id = $1, timestamp = (SELECT CURRENT_TIMESTAMP) WHERE copy_id =$2', [order_id, copy_id]);
		console.log(`Book copy ${copy_id} added to order ${order_id}.`);
		return true;  

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
		if(status !== 1 || order_id === null) {
			console.log('The book copy is not in order.');
            return false;
		}
		const book_id = copy_check.rows[0].book_id;
		const weight = await Book.getBookWeightById(book_id);
		await pool.query ('UPDATE BookOrder SET total_weight = total_weight - $1 WHERE order_id = $2', [weight, order_id]);
		await pool.query('UPDATE BookCopy SET status = 0, order_id = NULL, timestamp = NULL WHERE copy_id = $1', [copy_id]);
		console.log(`Book copy ${copy_id} removed from the order ${order_id}.`);

		const empty_check = await pool.query('SELECT * FROM BookCopy WHERE order_id = $1', [order_id]);
		if (empty_check.rows.length === 0){
			console.log(`Book copy ${copy_id} was only element in order ${order_id}, so order is now to be deleted.`);
			const deleted = await deleteOrder(order_id);
			return deleted;
		}
		return true;
    } catch (error) {
        console.log('Error removing book copy from order:', error);
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
		const copy_check = await pool.query('SELECT copy_id FROM BookCopy WHERE order_id = $1', [order_id]);
		if (copy_check.rows.length === 0) {
			console.log(`Order ${order_id} does not have any items.`);
			return false;
		}
        const status = order_check.rows[0].status;
        if (status !== 0) {
            console.log(`No available ${order_id} to ship.`);
            return false;
        }

		const copy_ids = copy_check.rows.map(row => row.copy_id);
        let shipping_cost = 0;
        let total_weight = 0;
        let shipment_no = 1;
        for (copy of copy_ids) {
            await pool.query('UPDATE BookCopy SET status = 2, sale_time = (SELECT CURRENT_TIMESTAMP) WHERE copy_id = $1', [copy]);
            const book_result = await pool.query('SELECT book_id FROM BookCopy WHERE copy_id = $1', [copy]);
            const book_id = book_result.rows[0].book_id;
            const weight = parseFloat(await Book.getBookWeightById(book_id));
            if (total_weight + weight <= 2.00){
                total_weight += weight;
            } else {
                await pool.query('INSERT INTO Shipment (order_id, shipment_no, costs) VALUES ($1, $2, $3)', [order_id, shipment_no, shipping_cost]);
                shipment_no ++;
                total_weight = weight;
            }
            const weight_limit_result = await pool.query('SELECT weight_limit FROM ShippingRates WHERE weight_limit >= $1 ORDER BY weight_limit ASC LIMIT 1', [total_weight]);
            const weight_limit = weight_limit_result.rows[0].weight_limit;
            const shipping_rate_result = await pool.query('SELECT price FROM ShippingRates WHERE weight_limit = $1', [weight_limit]);
            shipping_cost = parseFloat(shipping_rate_result.rows[0].price);
        }
        if (total_weight > 0 ) {
            await pool.query('INSERT INTO Shipment (order_id, shipment_no, costs) VALUES ($1, $2, $3)', [order_id, shipment_no, shipping_cost]);
        }
        await pool.query ('UPDATE BookOrder SET status = 1 WHERE order_id = $1', [order_id]);
        console.log(`Order ${order_id} has been shipped.`);
        return true;

    } catch (error) {
        console.log('Error shipping order:', error);
        throw error;
    }
};

module.exports = {getOrderById, createOrder, deleteOrder, getOrderId, countShippingCosts, addToOrder, removeFromOrder, shipOrder}
