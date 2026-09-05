// src/controllers/account.controller.js
const AppError = require('../utils/AppError');
const userService = require('../services/user.service');

// GET /me (yeu cau da qua authMiddleware, req.user da duoc gan san)
function getMe(req, res, next) {
  try {
    const user = userService.findById(req.user.id);
    if (!user) {
      // Truong hop hiem: token hop le nhung user da bi xoa khoi DB
      throw new AppError(401, 'Tai khoan khong ton tai.');
    }
    return res.status(200).json({ user: userService.toPublicProfile(user) });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getMe };
