const { v4: uuidv4 } = require('uuid');
const { salas } = require('../models/dataStore');
const { salaSchema } = require('../models/validationSchemas');

// Listar todas as salas
const listarSalas = async (req, res) => {
  try {
    const { numero, lotacao_min, lotacao_max, ativa } = req.query;
    
    let salasFiltradas = salas.filter(sala => sala.ativa !== false);
    
    // Filtro por número da sala
    if (numero) {
      salasFiltradas = salasFiltradas.filter(sala => 
        sala.numero.toLowerCase().includes(numero.toLowerCase())
      );
    }
    
    // Filtro por lotação mínima
    if (lotacao_min) {
      const minLotacao = parseInt(lotacao_min);
      if (!isNaN(minLotacao)) {
        salasFiltradas = salasFiltradas.filter(sala => 
          sala.lotacao >= minLotacao
        );
      }
    }
    
    // Filtro por lotação máxima
    if (lotacao_max) {
      const maxLotacao = parseInt(lotacao_max);
      if (!isNaN(maxLotacao)) {
        salasFiltradas = salasFiltradas.filter(sala => 
          sala.lotacao <= maxLotacao
        );
      }
    }
    
    // Filtro por status ativo
    if (ativa !== undefined) {
      const statusAtiva = ativa === 'true';
      salasFiltradas = salasFiltradas.filter(sala => 
        sala.ativa === statusAtiva
      );
    }
    
    // Ordenar por número da sala
    salasFiltradas.sort((a, b) => a.numero.localeCompare(b.numero));
    
    res.json({
      success: true,
      data: salasFiltradas,
      total: salasFiltradas.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter sala por ID
const obterSalaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sala = salas.find(s => s.id === id && s.ativa !== false);
    
    if (!sala) {
      return res.status(404).json({
        success: false,
        message: 'Sala não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: sala
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Criar nova sala
const criarSala = async (req, res) => {
  try {
    const { error, value } = salaSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    // Verificar se já existe sala com mesmo número
    const salaExistente = salas.find(s => 
      s.numero.toLowerCase() === value.numero.toLowerCase() &&
      s.ativa !== false
    );
    
    if (salaExistente) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma sala com este número'
      });
    }
    
    const novaSala = {
      id: uuidv4(),
      ...value,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    salas.push(novaSala);
    
    res.status(201).json({
      success: true,
      message: 'Sala criada com sucesso',
      data: novaSala
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Atualizar sala
const atualizarSala = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = salaSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    const salaIndex = salas.findIndex(s => s.id === id && s.ativa !== false);
    
    if (salaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Sala não encontrada'
      });
    }
    
    // Verificar se não existe outra sala com mesmo número
    const salaExistente = salas.find(s => 
      s.id !== id &&
      s.numero.toLowerCase() === value.numero.toLowerCase() &&
      s.ativa !== false
    );
    
    if (salaExistente) {
      return res.status(409).json({
        success: false,
        message: 'Já existe outra sala com este número'
      });
    }
    
    salas[salaIndex] = {
      ...salas[salaIndex],
      ...value,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      message: 'Sala atualizada com sucesso',
      data: salas[salaIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Deletar sala (soft delete)
const deletarSala = async (req, res) => {
  try {
    const { id } = req.params;
    
    const salaIndex = salas.findIndex(s => s.id === id && s.ativa !== false);
    
    if (salaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Sala não encontrada'
      });
    }
    
    // Verificar se existem turmas vinculadas a esta sala
    const { turmas } = require('../models/dataStore');
    const turmasVinculadas = turmas.filter(t => t.salaId === id && t.ativa !== false);
    
    if (turmasVinculadas.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar sala com turmas vinculadas',
        turmasVinculadas: turmasVinculadas.length
      });
    }
    
    // Soft delete
    salas[salaIndex].ativa = false;
    salas[salaIndex].updatedAt = new Date();
    
    res.json({
      success: true,
      message: 'Sala deletada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Verificar disponibilidade da sala
const verificarDisponibilidade = async (req, res) => {
  try {
    const { id } = req.params;
    const { semestreLetivo, diaSemana } = req.query;
    
    const sala = salas.find(s => s.id === id && s.ativa !== false);
    
    if (!sala) {
      return res.status(404).json({
        success: false,
        message: 'Sala não encontrada'
      });
    }
    
    // Verificar se há parâmetros de consulta
    if (!semestreLetivo || !diaSemana) {
      return res.status(400).json({
        success: false,
        message: 'Semestre letivo e dia da semana são obrigatórios'
      });
    }
    
    // Verificar conflitos com turmas existentes
    const { turmas } = require('../models/dataStore');
    const conflitos = turmas.filter(t => 
      t.salaId === id &&
      t.semestreLetivo === semestreLetivo &&
      t.diaSemana === diaSemana &&
      t.ativa !== false
    );
    
    res.json({
      success: true,
      data: {
        sala: sala,
        disponivel: conflitos.length === 0,
        conflitos: conflitos
      }
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
  listarSalas,
  obterSalaPorId,
  criarSala,
  atualizarSala,
  deletarSala,
  verificarDisponibilidade
};