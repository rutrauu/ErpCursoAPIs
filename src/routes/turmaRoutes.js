const express = require('express');
const router = express.Router();
const turmaController = require('../controllers/turmaController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validation');
const { turmaSchema } = require('../models/validationSchemas');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// GET /api/turmas - Listar turmas
router.get('/', turmaController.listarTurmas);

// GET /api/turmas/relatorio - Relatório por dia da semana e sala
router.get('/relatorio', turmaController.relatorioTurmasPorDiaSala);

// GET /api/turmas/:id - Obter turma por ID
router.get('/:id', turmaController.obterTurmaPorId);

// POST /api/turmas - Criar nova turma
router.post('/', validate(turmaSchema), turmaController.criarTurma);

// PUT /api/turmas/:id - Atualizar turma
router.put('/:id', validate(turmaSchema), turmaController.atualizarTurma);

// DELETE /api/turmas/:id - Deletar turma
router.delete('/:id', turmaController.deletarTurma);

module.exports = router;