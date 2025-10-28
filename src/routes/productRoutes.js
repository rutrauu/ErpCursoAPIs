const express = require('express');
const ProductController = require('../controllers/productController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validation');
const { productSchema } = require('../models/validationSchemas');

const router = express.Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Rotas de produtos
router.get('/', ProductController.getAllProducts);
router.get('/categories', ProductController.getCategories);
router.get('/:id', ProductController.getProductById);
router.post('/', validate(productSchema), ProductController.createProduct);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;