const pool = require('../config/db');

getOrderById = async (order_id) => {
   try {
        const result = await pool.query('SELECT * FROM Order WHERE order_id = $1', [order_id]);
        if (result.rows.length === 0) {
            console.log('No order found with this id.');
            return null;
        }
        console.log('Found the order with id:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.log('Error fetching the order by id: ', error)
        throw error;
    }
};


getAllOrders = async () => {
    try {
        const result = await pool.query('SELECT * FROM Order ORDER BY order_id');
        if (result.rows.length === 0) {
            console.log('No orders found.');
            return null;
        }
        return result.rows;
    } catch (error) {
        console.log('Error fetching all orders: ', error);
        throw error;
    }
};


// For single shipment orders (to be updated)
countShippingCosts = async (order_id, copy_id, book_copy) => {
    try {
        const book_id_result = await pool.query('SELECT book_id FROM BookCopy WHERE copy_id = $1', [copy_id]);
        if(book_id_result.rows.length > 0){
            const book_id = book_id_result.rows[0].book_id;
            const weight  = Book.getBookWeightById(book_id);

            await pool.query('UPDATE Order SET total_weight = total_weight + $1 WHERE order_id = $2', [weight, order_id]);
            const total_weight_result = await pool.query('SELECT total_weight FROM Order WHERE order_id = $1', [order_id]);
            const total_weight = total_weight_result.rows[0].total_weight;

            const weight_limits_result = await pool.query('SELECT weight_limit FROM ShippingRates WHERE weight_limit >= $1 ORDER BY weight_limit ASC LIMIT 1', [total_weight]);
            if (weight_limits_result.rows.length > 0) {
                const weight_limit = weight_limits_result.rows[0].weight_limit;
            
                const shipping_rate_result = await pool.query('SELECT price FROM ShippingRates WHERE weight_limit = $1', [weight_limit]);
                const shipping_cost = shipping_rate_result.rows[0].price;
            
            console.log('The shipping cost for order ${order_id} is ${shipping_cost} based on the weight of ${total_weight}kg.');
            return shipping_cost;
            } else {
                console.log('No weight limit found for the total weight.');
            }
        } else {
            console.log('Error getting weight of book copy.');
        } 
    } catch (error) {
        console.log('Error counting shipment costs', error);
        throw error;
    }
};

addToOrder = async (order_id, copy_id) => {
    try { 
        const result = await pool.query('SELECT status FROM BookCopy WHERE copy_id = $1', [copy_id]);
		if (result.rows.length > 0 && result.rows[0].status === 0) {
            await pool.query('UPDATE BookCopy SET status = 1, order_id = $1 WHERE copy_id =$2', [order_id, copy_id]);
            console.log('Book copy ${copy_id} added to order ${order_id}.');
        } else {
            console.log('The book copy is not free or does not exist.');
        }    
    } catch (error) {
        console.log('Error adding book copy to order.', error);
        throw error;
    }
};

removeFromOrder = async (order_id, copy_id) => {
    try {
        const result  = await pool.query('SELECT status, order_id FROM BookCopy WHERE copy_id = $1', [copy_id]);
        if (result.rows.length > 0 && result.rows[0].status === 1 && result.rows[0].order_id === order_id) {
            await pool.query('UPDATE BookCopy SET status = 0, order_id = 0 WHERE copy_id = $1', [copy_id]);
            console.log('Book copy ${copy_id} removed from the order ${order_id}.');
        } else {
            console.log('The book copy is not in the order or does not exist');
        }
    } catch (error) {
        console.log('Error removing book copy from order.');
        throw error;
    }
};


// shipOrder = async (order_id) => {};

module.exports = {getOrderById, getAllOrders, countShippingCosts, addToOrder, removeFromOrder, shipOrder}
