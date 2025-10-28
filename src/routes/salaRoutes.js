const express = require('express');
const router = express.Router();
const salaController = require('../controllers/salaController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validation');
const { salaSchema } = require('../models/validationSchemas');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// GET /api/salas - Listar salas
router.get('/', salaController.listarSalas);

// GET /api/salas/:id - Obter sala por ID
router.get('/:id', salaController.obterSalaPorId);

// GET /api/salas/:id/disponibilidade - Verificar disponibilidade da sala
router.get('/:id/disponibilidade', salaController.verificarDisponibilidade);

// POST /api/salas - Criar nova sala
router.post('/', validate(salaSchema), salaController.criarSala);

// PUT /api/salas/:id - Atualizar sala
router.put('/:id', validate(salaSchema), salaController.atualizarSala);

// DELETE /api/salas/:id - Deletar sala
router.delete('/:id', salaController.deletarSala);

module.exports = router;