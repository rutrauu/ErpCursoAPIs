const errorHandler = (err, req, res, next) => {
  console.error('🚨 Erro capturado:', err);

  // Erro de validação do Joi
  if (err.isJoi) {
    return res.status(400).json({
      status: 'error',
      message: 'Dados de entrada inválidos',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Erro de JSON malformado
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'JSON inválido fornecido'
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token de autenticação inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token de autenticação expirado'
    });
  }

  // Erro personalizado com status
  if (err.status) {
    return res.status(err.status).json({
      status: 'error',
      message: err.message || 'Erro no servidor'
    });
  }

  // Erro interno do servidor
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;