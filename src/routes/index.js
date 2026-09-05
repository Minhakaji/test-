// src/routes/index.js
// Gom tat ca route con lai thanh 1 router duy nhat de app.js chi can
// mount 1 lan (router.use('/', require('./routes'))).
const { Router } = require('express');

const authRoutes = require('./auth.routes');
const accountRoutes = require('./account.routes');
const productsRoutes = require('./products.routes');

const router = Router();

router.use(authRoutes);
router.use(accountRoutes);
router.use(productsRoutes);

// Endpoint kiem tra server song hay khong, huu ich khi deploy
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

module.exports = router;
