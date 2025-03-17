const pool = require("../config/db");
const Book = require("../models/Book");

const getBooks = async (req, res) => {
  try {
    const allBooks = await Book.getAllBooks();
    if (!allBooks) {
      return res.status(404).json({ error: "No books found." });
    }
    res.json(allBooks);
  } catch (err) {
    console.error("Error fetching all books:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getBookWeightById = async (req, res) => {
  console.log(`Received GET request: /api/books/${req.params.id}`);
  try {
    const bookWeight = await Book.getBookWeightById(req.params.id);
    if (!bookWeight) {
      console.log(`Book not found by id ${req.params.id}.`);
      return res.status(404).json({ error: "Book not found" });
    }
    console.log("Sending data to client:", bookWeight);
    res.json(bookWeight);
  } catch (error) {
    console.log("Error fetching book by id:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getR2 = async (req, res) => {
  try {
    const result = await Book.getR2();
    if (!result) {
      return res.status(404).json({ error: "No data found." });
    }
    res.json(result);
  } catch (error) {
    console.error("Error fetching R2 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addBook = async (req, res) => {
  const { isbn, nimi, tekija, julkaisuvuosi, tyyppi, luokka, paino } = req.body;
  console.log("HERE");
  try {
    const newBook = await Book.addBook({ isbn, nimi, tekija, julkaisuvuosi, tyyppi, luokka, paino });
    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getBookWithISBN = async (req, res) => {
  const { isbn } = req.query; 
  if (!isbn) {
    return res.status(400).json({ error: "ISBN is required" });
  }

  try {
    const book = await Book.getBookWithISBN(isbn);
    if (book) {
      res.status(200).json(book); 
    } else {
      res.status(404).json({ error: "Book not found" }); 
    }
  } catch (error) {
    console.error("Error searching book with ISBN:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const getFilteredBooks = async (req, res) => {
  //console.log('Query parameters:', req.query);
  try {
    console.log('Query parameters:', req.query);
    const filteredBooks = await Book.getFilteredBooks(req.query);
    if (!filteredBooks) {
      return res.status(404).json({ error: "No books found matching criteria." });
    }
    res.json(filteredBooks);
  } catch (error) {
    console.error("Error fetching filtered books:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getBooks, getBookWeightById, getR2, addBook, getBookWithISBN, getFilteredBooks };
