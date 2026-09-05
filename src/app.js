// src/app.js
// Lap rap Express app. Tach rieng khoi index.js de co the import `app`
// trong file test (vi du dung supertest) ma khong can thuc su listen port.
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', routes);

// 404 cho route khong ton tai
app.use((req, res) => {
  res.status(404).json({ error: 'Khong tim thay endpoint.' });
});

// Middleware bat loi PHAI dat cuoi cung
app.use(errorHandler);

module.exports = app;
