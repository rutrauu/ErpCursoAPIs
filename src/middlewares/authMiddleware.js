const jwt = require('jsonwebtoken');
const { users } = require('../models/dataStore');

const authMiddleware = (req, res, next) => {
  try {
    // Verificar se o token foi fornecido
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de acesso requerido'
      });
    }

    // Extrair o token do cabeçalho
    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de acesso inválido'
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar o usuário no banco de dados
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }

    // Adicionar informações do usuário à requisição
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expirado'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar se o usuário é admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Acesso negado. Necessário privilégios de administrador.'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware
};