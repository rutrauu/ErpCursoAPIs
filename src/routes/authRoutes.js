const express = require('express');
const AuthController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validation');
const { userSchema, loginSchema } = require('../models/validationSchemas');

const router = express.Router();

// Rotas públicas
router.post('/register', validate(userSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);

// Rotas protegidas
router.get('/profile', authMiddleware, AuthController.getProfile);

// Rotas apenas para admin
router.get('/users', authMiddleware, adminMiddleware, AuthController.getAllUsers);

module.exports = router;