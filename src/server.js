require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const disciplinaRoutes = require('./routes/disciplinaRoutes');
const salaRoutes = require('./routes/salaRoutes');
const turmaRoutes = require('./routes/turmaRoutes');

// Importar middlewares
const errorHandler = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger de requisições
app.use(requestLogger);

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Sistema de Gestão Acadêmica funcionando corretamente!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/disciplinas', disciplinaRoutes);
app.use('/api/salas', salaRoutes);
app.use('/api/turmas', turmaRoutes);

// Rota para endpoints não encontrados
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint não encontrado',
    availableEndpoints: [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'GET /api/disciplinas',
      'POST /api/disciplinas',
      'GET /api/disciplinas/cursos',
      'GET /api/salas',
      'POST /api/salas',
      'GET /api/salas/:id/disponibilidade',
      'GET /api/turmas',
      'POST /api/turmas',
      'GET /api/turmas/relatorio'
    ]
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor apenas se não for um ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Sistema de Gestão Acadêmica rodando na porta ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🎓 Endpoints disponíveis:`);
    console.log(`   - Autenticação: /api/auth`);
    console.log(`   - Disciplinas: /api/disciplinas`);
    console.log(`   - Salas: /api/salas`);
    console.log(`   - Turmas: /api/turmas`);
  });
}

module.exports = app;