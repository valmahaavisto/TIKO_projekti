const pool = require('../config/db');
const fs = require('fs');
const xml2js = require('xml2js');

const parseXml = async (filePath) => {
    const parser = new xml2js.Parser( {explicitArray: true});
    try {
        const xmlData = fs.readFileSync(filePath, 'utf8');
        console.log("Reading XML data successfully.");
        const result = await parser.parseStringPromise(xmlData);
        console.log("Parsing XML data successfully.");
        const books = result.books.book || []
        const bookRows = [];
        for (const book of books) {
            if (!book.information || !book.information[0]) {
                console.warn('Skipping book with missing information:', book);
                continue;
            }
    
            const information = book.information[0];
            const title = information.title?.[0] || null;
            const author = information.author?.[0] || null;
            const isbn = information.isbn?.[0] || null;
            const publication_year = parseInt(information.publication_year?.[0]) || null;
            const weight = parseInt(information.weight?.[0]) || 400;
            const type = information.type?.[0] || null;
            const category = information.category?.[0] || null;
    
            const copies = book.copy || [];
            const copyDetails = [];
    
            for (const copy of copies) {
                const store_id = 2;
                const purchase_price = parseFloat(copy.purchase_price?.[0]) || 0;
                const selling_price = parseFloat(copy.selling_price?.[0]) || 0;
                copyDetails.push({ store_id, purchase_price, selling_price });
            }
            bookRows.push({isbn,title, author, publication_year, weight, type, category, copies: copyDetails});
        }
        return bookRows
    } catch (error) {
        throw new Error("Error parsing XML: ", error);
    }
};


module.exports = {parseXml};