const jwt = require('jsonwebtoken');

// Gerar token JWT
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Verificar token JWT
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Gerar resposta padronizada de sucesso
const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    status: 'success',
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

// Gerar resposta padronizada de erro
const errorResponse = (res, statusCode, message, details = null) => {
  const response = {
    status: 'error',
    message
  };
  
  if (details && process.env.NODE_ENV !== 'production') {
    response.details = details;
  }
  
  return res.status(statusCode).json(response);
};

// Validar formato de email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Gerar código único
const generateCode = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

// Calcular paginação
const calculatePagination = (page, limit, totalItems) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

// Formatar valor monetário
const formatCurrency = (value, currency = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency
  }).format(value);
};

// Remover caracteres especiais de documentos
const cleanDocument = (document) => {
  return document.replace(/[^\d]/g, '');
};

// Validar CPF
const isValidCPF = (cpf) => {
  cpf = cleanDocument(cpf);
  
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  
  let checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) {
    checkDigit = 0;
  }
  
  if (checkDigit !== parseInt(cpf.charAt(9))) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  
  checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) {
    checkDigit = 0;
  }
  
  return checkDigit === parseInt(cpf.charAt(10));
};

module.exports = {
  generateToken,
  verifyToken,
  successResponse,
  errorResponse,
  isValidEmail,
  generateCode,
  calculatePagination,
  formatCurrency,
  cleanDocument,
  isValidCPF
};