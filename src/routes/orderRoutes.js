const express = require('express');
const OrderController = require('../controllers/orderController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validation');
const { orderSchema } = require('../models/validationSchemas');

const router = express.Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Rotas de pedidos
router.get('/', OrderController.getAllOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/', validate(orderSchema), OrderController.createOrder);
router.patch('/:id/status', OrderController.updateOrderStatus);
router.delete('/:id', OrderController.deleteOrder);

module.exports = router;