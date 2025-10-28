require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const clientRoutes = require('./routes/clientRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');

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
    message: 'API ERP funcionando corretamente!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);

// Rota para endpoints não encontrados
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint não encontrado',
    availableEndpoints: [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/products',
      'POST /api/products',
      'GET /api/clients',
      'POST /api/clients',
      'GET /api/orders',
      'POST /api/orders',
      'GET /api/reports/dashboard',
      'GET /api/reports/sales'
    ]
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor apenas se não for um ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
  });
}

module.exports = app;