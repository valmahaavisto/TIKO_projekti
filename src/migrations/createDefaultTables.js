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
      FOREIGN KEY (order_id) REFERENCES BookOrder,
      UNIQUE (book_id, store_id, order_id) -- Add UNIQUE constraint
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
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'unique_bookcopy'
        ) THEN
          ALTER TABLE BookCopy
          ADD CONSTRAINT unique_bookcopy UNIQUE (book_id, store_id, order_id);
        END IF;
      END $$;
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
      INSERT INTO Customer (name, address, postal_code, email, password) VALUES
      ('Matti Meik l inen', 'Esimerkkikatu 1, 00100 Helsinki', '12345', 'matti.meikalainen@example.com', 'salasana123'),
      ('Anna Esimerkki', 'Testikatu 5, 00200 Helsinki', '23456', 'anna.esimerkki@example.com', 'annaSalasana456'),
      ('Pekka Malli', 'Mallitie 7, 00300 Helsinki', '34567', 'pekka.malli@example.com', 'pekkaMalli789'),
      ('Laura N yte', 'N ytekatu 10, 00400 Helsinki', '45678', 'laura.nayte@example.com', 'lauraSalasana012'),
      ('Janne Testi', 'Testikatu 12, 00500 Helsinki', '56789', 'janne.testi@example.com', 'janneTesti345')
      ON CONFLICT (email) DO NOTHING;
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
      INSERT INTO ShippingRates (weight_limit, price) VALUES
      (50, 2.50), (250, 5.00), (10, 10.00), (20, 15.00)
      ON CONFLICT (weight_limit) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO Store (name, address, website, role) VALUES
      ('Keskusdivari', 'Esimerkkikatu 1, Helsinki', 'https://keskusdivari.example.com', 1),
      ('Divari', 'Esimerkkikatu 2, Helsinki', 'https://divari.example.com', 2)
      ON CONFLICT (name) DO NOTHING;
    `); 
        
    await client.query(`
      INSERT INTO BookOrder (customer_id, confirmation_time, status, total_weight, costs)
      VALUES
        (1, '2024-01-15 10:30:00', 1, 2.50, 20.00),
        (1, '2024-02-10 14:45:00', 1, 1.75, 15.00),
        (2, '2024-03-05 08:20:00', 1, 3.00, 30.50),
        (2, '2024-01-25 16:00:00', 1, 4.00, 25.00),
        (3, '2024-04-05 14:30:00', 1, 5.25, 50.00),
        (4, '2024-02-11 09:15:00', 1, 2.80, 22.00),
        (2, '2024-03-01 12:00:00', 1, 3.00, 27.50),
        (4, '2024-03-20 11:00:00', 1, 2.75, 22.50),
        (1, '2024-04-10 17:10:00', 1, 3.50, 30.00),
        (2, '2024-03-25 18:20:00', 1, 4.25, 35.00),
        (3, '2024-04-15 16:30:00', 1, 2.50, 20.50),
        (4, '2024-03-15 10:00:00', 1, 2.00, 18.00)
      ON CONFLICT (customer_id, confirmation_time) DO NOTHING;
    `);  
    
  await client.query(`
    INSERT INTO BookCopy (book_id, store_id, order_id, status, purchase_price, selling_price, sale_time)
    VALUES
      ((SELECT book_id FROM Book WHERE isbn = '9155430674'), 
      (SELECT store_id FROM Store WHERE name = 'Keskusdivari'), 
      (SELECT order_id FROM BookOrder WHERE customer_id = 1 LIMIT 1), 
      0, 10.00, 15.00, '2024-01-10 10:00:00'),
      ((SELECT book_id FROM Book WHERE isbn = '9156381451'), 
      (SELECT store_id FROM Store WHERE name = 'Divari'), 
      (SELECT order_id FROM BookOrder WHERE customer_id = 1 LIMIT 1), 
      1, 12.00, 18.00, '2024-02-10 11:15:00'),
      ((SELECT book_id FROM Book WHERE isbn = '1995'), 
      (SELECT store_id FROM Store WHERE name = 'Keskusdivari'), 
      (SELECT order_id FROM BookOrder WHERE customer_id = 2 LIMIT 1), 
      0, 8.00, 12.00, '2024-03-12 13:00:00'),
      ((SELECT book_id FROM Book WHERE isbn = '1940'), 
      (SELECT store_id FROM Store WHERE name = 'Divari'), 
      (SELECT order_id FROM BookOrder WHERE customer_id = 2 LIMIT 1), 
      1, 9.50, 14.50, '2024-04-05 14:00:00')
    ON CONFLICT (book_id, store_id, order_id) DO NOTHING; -- Use the UNIQUE constraint columns
  `);    

    console.log('Tables created and default data inserted successfully');
  } catch (err) {
    console.error('Error creating tables or inserting data:', err);
  } finally {
    client.release();
  }
};


module.exports = createDefaultTables;