// src/services/user.service.js
// Toan bo logic lien quan den bang `users`.
const bcrypt = require('bcryptjs');
const db = require('../db');
const config = require('../config');
const AppError = require('../utils/AppError');
const { isValidEmail, isValidPassword } = require('../utils/validators');

const findByEmailStmt = db.prepare('SELECT * FROM users WHERE email = ?');
const insertUserStmt = db.prepare(
  'INSERT INTO users (email, password_hash) VALUES (@email, @password_hash)'
);
const findByIdStmt = db.prepare('SELECT * FROM users WHERE id = ?');

function findByEmail(email) {
  return findByEmailStmt.get(email);
}

function findById(id) {
  return findByIdStmt.get(id);
}

/**
 * Tao user moi. Day la diem MAU CHOT xu ly race-condition:
 *
 * Thay vi "SELECT kiem tra ton tai -> neu khong co thi INSERT" (co
 * khoang trong giua 2 buoc, 2 request cung luc deu co the "thay" email
 * chua ton tai roi cung insert -> trung du lieu), ta INSERT truc tiep
 * va de rang buoc UNIQUE(email) cua SQLite tu quyet dinh ai thanh cong.
 *
 * better-sqlite3 thuc thi dong bo nen 2 lenh INSERT khong bao gio chay
 * xen ke nhau: request nao insert truoc se thanh cong, request insert
 * sau se nhan loi SQLITE_CONSTRAINT_UNIQUE va bi tu choi ro rang (409).
 */
function registerUser({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    throw new AppError(400, 'Email khong dung dinh dang.');
  }
  if (!isValidPassword(password, config.password.minLength)) {
    throw new AppError(
      400,
      `Mat khau phai co it nhat ${config.password.minLength} ky tu.`
    );
  }

  // Mat khau khong bao gio duoc luu dang doc nguoc lai duoc -> hash bang bcrypt
  const passwordHash = bcrypt.hashSync(password, config.password.bcryptSaltRounds);

  try {
    const result = insertUserStmt.run({
      email: normalizedEmail,
      password_hash: passwordHash,
    });
    return findByIdStmt.get(result.lastInsertRowid);
  } catch (err) {
    // Ma loi cua better-sqlite3 khi vi pham UNIQUE constraint
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === 'SQLITE_CONSTRAINT') {
      throw new AppError(409, 'Email da duoc su dung.');
    }
    throw err;
  }
}

function verifyPassword(user, plainPassword) {
  return bcrypt.compareSync(plainPassword, user.password_hash);
}

function toPublicProfile(user) {
  return { id: user.id, email: user.email, created_at: user.created_at };
}

module.exports = {
  findByEmail,
  findById,
  registerUser,
  verifyPassword,
  toPublicProfile,
};
