const request = require('supertest');
const app = require('../src/server');
const { turmas, disciplinas, salas } = require('../src/models/dataStore');

describe('Turmas Endpoints', () => {
  let authToken;
  let disciplinaId;
  let salaId;

  beforeAll(async () => {
    // Login para obter token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@sistema.edu.br',
        password: 'password'
      });
    
    authToken = loginResponse.body.data.token;
  });

  beforeEach(() => {
    // Reset dados para estado inicial
    disciplinas.length = 0;
    salas.length = 0;
    turmas.length = 0;

    // Adicionar disciplina de teste
    disciplinaId = 'test-disciplina-1';
    disciplinas.push({
      id: disciplinaId,
      nome: 'Programação Web',
      curso: 'Análise e Desenvolvimento de Sistemas',
      descricao: 'Desenvolvimento de aplicações web',
      cargaHoraria: 80,
      semestre: '2025/2',
      ativa: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Adicionar sala de teste
    salaId = 'test-sala-1';
    salas.push({
      id: salaId,
      numero: 'A101',
      descricao: 'Laboratório de Informática 1',
      lotacao: 30,
      ativa: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  describe('GET /api/turmas', () => {
    beforeEach(() => {
      turmas.push({
        id: 'test-turma-1',
        semestreLetivo: '2025/2',
        disciplinaId: disciplinaId,
        professor: 'Prof. João Silva',
        salaId: salaId,
        diaSemana: 'segunda-feira',
        horario: '19:00-22:30',
        ativa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    it('should return all turmas with enriched data', async () => {
      const response = await request(app)
        .get('/api/turmas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('disciplina');
      expect(response.body.data[0]).toHaveProperty('sala');
    });

    it('should filter turmas by semestre', async () => {
      const response = await request(app)
        .get('/api/turmas?semestreLetivo=2025/2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].semestreLetivo).toBe('2025/2');
    });

    it('should return turmas ordered by day and classroom', async () => {
      // Adicionar mais turmas para testar ordenação
      turmas.push({
        id: 'test-turma-2',
        semestreLetivo: '2025/2',
        disciplinaId: disciplinaId,
        professor: 'Prof. Maria Santos',
        salaId: salaId,
        diaSemana: 'terça-feira',
        horario: '19:00-22:30',
        ativa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .get('/api/turmas?ordenacao=dia-sala')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verificar se está ordenado corretamente
      const turmasOrdenadas = response.body.data;
      expect(turmasOrdenadas[0].diaSemana).toBe('segunda-feira');
      expect(turmasOrdenadas[1].diaSemana).toBe('terça-feira');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/turmas');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/turmas', () => {
    it('should create a new turma', async () => {
      const novaTurma = {
        semestreLetivo: '2025/2',
        disciplinaId: disciplinaId,
        professor: 'Prof. Carlos Lima',
        salaId: salaId,
        diaSemana: 'quarta-feira',
        horario: '19:00-22:30'
      };

      const response = await request(app)
        .post('/api/turmas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(novaTurma);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.professor).toBe(novaTurma.professor);
      expect(response.body.data).toHaveProperty('disciplina');
      expect(response.body.data).toHaveProperty('sala');
    });

    it('should enforce 1:1 relationship between disciplina and turma', async () => {
      // Criar primeira turma
      await request(app)
        .post('/api/turmas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          semestreLetivo: '2025/2',
          disciplinaId: disciplinaId,
          professor: 'Prof. Ana Costa',
          salaId: salaId,
          diaSemana: 'quinta-feira',
          horario: '19:00-22:30'
        });

      // Tentar criar segunda turma para mesma disciplina no mesmo semestre
      const response = await request(app)
        .post('/api/turmas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          semestreLetivo: '2025/2',
          disciplinaId: disciplinaId,
          professor: 'Prof. Pedro Santos',
          salaId: salaId,
          diaSemana: 'sexta-feira',
          horario: '19:00-22:30'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Já existe uma turma para esta disciplina');
    });

    it('should prevent professor conflicts (same day/semester)', async () => {
      // Criar primeira turma
      await request(app)
        .post('/api/turmas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          semestreLetivo: '2025/2',
          disciplinaId: disciplinaId,
          professor: 'Prof. Conflito',
          salaId: salaId,
          diaSemana: 'segunda-feira',
          horario: '19:00-22:30'
        });

      // Adicionar segunda disciplina
      const disciplina2Id = 'test-disciplina-2';
      disciplinas.push({
        id: disciplina2Id,
        nome: 'Banco de Dados',
        curso: 'Análise e Desenvolvimento de Sistemas',
        descricao: 'Modelagem de dados',
        cargaHoraria: 60,
        semestre: '2025/2',
        ativa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Tentar criar turma com mesmo professor no mesmo dia
      const response = await request(app)
        .post('/api/turmas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          semestreLetivo: '2025/2',
          disciplinaId: disciplina2Id,
          professor: 'Prof. Conflito',
          salaId: salaId,
          diaSemana: 'segunda-feira',
          horario: '19:00-22:30'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('professor já possui uma turma');
    });

    it('should prevent classroom conflicts (same day/semester)', async () => {
      // Criar primeira turma
      await request(app)
        .post('/api/turmas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          semestreLetivo: '2025/2',
          disciplinaId: disciplinaId,
          professor: 'Prof. Sala1',
          salaId: salaId,
          diaSemana: 'terça-feira',
          horario: '19:00-22:30'
        });

      // Adicionar segunda disciplina
      const disciplina2Id = 'test-disciplina-3';
      disciplinas.push({
        id: disciplina2Id,
        nome: 'Estruturas de Dados',
        curso: 'Ciência da Computação',
        descricao: 'Algoritmos fundamentais',
        cargaHoraria: 80,
        semestre: '2025/2',
        ativa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Tentar criar turma na mesma sala no mesmo dia
      const response = await request(app)
        .post('/api/turmas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          semestreLetivo: '2025/2',
          disciplinaId: disciplina2Id,
          professor: 'Prof. Sala2',
          salaId: salaId,
          diaSemana: 'terça-feira',
          horario: '19:00-22:30'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('sala já está ocupada');
    });

    it('should return validation error for invalid data', async () => {
      const dadosInvalidos = {
        semestreLetivo: '2025/3', // Semestre inválido
        disciplinaId: 'inexistente',
        professor: 'A', // Muito curto
        diaSemana: 'domingo' // Dia inválido
      };

      const response = await request(app)
        .post('/api/turmas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dadosInvalidos);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/turmas/relatorio', () => {
    beforeEach(() => {
      turmas.push(
        {
          id: 'test-turma-1',
          semestreLetivo: '2025/2',
          disciplinaId: disciplinaId,
          professor: 'Prof. João Silva',
          salaId: salaId,
          diaSemana: 'segunda-feira',
          horario: '19:00-22:30',
          ativa: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-turma-2',
          semestreLetivo: '2025/2',
          disciplinaId: disciplinaId,
          professor: 'Prof. Maria Santos',
          salaId: salaId,
          diaSemana: 'terça-feira',
          horario: '19:00-22:30',
          ativa: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
    });

    it('should return report grouped by day and classroom', async () => {
      const response = await request(app)
        .get('/api/turmas/relatorio?semestreLetivo=2025/2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('segunda-feira');
      expect(response.body.data).toHaveProperty('terça-feira');
      expect(response.body.data['segunda-feira']).toHaveProperty('A101');
    });
  });

  describe('PUT /api/turmas/:id', () => {
    beforeEach(() => {
      turmas.push({
        id: 'test-turma-update',
        semestreLetivo: '2025/2',
        disciplinaId: disciplinaId,
        professor: 'Prof. Antigo',
        salaId: salaId,
        diaSemana: 'segunda-feira',
        horario: '19:00-22:30',
        ativa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    it('should update an existing turma', async () => {
      const dadosAtualizados = {
        semestreLetivo: '2025/2',
        disciplinaId: disciplinaId,
        professor: 'Prof. Atualizado',
        salaId: salaId,
        diaSemana: 'quarta-feira',
        horario: '14:00-17:30'
      };

      const response = await request(app)
        .put('/api/turmas/test-turma-update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dadosAtualizados);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.professor).toBe(dadosAtualizados.professor);
    });

    it('should return 404 for non-existent turma', async () => {
      const response = await request(app)
        .put('/api/turmas/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          semestreLetivo: '2025/2',
          disciplinaId: disciplinaId,
          professor: 'Prof. Teste',
          salaId: salaId,
          diaSemana: 'quinta-feira'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/turmas/:id', () => {
    beforeEach(() => {
      turmas.push({
        id: 'test-turma-delete',
        semestreLetivo: '2025/2',
        disciplinaId: disciplinaId,
        professor: 'Prof. Delete',
        salaId: salaId,
        diaSemana: 'sexta-feira',
        horario: '19:00-22:30',
        ativa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    it('should delete an existing turma', async () => {
      const response = await request(app)
        .delete('/api/turmas/test-turma-delete')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent turma', async () => {
      const response = await request(app)
        .delete('/api/turmas/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});