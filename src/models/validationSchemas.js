const Joi = require('joi');

// Schema para validação de usuário
const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome completo deve ter pelo menos 2 caracteres',
    'string.max': 'Nome completo deve ter no máximo 100 caracteres',
    'any.required': 'Nome completo é obrigatório'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ser válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória'
  }),
  role: Joi.string().valid('admin', 'professor', 'coordenador').default('professor')
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

// Schema para disciplina
const disciplinaSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome da disciplina deve ter pelo menos 2 caracteres',
    'string.max': 'Nome da disciplina deve ter no máximo 100 caracteres',
    'any.required': 'Nome da disciplina é obrigatório'
  }),
  curso: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome do curso deve ter pelo menos 2 caracteres',
    'string.max': 'Nome do curso deve ter no máximo 100 caracteres',
    'any.required': 'Nome do curso é obrigatório'
  }),
  descricao: Joi.string().max(500).required().messages({
    'string.max': 'Descrição deve ter no máximo 500 caracteres',
    'any.required': 'Descrição é obrigatória'
  }),
  cargaHoraria: Joi.number().integer().positive().required().messages({
    'number.integer': 'Carga horária deve ser um número inteiro',
    'number.positive': 'Carga horária deve ser um valor positivo',
    'any.required': 'Carga horária é obrigatória'
  }),
  semestre: Joi.string().pattern(/^\d{4}\/[12]$/).required().messages({
    'string.pattern.base': 'Semestre deve estar no formato YYYY/N (ex: 2025/2)',
    'any.required': 'Semestre é obrigatório'
  }),
  ativa: Joi.boolean().default(true)
});

// Schema para sala
const salaSchema = Joi.object({
  numero: Joi.string().min(2).max(20).required().messages({
    'string.min': 'Número da sala deve ter pelo menos 2 caracteres',
    'string.max': 'Número da sala deve ter no máximo 20 caracteres',
    'any.required': 'Número da sala é obrigatório'
  }),
  descricao: Joi.string().max(200).required().messages({
    'string.max': 'Descrição deve ter no máximo 200 caracteres',
    'any.required': 'Descrição é obrigatória'
  }),
  lotacao: Joi.number().integer().positive().required().messages({
    'number.integer': 'Lotação deve ser um número inteiro',
    'number.positive': 'Lotação deve ser um valor positivo',
    'any.required': 'Lotação é obrigatória'
  }),
  nome: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Nome da sala deve ter pelo menos 2 caracteres',
    'string.max': 'Nome da sala deve ter no máximo 100 caracteres'
  }),
  tipo: Joi.string().valid('sala-aula', 'laboratorio', 'auditorio', 'biblioteca').optional().messages({
    'any.only': 'Tipo deve ser: sala-aula, laboratorio, auditorio ou biblioteca'
  }),
  ativa: Joi.boolean().default(true)
}).options({ allowUnknown: false });

// Schema para turma (versão básica)
const turmaBasicaSchema = Joi.object({
  semestreLetivo: Joi.string().pattern(/^\d{4}\/[12]$/).required().messages({
    'string.pattern.base': 'Semestre letivo deve estar no formato YYYY/N (ex: 2025/2)',
    'any.required': 'Semestre letivo é obrigatório'
  }),
  disciplinaId: Joi.string().required().messages({
    'any.required': 'ID da disciplina é obrigatório'
  }),
  professor: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome do professor deve ter pelo menos 2 caracteres',
    'string.max': 'Nome do professor deve ter no máximo 100 caracteres',
    'any.required': 'Nome do professor é obrigatório'
  })
});

// Schema para turma (versão melhorada)
const turmaSchema = Joi.object({
  semestreLetivo: Joi.string().pattern(/^\d{4}\/[12]$/).required().messages({
    'string.pattern.base': 'Semestre letivo deve estar no formato YYYY/N (ex: 2025/2)',
    'any.required': 'Semestre letivo é obrigatório'
  }),
  disciplinaId: Joi.string().required().messages({
    'any.required': 'ID da disciplina é obrigatório'
  }),
  professor: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome do professor deve ter pelo menos 2 caracteres',
    'string.max': 'Nome do professor deve ter no máximo 100 caracteres',
    'any.required': 'Nome do professor é obrigatório'
  }),
  salaId: Joi.string().required().messages({
    'any.required': 'ID da sala é obrigatório'
  }),
  diaSemana: Joi.string().valid(
    'segunda-feira', 'terça-feira', 'quarta-feira', 
    'quinta-feira', 'sexta-feira', 'sábado'
  ).required().messages({
    'any.only': 'Dia da semana deve ser: segunda-feira, terça-feira, quarta-feira, quinta-feira, sexta-feira ou sábado',
    'any.required': 'Dia da semana é obrigatório'
  }),
  // Aceita tanto horário unificado quanto horários separados
  horario: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().messages({
    'string.pattern.base': 'Horário deve estar no formato HH:MM-HH:MM (ex: 19:00-22:30)'
  }),
  horarioInicio: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().messages({
    'string.pattern.base': 'Horário de início deve estar no formato HH:MM (ex: 19:00)'
  }),
  horarioFim: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().messages({
    'string.pattern.base': 'Horário de fim deve estar no formato HH:MM (ex: 22:30)'
  }),
  vagas: Joi.number().integer().positive().optional().default(30).messages({
    'number.integer': 'Número de vagas deve ser um inteiro',
    'number.positive': 'Número de vagas deve ser positivo'
  }),
  ativa: Joi.boolean().default(true)
}).or('horario', 'horarioInicio').messages({
  'object.missing': 'Deve fornecer pelo menos horário ou horário de início'
});

module.exports = {
  userSchema,
  loginSchema,
  disciplinaSchema,
  salaSchema,
  turmaBasicaSchema,
  turmaSchema
};