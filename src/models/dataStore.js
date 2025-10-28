// Simulação de banco de dados em memória - Sistema de Gestão Acadêmica
const { v4: uuidv4 } = require('uuid');

// Armazenamento em memória
const users = [
  {
    id: uuidv4(),
    email: 'admin@sistema.edu.br',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Administrador do Sistema',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    email: 'professor@sistema.edu.br',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Prof. João Silva',
    role: 'professor',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Disciplinas: nome, curso, descrição, carga horária, semestre
const disciplinas = [
  {
    id: uuidv4(),
    nome: 'Programação Web',
    curso: 'Análise e Desenvolvimento de Sistemas',
    descricao: 'Desenvolvimento de aplicações web com tecnologias modernas',
    cargaHoraria: 80,
    semestre: '2025/2',
    ativa: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    nome: 'Banco de Dados',
    curso: 'Análise e Desenvolvimento de Sistemas',
    descricao: 'Modelagem e implementação de sistemas de banco de dados',
    cargaHoraria: 60,
    semestre: '2025/2',
    ativa: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    nome: 'Estruturas de Dados',
    curso: 'Ciência da Computação',
    descricao: 'Estudo de algoritmos e estruturas de dados fundamentais',
    cargaHoraria: 80,
    semestre: '2025/2',
    ativa: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Salas: número, descrição, lotação
const salas = [
  {
    id: uuidv4(),
    numero: 'A101',
    descricao: 'Laboratório de Informática 1',
    lotacao: 30,
    ativa: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    numero: 'A102',
    descricao: 'Laboratório de Informática 2',
    lotacao: 25,
    ativa: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    numero: 'B201',
    descricao: 'Sala de Aula Teórica',
    lotacao: 40,
    ativa: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Turmas: semestre letivo, disciplina, professor, sala, dia da semana
const turmas = [
  {
    id: uuidv4(),
    semestreLetivo: '2025/2',
    disciplinaId: disciplinas[0].id,
    professor: 'Prof. João Silva',
    salaId: salas[0].id,
    diaSemana: 'segunda-feira',
    horario: '19:00-22:30',
    ativa: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    semestreLetivo: '2025/2',
    disciplinaId: disciplinas[1].id,
    professor: 'Prof. Maria Santos',
    salaId: salas[1].id,
    diaSemana: 'terça-feira',
    horario: '19:00-22:30',
    ativa: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Exportar os dados
module.exports = {
  users,
  disciplinas,
  salas,
  turmas
};