// Middleware para validação de dados usando Joi
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Dados de entrada inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    // Substituir req.body pelos dados validados e limpos
    req.body = value;
    next();
  };
};

module.exports = validate;