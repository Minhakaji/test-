// src/controllers/products.controller.js
const productService = require('../services/product.service');

// GET /products?status=...
function listByStatus(req, res, next) {
  try {
    const status = String(req.query.status || '');
    const products = productService.getProductsByStatus(status);
    return res.status(200).json({ status, count: products.length, products });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listByStatus };
