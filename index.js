const http = require("http");
const express = require("express");
const dotenv = require("dotenv");
const bookRoutes = require("./src/api/bookRoutes");

dotenv.config();
const app = express();

app.use(express.json());
app.use("/api/books", bookRoutes); 

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const hostname = process.env.HOST || "192.168.4.115";
const port = process.env.PORT || 8080;

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://tie-tkannat.it.tuni.fi:${port}/`);
});
