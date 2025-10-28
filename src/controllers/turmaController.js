const { v4: uuidv4 } = require('uuid');
const { turmas, disciplinas, salas } = require('../models/dataStore');
const { turmaSchema } = require('../models/validationSchemas');

// Listar todas as turmas
const listarTurmas = async (req, res) => {
  try {
    const { semestreLetivo, disciplinaId, professor, salaId, diaSemana, ordenacao } = req.query;
    
    let turmasFiltradas = turmas.filter(turma => turma.ativa !== false);
    
    // Aplicar filtros
    if (semestreLetivo) {
      turmasFiltradas = turmasFiltradas.filter(turma => 
        turma.semestreLetivo === semestreLetivo
      );
    }
    
    if (disciplinaId) {
      turmasFiltradas = turmasFiltradas.filter(turma => 
        turma.disciplinaId === disciplinaId
      );
    }
    
    if (professor) {
      turmasFiltradas = turmasFiltradas.filter(turma => 
        turma.professor.toLowerCase().includes(professor.toLowerCase())
      );
    }
    
    if (salaId) {
      turmasFiltradas = turmasFiltradas.filter(turma => 
        turma.salaId === salaId
      );
    }
    
    if (diaSemana) {
      turmasFiltradas = turmasFiltradas.filter(turma => 
        turma.diaSemana === diaSemana
      );
    }
    
    // Enriquecer dados com informações de disciplina e sala
    const turmasEnriquecidas = turmasFiltradas.map(turma => {
      const disciplina = disciplinas.find(d => d.id === turma.disciplinaId);
      const sala = salas.find(s => s.id === turma.salaId);
      
      return {
        ...turma,
        disciplina: disciplina ? {
          id: disciplina.id,
          nome: disciplina.nome,
          curso: disciplina.curso,
          cargaHoraria: disciplina.cargaHoraria
        } : null,
        sala: sala ? {
          id: sala.id,
          numero: sala.numero,
          descricao: sala.descricao,
          lotacao: sala.lotacao
        } : null
      };
    });
    
    // Ordenação (por dia da semana e salas conforme requisito A)
    if (ordenacao === 'dia-sala' || !ordenacao) {
      const ordemDias = {
        'segunda-feira': 1,
        'terça-feira': 2,
        'quarta-feira': 3,
        'quinta-feira': 4,
        'sexta-feira': 5,
        'sábado': 6
      };
      
      turmasEnriquecidas.sort((a, b) => {
        // Primeiro por dia da semana
        const diaA = ordemDias[a.diaSemana] || 7;
        const diaB = ordemDias[b.diaSemana] || 7;
        
        if (diaA !== diaB) {
          return diaA - diaB;
        }
        
        // Depois por número da sala
        const salaA = a.sala?.numero || '';
        const salaB = b.sala?.numero || '';
        return salaA.localeCompare(salaB);
      });
    }
    
    res.json({
      success: true,
      data: turmasEnriquecidas,
      total: turmasEnriquecidas.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter turma por ID
const obterTurmaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const turma = turmas.find(t => t.id === id && t.ativa !== false);
    
    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }
    
    // Enriquecer com dados de disciplina e sala
    const disciplina = disciplinas.find(d => d.id === turma.disciplinaId);
    const sala = salas.find(s => s.id === turma.salaId);
    
    const turmaEnriquecida = {
      ...turma,
      disciplina: disciplina ? {
        id: disciplina.id,
        nome: disciplina.nome,
        curso: disciplina.curso,
        descricao: disciplina.descricao,
        cargaHoraria: disciplina.cargaHoraria,
        semestre: disciplina.semestre
      } : null,
      sala: sala ? {
        id: sala.id,
        numero: sala.numero,
        descricao: sala.descricao,
        lotacao: sala.lotacao
      } : null
    };
    
    res.json({
      success: true,
      data: turmaEnriquecida
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Criar nova turma (com todas as regras de negócio)
const criarTurma = async (req, res) => {
  try {
    const { error, value } = turmaSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    // Verificar se a disciplina existe
    const disciplina = disciplinas.find(d => d.id === value.disciplinaId && d.ativa !== false);
    if (!disciplina) {
      return res.status(400).json({
        success: false,
        message: 'Disciplina não encontrada'
      });
    }
    
    // Verificar se a sala existe
    const sala = salas.find(s => s.id === value.salaId && s.ativa !== false);
    if (!sala) {
      return res.status(400).json({
        success: false,
        message: 'Sala não encontrada'
      });
    }
    
    // RN1: Verificar relação 1:1 entre turma e disciplina
    const turmaComMesmaDisciplina = turmas.find(t => 
      t.disciplinaId === value.disciplinaId &&
      t.semestreLetivo === value.semestreLetivo &&
      t.ativa !== false
    );
    
    if (turmaComMesmaDisciplina) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma turma para esta disciplina no semestre especificado'
      });
    }
    
    // RN2: Não pode ter turmas do mesmo semestre no mesmo dia da semana (assumindo que é por professor)
    const turmaConflitoProfessor = turmas.find(t =>
      t.semestreLetivo === value.semestreLetivo &&
      t.professor.toLowerCase() === value.professor.toLowerCase() &&
      t.diaSemana === value.diaSemana &&
      t.ativa !== false
    );
    
    if (turmaConflitoProfessor) {
      return res.status(409).json({
        success: false,
        message: 'Este professor já possui uma turma no mesmo dia da semana neste semestre'
      });
    }
    
    // RN3: Não pode ter mais de uma turma na mesma sala no mesmo dia da semana
    const turmaConflitoSala = turmas.find(t =>
      t.salaId === value.salaId &&
      t.diaSemana === value.diaSemana &&
      t.semestreLetivo === value.semestreLetivo &&
      t.ativa !== false
    );
    
    if (turmaConflitoSala) {
      return res.status(409).json({
        success: false,
        message: 'Esta sala já está ocupada no mesmo dia da semana neste semestre'
      });
    }
    
    const novaTurma = {
      id: uuidv4(),
      ...value,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    turmas.push(novaTurma);
    
    // Retornar turma enriquecida
    const turmaEnriquecida = {
      ...novaTurma,
      disciplina: {
        id: disciplina.id,
        nome: disciplina.nome,
        curso: disciplina.curso,
        cargaHoraria: disciplina.cargaHoraria
      },
      sala: {
        id: sala.id,
        numero: sala.numero,
        descricao: sala.descricao,
        lotacao: sala.lotacao
      }
    };
    
    res.status(201).json({
      success: true,
      message: 'Turma criada com sucesso',
      data: turmaEnriquecida
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Atualizar turma
const atualizarTurma = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = turmaSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    const turmaIndex = turmas.findIndex(t => t.id === id && t.ativa !== false);
    
    if (turmaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }
    
    // Verificar se a disciplina existe
    const disciplina = disciplinas.find(d => d.id === value.disciplinaId && d.ativa !== false);
    if (!disciplina) {
      return res.status(400).json({
        success: false,
        message: 'Disciplina não encontrada'
      });
    }
    
    // Verificar se a sala existe
    const sala = salas.find(s => s.id === value.salaId && s.ativa !== false);
    if (!sala) {
      return res.status(400).json({
        success: false,
        message: 'Sala não encontrada'
      });
    }
    
    // Aplicar mesmas regras de negócio da criação, excluindo a turma atual
    const turmaComMesmaDisciplina = turmas.find(t => 
      t.id !== id &&
      t.disciplinaId === value.disciplinaId &&
      t.semestreLetivo === value.semestreLetivo &&
      t.ativa !== false
    );
    
    if (turmaComMesmaDisciplina) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma turma para esta disciplina no semestre especificado'
      });
    }
    
    const turmaConflitoProfessor = turmas.find(t =>
      t.id !== id &&
      t.semestreLetivo === value.semestreLetivo &&
      t.professor.toLowerCase() === value.professor.toLowerCase() &&
      t.diaSemana === value.diaSemana &&
      t.ativa !== false
    );
    
    if (turmaConflitoProfessor) {
      return res.status(409).json({
        success: false,
        message: 'Este professor já possui uma turma no mesmo dia da semana neste semestre'
      });
    }
    
    const turmaConflitoSala = turmas.find(t =>
      t.id !== id &&
      t.salaId === value.salaId &&
      t.diaSemana === value.diaSemana &&
      t.semestreLetivo === value.semestreLetivo &&
      t.ativa !== false
    );
    
    if (turmaConflitoSala) {
      return res.status(409).json({
        success: false,
        message: 'Esta sala já está ocupada no mesmo dia da semana neste semestre'
      });
    }
    
    turmas[turmaIndex] = {
      ...turmas[turmaIndex],
      ...value,
      updatedAt: new Date()
    };
    
    const turmaEnriquecida = {
      ...turmas[turmaIndex],
      disciplina: {
        id: disciplina.id,
        nome: disciplina.nome,
        curso: disciplina.curso,
        cargaHoraria: disciplina.cargaHoraria
      },
      sala: {
        id: sala.id,
        numero: sala.numero,
        descricao: sala.descricao,
        lotacao: sala.lotacao
      }
    };
    
    res.json({
      success: true,
      message: 'Turma atualizada com sucesso',
      data: turmaEnriquecida
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Deletar turma (soft delete)
const deletarTurma = async (req, res) => {
  try {
    const { id } = req.params;
    
    const turmaIndex = turmas.findIndex(t => t.id === id && t.ativa !== false);
    
    if (turmaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }
    
    // Soft delete
    turmas[turmaIndex].ativa = false;
    turmas[turmaIndex].updatedAt = new Date();
    
    res.json({
      success: true,
      message: 'Turma deletada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Relatório de turmas por dia da semana e sala (requisito específico)
const relatorioTurmasPorDiaSala = async (req, res) => {
  try {
    const { semestreLetivo } = req.query;
    
    let turmasFiltradas = turmas.filter(turma => turma.ativa !== false);
    
    if (semestreLetivo) {
      turmasFiltradas = turmasFiltradas.filter(turma => 
        turma.semestreLetivo === semestreLetivo
      );
    }
    
    // Enriquecer dados
    const turmasEnriquecidas = turmasFiltradas.map(turma => {
      const disciplina = disciplinas.find(d => d.id === turma.disciplinaId);
      const sala = salas.find(s => s.id === turma.salaId);
      
      return {
        ...turma,
        disciplina: disciplina ? {
          nome: disciplina.nome,
          curso: disciplina.curso
        } : null,
        sala: sala ? {
          numero: sala.numero,
          descricao: sala.descricao
        } : null
      };
    });
    
    // Agrupar por dia da semana e sala
    const relatorio = {};
    const diasSemana = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    
    diasSemana.forEach(dia => {
      relatorio[dia] = {};
    });
    
    turmasEnriquecidas.forEach(turma => {
      if (!relatorio[turma.diaSemana]) {
        relatorio[turma.diaSemana] = {};
      }
      
      const numeroSala = turma.sala?.numero || 'Sala não definida';
      
      if (!relatorio[turma.diaSemana][numeroSala]) {
        relatorio[turma.diaSemana][numeroSala] = [];
      }
      
      relatorio[turma.diaSemana][numeroSala].push({
        id: turma.id,
        disciplina: turma.disciplina?.nome || 'Disciplina não encontrada',
        curso: turma.disciplina?.curso || '',
        professor: turma.professor,
        horario: turma.horario || 'Não definido'
      });
    });
    
    res.json({
      success: true,
      data: relatorio,
      semestre: semestreLetivo || 'Todos os semestres'
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
  listarTurmas,
  obterTurmaPorId,
  criarTurma,
  atualizarTurma,
  deletarTurma,
  relatorioTurmasPorDiaSala
};