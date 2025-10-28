const express = require('express');
const ReportController = require('../controllers/reportController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Rotas de relatórios
router.get('/dashboard', ReportController.getDashboard);
router.get('/sales', ReportController.getSalesReport);
router.get('/inventory', ReportController.getInventoryReport);
router.get('/customers', ReportController.getCustomerReport);

module.exports = router;