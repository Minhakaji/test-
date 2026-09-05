// src/utils/AppError.js
// Loi nghiep vu duoc "biet truoc" (vi du: sai dinh dang email, trung
// email, sai mat khau...). Middleware errorHandler se doc statusCode
// tu day de tra ve dung ma HTTP, thay vi luon tra 500 chung chung.
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // phan biet voi loi lap trinh (bug) khac
  }
}

module.exports = AppError;
