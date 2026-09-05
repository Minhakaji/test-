// src/services/product.service.js
const AppError = require('../utils/AppError');
const { PRODUCTS, VALID_STATUSES } = require('../data/products.seed');

function getProductsByStatus(status) {
  if (!VALID_STATUSES.includes(status)) {
    // Gia tri status khong nam trong danh sach hop le -> loi 400 ro rang,
    // KHONG duoc am tham tra ve danh sach rong (theo dung yeu cau de bai).
    throw new AppError(
      400,
      `Gia tri status khong hop le. Cac gia tri duoc chap nhan: ${VALID_STATUSES.join(', ')}`
    );
  }
  return PRODUCTS.filter((p) => p.status === status);
}

module.exports = { getProductsByStatus };
