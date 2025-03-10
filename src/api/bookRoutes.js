const express = require("express");
const router = express.Router();
const bookController = require('../controllers/bookController');

router.get('/books', (req, res) => {
    console.log('Incoming request: GET /api/books');
    bookController.getBooks(req, res);
}); 

router.get('/books/filtered', (req, res) => {
    console.log('Incoming request: GET /api/books/filtered');
    bookController.getFilteredBooks(req, res);
});

//not yet implemented
router.get("/:id/weight", bookController.getBookWeightById);
router.get("/r2", bookController.getR2);
router.post("/", bookController.addBook);  

module.exports = router;
