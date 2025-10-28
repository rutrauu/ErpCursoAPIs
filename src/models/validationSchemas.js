const Joi = require('joi');

// Schema para validação de usuário
const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ser válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória'
  }),
  role: Joi.string().valid('admin', 'user').default('user')
});

// Schema para login
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ser válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Senha é obrigatória'
  })
});

// Schema para produto
const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome do produto deve ter pelo menos 2 caracteres',
    'string.max': 'Nome do produto deve ter no máximo 100 caracteres',
    'any.required': 'Nome do produto é obrigatório'
  }),
  description: Joi.string().max(500).required().messages({
    'string.max': 'Descrição deve ter no máximo 500 caracteres',
    'any.required': 'Descrição é obrigatória'
  }),
  price: Joi.number().positive().required().messages({
    'number.positive': 'Preço deve ser um valor positivo',
    'any.required': 'Preço é obrigatório'
  }),
  category: Joi.string().required().messages({
    'any.required': 'Categoria é obrigatória'
  }),
  stock: Joi.number().integer().min(0).required().messages({
    'number.integer': 'Estoque deve ser um número inteiro',
    'number.min': 'Estoque não pode ser negativo',
    'any.required': 'Estoque é obrigatório'
  }),
  code: Joi.string().required().messages({
    'any.required': 'Código do produto é obrigatório'
  }),
  active: Joi.boolean().default(true)
});

// Schema para cliente
const clientSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ser válido',
    'any.required': 'Email é obrigatório'
  }),
  phone: Joi.string().required().messages({
    'any.required': 'Telefone é obrigatório'
  }),
  document: Joi.string().required().messages({
    'any.required': 'Documento é obrigatório'
  }),
  address: Joi.object({
    street: Joi.string().required().messages({
      'any.required': 'Endereço é obrigatório'
    }),
    city: Joi.string().required().messages({
      'any.required': 'Cidade é obrigatória'
    }),
    state: Joi.string().length(2).required().messages({
      'string.length': 'Estado deve ter 2 caracteres',
      'any.required': 'Estado é obrigatório'
    }),
    zipCode: Joi.string().required().messages({
      'any.required': 'CEP é obrigatório'
    })
  }).required(),
  active: Joi.boolean().default(true)
});

// Schema para pedido
const orderSchema = Joi.object({
  clientId: Joi.string().required().messages({
    'any.required': 'ID do cliente é obrigatório'
  }),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required().messages({
        'any.required': 'ID do produto é obrigatório'
      }),
      quantity: Joi.number().integer().positive().required().messages({
        'number.integer': 'Quantidade deve ser um número inteiro',
        'number.positive': 'Quantidade deve ser positiva',
        'any.required': 'Quantidade é obrigatória'
      })
    })
  ).min(1).required().messages({
    'array.min': 'Pedido deve ter pelo menos 1 item',
    'any.required': 'Itens do pedido são obrigatórios'
  }),
  notes: Joi.string().max(500).allow('').optional()
});

module.exports = {
  userSchema,
  loginSchema,
  productSchema,
  clientSchema,
  orderSchema
};