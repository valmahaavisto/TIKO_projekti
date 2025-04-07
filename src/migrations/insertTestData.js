const pool = require('../config/db');

const insertTestData = async () => {
  const client = await pool.connect();
  try {
    await client.query(`

        INSERT INTO Type (type_name) VALUES 
        ('romance'),
        ('history'),
        ('detective'),
        ('humor'),
        ('guide')
        ON CONFLICT (type_name) DO NOTHING;


        INSERT INTO Category (category_name) VALUES 
        ('novel'),
        ('comic'),
        ('non-fiction')
        ON CONFLICT (category_name) DO NOTHING;


        INSERT INTO Customer (name, address, postal_code, email, password) VALUES
        ('Matti Meik l inen', 'Esimerkkikatu 1, 00100 Helsinki', '12345', 'matti.meikalainen@example.com', 'salasana123'),
        ('Anna Esimerkki', 'Testikatu 5, 00200 Helsinki', '23456', 'anna.esimerkki@example.com', 'annaSalasana456'),
        ('Pekka Malli', 'Mallitie 7, 00300 Helsinki', '34567', 'pekka.malli@example.com', 'pekkaMalli789'),
        ('Laura N yte', 'N ytekatu 10, 00400 Helsinki', '45678', 'laura.nayte@example.com', 'lauraSalasana012'),
        ('Janne Testi', 'Testikatu 12, 00500 Helsinki', '56789', 'janne.testi@example.com', 'janneTesti345')
        ON CONFLICT (email) DO NOTHING;

        
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
        ('9789510396230', 'Miten saan ystäviä , menestystä , vaikutusvaltaa', 'Dale Carnegie', 1939, 0.5, 
            (SELECT type_id FROM Type WHERE type_name = 'guide'),
            (SELECT category_id FROM Category WHERE category_name = 'non-fiction')
        )
        ON CONFLICT (isbn) DO NOTHING;


        INSERT INTO ShippingRates (weight_limit, price) VALUES
        (0.05, 2.50), (0.25, 5.00), (1.00, 10.00), (2.00, 15.00)
        ON CONFLICT (weight_limit) DO NOTHING;


        INSERT INTO Store (name, address, website, role) VALUES
        ('Keskusdivari', 'Esimerkkikatu 1, Helsinki', 'https://keskusdivari.example.com', 1),
        ('Divari', 'Esimerkkikatu 2, Helsinki', 'https://divari.example.com', 2)
        ON CONFLICT (name) DO NOTHING;


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
        ON CONFLICT (book_id, store_id, order_id) DO NOTHING;
    `);    

    console.log('Test data inserted to tables successfully.');
  } catch (err) {
    console.error('Error inserting data to tables:', err);
  } finally {
    client.release();
  }
};

module.exports = insertTestData;