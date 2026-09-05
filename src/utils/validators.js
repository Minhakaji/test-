// src/utils/validators.js
// Cac ham kiem tra dinh dang du lieu dau vao don gian, khong phu thuoc
// thu vien ngoai de giu du an gon nhe.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}

function isValidPassword(password, minLength) {
  return typeof password === 'string' && password.length >= minLength;
}

module.exports = { isValidEmail, isValidPassword };
