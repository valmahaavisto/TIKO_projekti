const pool = require("../config/db");

const getAllBooks = async () => {
  try {
    const result = await pool.query("SELECT * FROM Book");
    console.log(result.rows);
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching all books:", error);
    throw error;
  }
};

const getAllBookCopies = async (bookId = null) => {
    try {
        const query = `
            SELECT b.book_id, b.title, bc.copy_id, bc.store_id, bc.status, bc.purchase_price, bc.selling_price
            FROM Book b
            LEFT JOIN BookCopy bc ON b.book_id = bc.book_id
            WHERE $1::INTEGER IS NULL OR b.book_id = $1::INTEGER
        `;
        const result = await pool.query(query, [bookId]);
        return result.rows;
    } catch (error) {
        console.error("Error fetching books with copies:", error);
        throw error;
    }
};

const getBookById = async (id) => {
  try {
    const result = await pool.query(`SELECT * FROM Book WHERE book_id = $1`, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    throw error;
  }
}

const getBookCopyById = async (id) => {
  try {
    const result = await pool.query(`SELECT * FROM BookCopy WHERE copy_id = $1`, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error fetching copy by ID:", error);
    throw error;
  }
}

const getBookWeightById = async (id) => {
  try {
    const result = await pool.query("SELECT weight FROM Book WHERE id = $1", [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error fetching book weight by ID:", error);
    throw error;
  }
};

const getR2 = async () => {
  try {
    const result = await pool.query(`
      SELECT
        Category.category_name AS luokka,
        COUNT(BookCopy.copy_id) AS lkm,
        ROUND(SUM(BookCopy.selling_price), 2) AS kokonaismyyntihinta,
        ROUND(AVG(BookCopy.selling_price), 2) AS keskihinta
      FROM
        BookCopy
      INNER JOIN
        Book
      ON
        BookCopy.book_id = Book.book_id
      INNER JOIN
        Category
      ON
        Book.category_id = Category.category_id
      GROUP BY
        Category.category_name
      ORDER BY
        ROUND(SUM(BookCopy.selling_price), 2) DESC;
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
       VALUES ($1, $2, $3, $4, 0, NULL, NOW(), NOW()) 
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


const getFilteredBooks = async ({ title = null, author = null, type = null, category = null }) => {
try {
    let query = "SELECT * FROM Book WHERE 1=1";
    let values = [];
    let counter = 1;

    if (title) {
      query += ` AND title ILIKE $${counter}`;
      values.push(`%${title}%`);
      counter++;
    }
    if (author) {
      query += ` AND author ILIKE $${counter}`;
      values.push(`%${author}%`);
      counter++;
    }
    if (type) {
      query += ` AND type_id = (SELECT type_id FROM Type WHERE type_name = $${counter})`;
      values.push(type);
      counter++;
    }

    if (category) {
      query += ` AND category_id = (SELECT category_id FROM Category WHERE category_name = $${counter})`;
      values.push(category);
      counter++;
    }

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching filtered books:", error);
    throw error;
  }
};

module.exports = { getAllBooks, getAllBookCopies, getBookById, getBookCopyById, getBookWeightById, getR2, addBook, addBookCopy, getBookWithISBN, getFilteredBooks };
