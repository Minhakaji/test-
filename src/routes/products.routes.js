// src/routes/products.routes.js
const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const productsController = require('../controllers/products.controller');

const router = Router();

router.get('/products', authMiddleware, productsController.listByStatus);

module.exports = router;
