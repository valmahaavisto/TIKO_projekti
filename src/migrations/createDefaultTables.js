const pool = require('../config/db');

const createDefaultTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
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
        order_id INT DEFAULT 0,
        status INT DEFAULT 0,
        purchase_price DECIMAL (5,2) NOT NULL,
        selling_price DECIMAL (5,2) NOT NULL,
        timestamp TIMESTAMP DEFAULT NULL,
        sale_time TIMESTAMP NOT NULL,
        CHECK (status IN (0,1,2)),
        FOREIGN KEY (book_id) REFERENCES Book,
        FOREIGN KEY (store_id) REFERENCES Store,
        FOREIGN KEY (order_id) REFERENCES BookOrder
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
    `);

    await client.query(`
      INSERT INTO Type (type_name) VALUES 
        ('romance'),
        ('history'),
        ('detective'),
        ('humor'),
        ('guide')
      ON CONFLICT (type_name) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO Category (category_name) VALUES 
        ('novel'),
        ('comic'),
        ('non-fiction')
      ON CONFLICT (category_name) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO Book (isbn, title, author, publication_year, weight, type_id, category_id)
      VALUES
      ('9155430674', 'Elektran tyt r', 'Madeleine Brent', 1986, 0.5, 
        (SELECT type_id FROM Type WHERE type_name = 'romance'),
        (SELECT category_id FROM Category WHERE category_name = 'novel')
      ),
      ('9156381451', 'Tuulentavoittelijan morsian', 'Madeleine Brent', 1978, 0.5, 
        (SELECT type_id FROM Type WHERE type_name = 'romance'),
        (SELECT category_id FROM Category WHERE category_name = 'novel')
      ),
      ('1995', 'Turms kuolematon', 'Mika Waltari', 1995, 0.5, 
        (SELECT type_id FROM Type WHERE type_name = 'history'),
        (SELECT category_id FROM Category WHERE category_name = 'novel')
      ),
      ('1940', 'Komisario Palmun erehdys', 'Mika Waltari', 1940, 0.5, 
        (SELECT type_id FROM Type WHERE type_name = 'detective'),
        (SELECT category_id FROM Category WHERE category_name = 'novel')
      ),
      ('1989', 'Friikkil n pojat Mexicossa', 'Shelton Gilbert', 1989, 0.5, 
        (SELECT type_id FROM Type WHERE type_name = 'humor'),
        (SELECT category_id FROM Category WHERE category_name = 'comic')
      ),
      ('9789510396230', 'Miten saan yst vi , menestyst , vaikutusvaltaa', 'Dale Carnegie', 1939, 0.5, 
        (SELECT type_id FROM Type WHERE type_name = 'guide'),
        (SELECT category_id FROM Category WHERE category_name = 'non-fiction')
      )
      ON CONFLICT (isbn) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO Store (name, address, website, role) VALUES
      ('Keskusdivari', 'Esimerkkikatu 1, Helsinki', 'https://keskusdivari.example.com', 1),
      ('Divari', 'Esimerkkikatu 2, Helsinki', 'https://divari.example.com', 2)
      ON CONFLICT (name) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO BookCopy (book_id, store_id, order_id, purchase_price, selling_price, status, timestamp, sale_time)
      VALUES
      ((SELECT book_id FROM Book WHERE isbn = '9155430674'), 
       (SELECT store_id FROM Store WHERE name = 'Keskusdivari'), NULL, 10.00, 15.00, 0, NOW(), NOW()),
      ((SELECT book_id FROM Book WHERE isbn = '9156381451'), 
       (SELECT store_id FROM Store WHERE name = 'Divari'), NULL, 12.00, 18.00, 0, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    console.log('Tables created and default data inserted successfully');
  } catch (err) {
    console.error('Error creating tables or inserting data:', err);
  } finally {
    client.release();
  }
};

// Export the function so it can be used in index.js
module.exports = createDefaultTables;