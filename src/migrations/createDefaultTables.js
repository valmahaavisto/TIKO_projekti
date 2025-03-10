const pool = require('../config/db'); 

const createDefaultTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS Customer (
        customer_id SERIAL,
        name VARCHAR(30) NOT NULL,
        address VARCHAR(50) NOT NULL,
        postal_code CHAR(5) NOT NULL,
        email VARCHAR(30) NOT NULL,
        password VARCHAR(50) NOT NULL,
        PRIMARY KEY (customer_id)
      );

      CREATE TABLE IF NOT EXISTS Order (
        order_id SERIAL,
        customer_id INT NOT NULL,
        confirmation_time TIMESTAMP DEFAULT NULL,
        status INT DEFAULT 0,
        costs DECIMAL (5,2) NOT NULL,
        CHECK (status IN (0,1)),
        PRIMARY KEY (order_id),
        FOREIGN KEY (customer_id) REFERENCES Customer
      );

      CREATE TABLE IF NOT EXISTS Type (
        type_id SERIAL,
        type_name VARCHAR(20) NOT NULL,
        PRIMARY KEY (type_id)
      );

      CREATE TABLE IF NOT EXISTS Category (
        category_id SERIAL,
        category_name VARCHAR(20) NOT NULL,
        PRIMARY KEY (category_id)
      );

      CREATE TABLE IF NOT EXISTS Book (
        book_id SERIAL,
        isbn VARCHAR(13) NOT NULL,
        title VARCHAR(50) NOT NULL,
        author VARCHAR(50) NOT NULL,
        publication_year INT NOT NULL,
        weight DECIMAL (5,2) NOT NULL,
        type_id INT NOT NULL,
        category_id INT NOT NULL,
        PRIMARY KEY (book_id),
        FOREIGN KEY (type_id) REFERENCES Type,
        FOREIGN KEY (category_id) REFERENCES Category
      );

      CREATE TABLE IF NOT EXISTS Store (
        store_id SERIAL,
        name VARCHAR(30) NOT NULL,
        address VARCHAR(50) NOT NULL,
        website VARCHAR(100) NOT NULL,
        role INT NOT NULL,
        PRIMARY KEY (store_id)
      );

      CREATE TABLE IF NOT EXISTS BookCopy (
        copy_id SERIAL,
        book_id INT NOT NULL,
        store_id INT NOT NULL,
        status INT DEFAULT 0,
        purchase_price DECIMAL (5,2) NOT NULL,
        selling_price DECIMAL (5,2) NOT NULL,
        timestamp TIMESTAMP DEFAULT NULL,
        sale_time TIMESTAMP NOT NULL,
        CHECK (status IN (0,1,2)),
        PRIMARY KEY (copy_id),
        FOREIGN KEY (book_id) REFERENCES Book,
        FOREIGN KEY (store_id) REFERENCES Store
      );

      CREATE TABLE IF NOT EXISTS Shipment (
        shipment_id SERIAL,
        order_id INT NOT NULL,
        shipment_no INT NOT NULL,
        costs DECIMAL(5,2) NOT NULL,
        PRIMARY KEY (shipment_id),
        FOREIGN KEY (order_id) REFERENCES Order
      );

      CREATE TABLE IF NOT EXISTS ShippingRates (
        weight_limit DECIMAL (5,2),
        price DECIMAL (5,2) NOT NULL,
        PRIMARY KEY (weight_limit)
      );
    `);

    await client.query(`
      INSERT INTO Type (type_name) VALUES 
      ('romance'), ('history'), ('detective'), ('humor'), ('guide')
      ON CONFLICT (type_name) DO NOTHING;

      INSERT INTO Category (category_name) VALUES 
      ('novel'), ('comic'), ('non-fiction')
      ON CONFLICT (category_name) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO Book (isbn, title, author, publication_year, weight, type_id, category_id)
      VALUES
      ('9155430674', 'Elektran tytär', 'Madeleine Brent', 1986, 0.5, 
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
      ('1989', 'Friikkilän pojat Mexicossa', 'Shelton Gilbert', 1989, 0.5, 
        (SELECT type_id FROM Type WHERE type_name = 'humor'),
        (SELECT category_id FROM Category WHERE category_name = 'comic')
      ),
      ('9789510396230', 'Miten saan ystäviä, menestystä, vaikutusvaltaa', 'Dale Carnegie', 1939, 0.5, 
        (SELECT type_id FROM Type WHERE type_name = 'guide'),
        (SELECT category_id FROM Category WHERE category_name = 'non-fiction')
      )
      ON CONFLICT (isbn) DO NOTHING;
    `);

    await client.query(`
    INSERT INTO Asiakas (asiakastunnus, nimi, osoite, pnro, sposti, salasana) VALUES
    (1, 'Matti Meikäläinen', 'Esimerkkikatu 1, 00100 Helsinki', '12345', 'matti.meikalainen@example.com', 'salasana123'),
    (2, 'Anna Esimerkki', 'Testikatu 5, 00200 Helsinki', '23456', 'anna.esimerkki@example.com', 'annaSalasana456'),
    (3, 'Pekka Malli', 'Mallitie 7, 00300 Helsinki', '34567', 'pekka.malli@example.com', 'pekkaMalli789'),
    (4, 'Laura Näyte', 'Näytekatu 10, 00400 Helsinki', '45678', 'laura.nayte@example.com', 'lauraSalasana012'),
    (5, 'Janne Testi', 'Testikatu 12, 00500 Helsinki', '56789', 'janne.testi@example.com', 'janneTesti345')
    ON CONFLICT (asiakastunnus) DO NOTHING;
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
