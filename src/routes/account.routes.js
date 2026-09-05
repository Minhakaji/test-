// src/routes/account.routes.js
const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const accountController = require('../controllers/account.controller');

const router = Router();

router.get('/me', authMiddleware, accountController.getMe);

module.exports = router;
