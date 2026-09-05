// src/services/loginAttempt.service.js
// Co che chong do mat khau (brute-force protection):
//
//  - Moi lan dang nhap (dung/sai) deu duoc ghi lai vao login_attempts.
//  - Truoc khi cho xac thuc mat khau, dem so lan SAI LIEN TIEP gan nhat
//    cua 1 email trong khoang thoi gian LOGIN_WINDOW_MS.
//  - Neu so lan sai >= LOGIN_MAX_ATTEMPTS va lan sai gan nhat con nam
//    trong khoang LOGIN_LOCKOUT_MS -> tu choi ngay (429), KHONG kiem
//    tra mat khau nua - dung ke ca khi lan nay nhap dung mat khau,
//    dung yeu cau de bai "khong cho dang nhap ngay".
//  - Chi can 1 lan dang nhap THANH CONG la coi nhu chuoi that bai bi
//    "reset" (khong con bi dem la sai lien tiep nua).
const db = require('../db');
const config = require('../config');

const insertAttemptStmt = db.prepare(
  'INSERT INTO login_attempts (email, success) VALUES (?, ?)'
);

// Lay cac lan thu gan nhat cua 1 email, moi nhat truoc, gioi han trong
// window de khong phai quet toan bo lich su neu bang lon dan theo thoi gian.
const recentAttemptsStmt = db.prepare(
  `SELECT success, created_at FROM login_attempts
   WHERE email = ? AND created_at >= datetime('now', ?)
   ORDER BY created_at DESC`
);

function toSqliteOffset(ms) {
  // better-sqlite3/sqlite dung modifier dang '-60000 milliseconds'
  return `-${ms} milliseconds`;
}

function recordAttempt(email, success) {
  insertAttemptStmt.run(email, success ? 1 : 0);
}

/**
 * Tra ve { locked: boolean, retryAfterMs: number }
 * Xet trong ca 2 khoang windowMs (de dem) va lockoutMs (de xac dinh
 * con dang bi khoa hay khong) - lay khoang lon hon de truy van 1 lan.
 */
function checkLockStatus(email) {
  const lookbackMs = Math.max(config.login.windowMs, config.login.lockoutMs);
  const rows = recentAttemptsStmt.all(email, toSqliteOffset(lookbackMs));

  // Dem so lan sai lien tiep tinh tu lan gan nhat (dung se cat chuoi)
  let consecutiveFails = 0;
  let lastFailAt = null;
  for (const row of rows) {
    if (row.success) break;
    consecutiveFails += 1;
    if (!lastFailAt) lastFailAt = row.created_at;
  }

  if (consecutiveFails >= config.login.maxAttempts && lastFailAt) {
    const lastFailTime = new Date(`${lastFailAt.replace(' ', 'T')}Z`).getTime();
    const elapsed = Date.now() - lastFailTime;
    if (elapsed < config.login.lockoutMs) {
      return { locked: true, retryAfterMs: config.login.lockoutMs - elapsed };
    }
  }

  return { locked: false, retryAfterMs: 0 };
}

module.exports = { recordAttempt, checkLockStatus };
