// src/middleware/errorHandler.js
// Middleware bat loi tap trung (dat cuoi cung trong chain middleware
// cua Express). Dam bao:
//  - Loi nghiep vu (AppError) tra dung statusCode + message ro rang.
//  - Loi khong luong truoc (bug, exception la) tra 500 va KHONG lo
//    chi tiet stack trace ra ngoai (tranh lo thong tin he thong).
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Loi khong xac dinh -> log lai de debug, tra ve thong diep chung
  console.error('[UNEXPECTED ERROR]', err);
  return res.status(500).json({ error: 'Da co loi xay ra, vui long thu lai sau.' });
}

module.exports = errorHandler;
