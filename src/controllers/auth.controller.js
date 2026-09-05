// src/controllers/auth.controller.js
const AppError = require('../utils/AppError');
const userService = require('../services/user.service');
const tokenService = require('../services/token.service');
const loginAttemptService = require('../services/loginAttempt.service');

// POST /register
function register(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const user = userService.registerUser({ email, password });
    return res.status(201).json({ user: userService.toPublicProfile(user) });
  } catch (err) {
    return next(err);
  }
}

// POST /login
function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw new AppError(400, 'Vui long nhap day du email va mat khau.');
    }

    // 1) Kiem tra xem email nay co dang bi khoa tam thoi khong.
    //    Buoc nay PHAI dung TRUOC khi xac thuc mat khau, de dam bao
    //    ke ca nhap dung mat khau cung khong duoc dang nhap khi dang khoa.
    const lockStatus = loginAttemptService.checkLockStatus(normalizedEmail);
    if (lockStatus.locked) {
      const retryAfterSec = Math.ceil(lockStatus.retryAfterMs / 1000);
      res.set('Retry-After', String(retryAfterSec));
      throw new AppError(
        429,
        `Tai khoan tam bi khoa do dang nhap sai qua nhieu lan. Vui long thu lai sau ${retryAfterSec} giay.`
      );
    }

    // 2) Xac thuc email/mat khau nhu binh thuong
    const user = userService.findByEmail(normalizedEmail);
    const isValid = user ? userService.verifyPassword(user, password) : false;

    // Luon ghi lai lan thu nay (dung hoac sai) de phuc vu dem lockout ve sau
    loginAttemptService.recordAttempt(normalizedEmail, isValid);

    if (!isValid) {
      throw new AppError(401, 'Email hoac mat khau khong dung.');
    }

    const token = tokenService.issueToken(user);
    return res.status(200).json({ token });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login };
