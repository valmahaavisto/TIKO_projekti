const pool = require('../config/db');

const createDefaultTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      DO $$ 
      BEGIN
          EXECUTE 'DROP TABLE IF EXISTS public.book CASCADE';
          EXECUTE 'DROP TABLE IF EXISTS public.bookcopy CASCADE';
          EXECUTE 'DROP TABLE IF EXISTS public.bookorder CASCADE';
          EXECUTE 'DROP TABLE IF EXISTS public.category CASCADE';
          EXECUTE 'DROP TABLE IF EXISTS public.customer CASCADE';
          EXECUTE 'DROP TABLE IF EXISTS public.shipment CASCADE';
          EXECUTE 'DROP TABLE IF EXISTS public.shippingrates CASCADE';
          EXECUTE 'DROP TABLE IF EXISTS public.store CASCADE';
          EXECUTE 'DROP TABLE IF EXISTS public.type CASCADE';
      END $$;
      

      CREATE TABLE IF NOT EXISTS Customer (
        customer_id SERIAL PRIMARY KEY,
        name VARCHAR(30) NOT NULL,
        address VARCHAR(50) NOT NULL,
        postal_code CHAR(5) NOT NULL,
        email VARCHAR(30) NOT NULL UNIQUE,
        password VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS BookOrder (
        order_id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL,
        confirmation_time TIMESTAMP DEFAULT NULL,
        status INT DEFAULT 0,
        total_weight DECIMAL(5,2) DEFAULT 0,
        costs DECIMAL (5,2) NOT NULL,
        CHECK (status IN (0,1)),
        FOREIGN KEY (customer_id) REFERENCES Customer
      );

      CREATE TABLE IF NOT EXISTS Type (
        type_id SERIAL PRIMARY KEY,
        type_name VARCHAR(20) NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS Category (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(20) NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS Book (
        book_id SERIAL PRIMARY KEY,
        isbn VARCHAR(13) NOT NULL UNIQUE,
        title VARCHAR(50) NOT NULL,
        author VARCHAR(50) NOT NULL,
        publication_year INT NOT NULL,
        weight DECIMAL (5,2) NOT NULL,
        type_id INT NOT NULL,
        category_id INT NOT NULL,
        FOREIGN KEY (type_id) REFERENCES Type,
        FOREIGN KEY (category_id) REFERENCES Category
      );

      CREATE TABLE IF NOT EXISTS Store (
        store_id SERIAL PRIMARY KEY,
        name VARCHAR(30) NOT NULL UNIQUE,
        address VARCHAR(50) NOT NULL,
        website VARCHAR(100) NOT NULL,
        role INT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS BookCopy (
        copy_id SERIAL PRIMARY KEY,
        book_id INT NOT NULL,
        store_id INT NOT NULL,
        order_id INT DEFAULT NULL,
        status INT DEFAULT 0,
        purchase_price DECIMAL (5,2) NOT NULL,
        selling_price DECIMAL (5,2) NOT NULL,
        timestamp TIMESTAMP DEFAULT NULL,
        sale_time TIMESTAMP NOT NULL,
        CHECK (status IN (0,1,2)),
        FOREIGN KEY (book_id) REFERENCES Book,
        FOREIGN KEY (store_id) REFERENCES Store,
        FOREIGN KEY (order_id) REFERENCES BookOrder,
        UNIQUE (copy_id, book_id, store_id) -- Add UNIQUE constraint
      );

      CREATE TABLE IF NOT EXISTS Shipment (
        shipment_id SERIAL PRIMARY KEY,
        order_id INT NOT NULL,
        shipment_no INT NOT NULL,
        costs DECIMAL(5,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES BookOrder
      );

      CREATE TABLE IF NOT EXISTS ShippingRates (
        weight_limit DECIMAL (5,2) PRIMARY KEY,
        price DECIMAL (5,2) NOT NULL
      );


      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'unique_order'
        ) THEN
          ALTER TABLE BookOrder
          ADD CONSTRAINT unique_order UNIQUE (customer_id, confirmation_time);
        END IF;
      END $$;


      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'unique_bookcopy'
        ) THEN
          ALTER TABLE BookCopy
          ADD CONSTRAINT unique_bookcopy UNIQUE (copy_id, book_id, store_id);
        END IF;
      END $$;
    `); 

    console.log('Tables created successfully.');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    client.release();
  }
};


module.exports = createDefaultTables;