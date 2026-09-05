// src/db/index.js
// Khoi tao 1 ket noi SQLite duy nhat (singleton), dung chung cho toan
// bo app. better-sqlite3 la thu vien DONG BO (synchronous):
//  - Moi cau lenh .run()/.get()/.all() chay xong ngay tren cung 1 tick
//    cua event loop, khong xen ke voi cau lenh khac -> rat phu hop de
//    dam bao tinh nguyen tu (atomicity) cho thao tac insert user, thay
//    vi phai tu dung transaction/lock phuc tap.
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const config = require('../config');

const dbPath = path.resolve(process.cwd(), config.db.path);

// Dam bao thu muc chua file .sqlite ton tai truoc khi mo ket noi
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL'); // tang toc ghi/doc dong thoi

function runMigrations() {
  const migrationPath = path.join(__dirname, 'migrations.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  db.exec(sql);
}

runMigrations();

module.exports = db;
