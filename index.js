const express = require('express');
const pool = require('./src/config/db'); 
const createDefaultTables = require('./src/migrations/createDefaultTables');
const insertTestData = require('./src/migrations/insertTestData'); 

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  next();
});

const bookRoutes = require('./src/api/bookRoutes');
app.use('/api', bookRoutes);

const customerRoutes = require('./src/api/customerRoutes');
app.use('/api', customerRoutes);

const orderRoutes = require('./src/api/orderRoutes');
app.use('/api', orderRoutes);

const xmlRoutes = require('./src/api/xmlRoutes');
app.use('/api', xmlRoutes);


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/books', (req, res) => {
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
  .then(() => insertTestData())
  .then(() => {
    const PORT = 8080;
    app.listen(PORT, () => {
      console.log(`Server running on http://tie-tkannat.it.tuni.fi:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to set up database:', err);
    process.exit(1); 
  });