const pool = require("../config/db");

const getAllBooks = async () => {
  try {
    const result = await pool.query("SELECT * FROM Teos");
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
    const result = await pool.query(
      "INSERT INTO books (isbn, nimi, tekija, julkaisuvuosi, tyyppi, luokka, paino) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [isbn, nimi, tekija, julkaisuvuosi, tyyppi, luokka, paino]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error adding book:", error);
    throw error;
  }
};

const getBookWithISBN = async (isbn) => {
  try {
    const result = await pool.query("SELECT * FROM Teos WHERE isbn = $1", [isbn]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error fetching book by ISBN:", error);
    throw error;
  }
};


const getFilteredBooks = async ({ nimi = null, tekija = null, tyyppi = null, luokka = null }) => {
try {
    let query = "SELECT * FROM Teos WHERE 1=1";
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

module.exports = { getAllBooks, getBookWeightById, getR2, addBook, getBookWithISBN, getFilteredBooks };
