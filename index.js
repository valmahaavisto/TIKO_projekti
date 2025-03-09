const express = require('express');
const pool = require('./src/config/db'); 
const createDefaultTables = require('./src/migrations/createDefaultTables'); 

const app = express();
//app.use(express.json());
app.use(express.static('public'));

const booksRoutes = require('./src/api/bookRoutes');
app.use('/api', booksRoutes);

const customerRoutes = require('./src/api/customerRoutes');
app.use('/api', customerRoutes);

app.get('/', (req, res) => {
  //res.send('Hello from Node.js server!');
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/db-test', (req, res) => {
  pool.query('SELECT * FROM Teos', (err, result) => { 
    if (err) {
      console.error('Error connecting to the database:', err);
      res.status(500).send('Database connection failed');
    } else {
      console.log('Connected to the database. Rows:', result.rows); 
      res.json(result.rows); 
    }
  });
});


// migrations
createDefaultTables()
  .then(() => {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server running on http://tie-tkannat.it.tuni.fi:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to set up database:', err);
    process.exit(1); 
  });
