const express = require('express');
const router = express.Router();
const disciplinaController = require('../controllers/disciplinaController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validation');
const { disciplinaSchema } = require('../models/validationSchemas');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// GET /api/disciplinas - Listar disciplinas
router.get('/', disciplinaController.listarDisciplinas);

// GET /api/disciplinas/cursos - Listar cursos únicos
router.get('/cursos', disciplinaController.listarCursos);

// GET /api/disciplinas/:id - Obter disciplina por ID
router.get('/:id', disciplinaController.obterDisciplinaPorId);

// POST /api/disciplinas - Criar nova disciplina
router.post('/', validate(disciplinaSchema), disciplinaController.criarDisciplina);

// PUT /api/disciplinas/:id - Atualizar disciplina
router.put('/:id', validate(disciplinaSchema), disciplinaController.atualizarDisciplina);

// DELETE /api/disciplinas/:id - Deletar disciplina
router.delete('/:id', disciplinaController.deletarDisciplina);

module.exports = router;