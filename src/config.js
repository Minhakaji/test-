// src/config.js
// Tap trung toan bo cau hinh doc tu .env vao 1 noi duy nhat.
// Cac module khac chi import file nay, khong doc process.env truc tiep
// -> de test, de doi gia tri, tranh "magic number" rai rac trong code.

require('dotenv').config();

const config = {
  port: Number(process.env.PORT) || 3000,

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-please-change',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },

  db: {
    path: process.env.DB_PATH || './data/app.sqlite',
  },

  // Chinh sach chong do mat khau (brute-force protection)
  login: {
    maxAttempts: Number(process.env.LOGIN_MAX_ATTEMPTS) || 5,
    windowMs: Number(process.env.LOGIN_WINDOW_MS) || 60_000, // 1 phut
    lockoutMs: Number(process.env.LOGIN_LOCKOUT_MS) || 60_000, // 1 phut
  },

  password: {
    minLength: 8,
    bcryptSaltRounds: 10,
  },
};

module.exports = config;
