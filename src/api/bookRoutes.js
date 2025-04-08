const express = require("express");
const router = express.Router();
const bookController = require('../controllers/bookController');

router.get('/books', (req, res) => {
    console.log('Incoming request: GET /api/books');
    bookController.getBooks(req, res);
}); 

router.get('/bookcopies', (req, res) => {
    console.log('Incoming request: GET /api/bookcopies');
    console.log(req.query);
    bookController.getBookCopies(req, res);
});

router.get('/books/getBookById/', (req, res) => {
    console.log('Incoming request: GET /api/books/getBookById');
    bookController.getBookById(req, res);
});

router.get('/books/getBookCopyById', (req, res) => {
    console.log('Incoming request: GET /api/books/getBookCopyById');
    bookController.getBookCopyById(req, res);
});

router.get('/books/filtered', (req, res) => {
    console.log('Incoming request: GET /api/books/filtered');
    bookController.getFilteredBooks(req, res);
});

router.get('/books/getBookWithISBN', (req, res) => {
    console.log('Incoming request: GET /api/books/getBookWithISBN');
    bookController.getBookWithISBN(req, res);
});

router.post('/books/addBook', (req, res) => {
    console.log('Incoming request: POST /api/books/addBook');
    bookController.addBook(req, res);
});

router.post('/books/addBookCopy', (req, res) => {
    console.log('Incoming request: POST /api/books/addBookCopy');
    bookController.addBookCopy(req, res);
});

router.get('/books/export-r2', (req, res) => {
    console.log('Incoming request: GET /api/books/export-r2');
    bookController.getR2(req, res);
});

router.get("/:id/weight", bookController.getBookWeightById);

module.exports = router;
