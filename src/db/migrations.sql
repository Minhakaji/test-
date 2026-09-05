-- src/db/migrations.sql
-- Bang users: UNIQUE(email) la chot chan chinh de dam bao khong bao gio
-- co 2 tai khoan trung email, ke ca khi 2 request /register den gan
-- nhu dong thoi (ung dung khong the tu "check roi insert" vi van con
-- khoang trong (race window) giua 2 buoc do - phai de tang UNIQUE cua
-- chinh DB engine xu ly nguyen tu (atomic) thay vi tu kiem tra o code).
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Bang login_attempts: luu lai moi lan dang nhap that bai/thanh cong
-- de phuc vu co che chong do mat khau (dem so lan sai lien tiep trong
-- 1 khoang thoi gian cho tung email).
CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  success INTEGER NOT NULL DEFAULT 0, -- 0 = that bai, 1 = thanh cong
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time
  ON login_attempts (email, created_at);
