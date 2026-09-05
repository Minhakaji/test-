// src/middleware/authMiddleware.js
// Middleware kiem tra header "Authorization: Bearer <token>".
// Dung cho moi endpoint can dang nhap: GET /me, GET /products.
const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    // Thieu token -> 401, khong duoc lo bat ky thong tin tai khoan nao
    return next(new AppError(401, 'Thieu token xac thuc.'));
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    // Gan thong tin user da giai ma vao request de controller phia sau dung
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    // Token sai chu ky hoac het han deu roi vao day
    return next(new AppError(401, 'Token khong hop le hoac da het han.'));
  }
}

module.exports = authMiddleware;
