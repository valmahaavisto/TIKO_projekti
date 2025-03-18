const pool = require("../config/db");

const getAllBooks = async () => {
  try {
    const result = await pool.query("SELECT * FROM Book");
	console.log(result);
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching all books:", error);
    throw error;
  }
};

const getBookWeightById = async (id) => {
  try {
    const result = await pool.query("SELECT paino FROM books WHERE id = $1", [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error fetching book weight by ID:", error);
    throw error;
  }
};

const getR2 = async () => {
  try {
    const result = await pool.query(`
      SELECT luokka, SUM(hinta) AS total_price, AVG(hinta) AS avg_price 
      FROM books 
      GROUP BY luokka
    `);
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching R2 data:", error);
    throw error;
  }
};

const addBook = async ({ isbn, nimi, tekija, julkaisuvuosi, tyyppi, luokka, paino }) => {
  try {
    const typeResult = await pool.query("SELECT type_id FROM Type WHERE type_name = $1", [tyyppi]);

    if (typeResult.rows.length === 0) {
      throw new Error(`Type ${tyyppi} not found`);
    }
    const type_id = typeResult.rows[0].type_id;

    const categoryResult = await pool.query("SELECT category_id FROM Category WHERE category_name = $1", [luokka]);

    if (categoryResult.rows.length === 0) {
      throw new Error(`Category ${luokka} not found`);
    }
    const category_id = categoryResult.rows[0].category_id;

    const result = await pool.query(
      `INSERT INTO Book (isbn, title, author, publication_year, weight, type_id, category_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING book_id`,
      [isbn, nimi, tekija, julkaisuvuosi, paino, type_id, category_id]
    );

    return result.rows[0].book_id;
  } catch (error) {
    console.error("Error adding book:", error);
    throw error;
  }
};

const addBookCopy = async ({ book_id, store_id, purchase_price, selling_price }) => {
  try {
    const bookResult = await pool.query("SELECT book_id FROM Book WHERE book_id = $1", [book_id]);

    if (bookResult.rows.length === 0) {
      throw new Error(`Book with ID ${book_id} not found`);
    }

    const result = await pool.query(
      `INSERT INTO BookCopy (book_id, store_id, purchase_price, selling_price, status, order_id, timestamp, sale_time) 
       VALUES ($1, $2, $3, $4, 0, 0, NOW(), NOW()) 
       RETURNING copy_id`,
      [book_id, store_id, purchase_price, selling_price]
    );

    return result.rows[0].copy_id;
  } catch (error) {
    console.error("Error adding book copy:", error);
    throw error;
  }
};


const getBookWithISBN = async (isbn) => {
  try {
    const result = await pool.query("SELECT * FROM Book WHERE isbn = $1", [isbn]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error fetching book by ISBN:", error);
    throw error;
  }
};


const getFilteredBooks = async ({ nimi = null, tekija = null, tyyppi = null, luokka = null }) => {
try {
    let query = "SELECT * FROM Book WHERE 1=1";
    let values = [];
    let counter = 1;

    if (nimi) {
      query += ` AND nimi ILIKE $${counter}`;
      values.push(`%${nimi}%`);
      counter++;
    }
    if (tekija) {
      query += ` AND tekija ILIKE $${counter}`;
      values.push(`%${tekija}%`);
      counter++;
    }
    if (tyyppi) {
      query += ` AND tyyppi = $${counter}`;
      values.push(tyyppi);
      counter++;
    }
    if (luokka) {
      query += ` AND luokka = $${counter}`;
      values.push(luokka);
      counter++;
    }

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching filtered books:", error);
    throw error;
  }
};

module.exports = { getAllBooks, getBookWeightById, getR2, addBook, addBookCopy, getBookWithISBN, getFilteredBooks };
