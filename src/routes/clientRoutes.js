const express = require('express');
const ClientController = require('../controllers/clientController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validation');
const { clientSchema } = require('../models/validationSchemas');

const router = express.Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Rotas de clientes
router.get('/', ClientController.getAllClients);
router.get('/:id', ClientController.getClientById);
router.post('/', validate(clientSchema), ClientController.createClient);
router.put('/:id', ClientController.updateClient);
router.delete('/:id', ClientController.deleteClient);

module.exports = router;