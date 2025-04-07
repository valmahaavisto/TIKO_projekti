const { parseXml } = require('../models/xmlHandler');
const { addBook, addBookCopy } = require('../models/Book');
const fs = require('fs');
// muutokset index.js, npm install, html nappi??

const handleXMLUpload = async (req, res) => {
    try {
        const filePath = req.file.path;
        const books = await parseXml(filePath);
        for (const book of books) {
            console.log("Book info:", { isbn: book.isbn, title: book.title, author: book.author, publication_year: book.publication_year, weight: book.weight, type: book.type, category: book.category });
            const book_id = await addBook({
                isbn: book.isbn,                 // Mapping isbn to isbn
                nimi: book.title,                // Mapping title to nimi
                tekija: book.author,             // Mapping author to tekija
                julkaisuvuosi: book.publication_year, // Mapping publication_year to julkaisuvuosi
                tyyppi: book.type,               // Mapping type to tyyppi
                luokka: book.category,           // Mapping category to luokka
                paino: book.weight               // Mapping weight to paino
            });
            if (book.copies.length === 0) {
                console.log(`Book with book_id ${book_id} has no copies`);
            } else {
                for (const copy of book.copies) {
                    const copyDetails = {book_id, store_id: copy.store_id, purchase_price: copy.purchase_price, selling_price: copy.selling_price};
                    const copy_id = await addBookCopy(copyDetails);
                    console.log("Book copy added to database with copy_id: ", copy_id);
                }
            }
        }
        res.status(200).send("XML file processed and book data inserted to database");   
    } catch (error) {
        console.error('Error processing XML:', error)
        res.status(500).send('Error processing XML file');
    } finally {
        // Removes the uploaded xml file from uploads folder
        fs.unlink(req.file.path, () => {});
    }
};

module.exports = { handleXMLUpload };