const { v4: uuidv4 } = require('uuid');
const { disciplinas } = require('../models/dataStore');
const { disciplinaSchema } = require('../models/validationSchemas');

// Listar todas as disciplinas
const listarDisciplinas = async (req, res) => {
  try {
    const { curso, semestre, ativa } = req.query;
    
    let disciplinasFiltradas = disciplinas.filter(disciplina => disciplina.ativa !== false);
    
    // Filtro por curso
    if (curso) {
      disciplinasFiltradas = disciplinasFiltradas.filter(disciplina => 
        disciplina.curso.toLowerCase().includes(curso.toLowerCase())
      );
    }
    
    // Filtro por semestre
    if (semestre) {
      disciplinasFiltradas = disciplinasFiltradas.filter(disciplina => 
        disciplina.semestre === semestre
      );
    }
    
    // Filtro por status ativo
    if (ativa !== undefined) {
      const statusAtiva = ativa === 'true';
      disciplinasFiltradas = disciplinasFiltradas.filter(disciplina => 
        disciplina.ativa === statusAtiva
      );
    }
    
    res.json({
      success: true,
      data: disciplinasFiltradas,
      total: disciplinasFiltradas.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter disciplina por ID
const obterDisciplinaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const disciplina = disciplinas.find(d => d.id === id && d.ativa !== false);
    
    if (!disciplina) {
      return res.status(404).json({
        success: false,
        message: 'Disciplina não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: disciplina
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Criar nova disciplina
const criarDisciplina = async (req, res) => {
  try {
    const { error, value } = disciplinaSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    // Verificar se já existe disciplina com mesmo nome no mesmo semestre
    const disciplinaExistente = disciplinas.find(d => 
      d.nome.toLowerCase() === value.nome.toLowerCase() &&
      d.semestre === value.semestre &&
      d.ativa !== false
    );
    
    if (disciplinaExistente) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma disciplina com este nome no semestre especificado'
      });
    }
    
    const novaDisciplina = {
      id: uuidv4(),
      ...value,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    disciplinas.push(novaDisciplina);
    
    res.status(201).json({
      success: true,
      message: 'Disciplina criada com sucesso',
      data: novaDisciplina
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Atualizar disciplina
const atualizarDisciplina = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = disciplinaSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    const disciplinaIndex = disciplinas.findIndex(d => d.id === id && d.ativa !== false);
    
    if (disciplinaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Disciplina não encontrada'
      });
    }
    
    // Verificar se não existe outra disciplina com mesmo nome no mesmo semestre
    const disciplinaExistente = disciplinas.find(d => 
      d.id !== id &&
      d.nome.toLowerCase() === value.nome.toLowerCase() &&
      d.semestre === value.semestre &&
      d.ativa !== false
    );
    
    if (disciplinaExistente) {
      return res.status(409).json({
        success: false,
        message: 'Já existe outra disciplina com este nome no semestre especificado'
      });
    }
    
    disciplinas[disciplinaIndex] = {
      ...disciplinas[disciplinaIndex],
      ...value,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      message: 'Disciplina atualizada com sucesso',
      data: disciplinas[disciplinaIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Deletar disciplina (soft delete)
const deletarDisciplina = async (req, res) => {
  try {
    const { id } = req.params;
    
    const disciplinaIndex = disciplinas.findIndex(d => d.id === id && d.ativa !== false);
    
    if (disciplinaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Disciplina não encontrada'
      });
    }
    
    // Verificar se existem turmas vinculadas a esta disciplina
    const { turmas } = require('../models/dataStore');
    const turmasVinculadas = turmas.filter(t => t.disciplinaId === id && t.ativa !== false);
    
    if (turmasVinculadas.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar disciplina com turmas vinculadas',
        turmasVinculadas: turmasVinculadas.length
      });
    }
    
    // Soft delete
    disciplinas[disciplinaIndex].ativa = false;
    disciplinas[disciplinaIndex].updatedAt = new Date();
    
    res.json({
      success: true,
      message: 'Disciplina deletada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Listar cursos únicos
const listarCursos = async (req, res) => {
  try {
    const cursosUnicos = [...new Set(
      disciplinas
        .filter(d => d.ativa !== false)
        .map(d => d.curso)
    )].sort();
    
    res.json({
      success: true,
      data: cursosUnicos,
      total: cursosUnicos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  listarDisciplinas,
  obterDisciplinaPorId,
  criarDisciplina,
  atualizarDisciplina,
  deletarDisciplina,
  listarCursos
};