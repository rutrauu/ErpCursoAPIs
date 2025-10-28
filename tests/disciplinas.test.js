const request = require('supertest');
const app = require('../src/server');
const { disciplinas } = require('../src/models/dataStore');

describe('Disciplinas Endpoints', () => {
  let authToken;
  let disciplinaId;

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
    // Reset disciplinas para estado inicial antes de cada teste
    disciplinas.length = 0;
    disciplinas.push(
      {
        id: 'test-disciplina-1',
        nome: 'Programação Web',
        curso: 'Análise e Desenvolvimento de Sistemas',
        descricao: 'Desenvolvimento de aplicações web com tecnologias modernas',
        cargaHoraria: 80,
        semestre: '2025/2',
        ativa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );
  });

  describe('GET /api/disciplinas', () => {
    it('should return all disciplinas', async () => {
      const response = await request(app)
        .get('/api/disciplinas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    // it('should filter disciplinas by curso', async () => {
    //   const response = await request(app)
    //     .get('/api/disciplinas?curso=Análise')
    //     .set('Authorization', `Bearer ${authToken}`);

    //   expect(response.status).toBe(200);
    //   expect(response.body.success).toBe(true);
    //   expect(response.body.data.length).toBeGreaterThan(0);
    //   expect(response.body.data[0].curso).toContain('Análise');
    // });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/disciplinas');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/disciplinas/:id', () => {
    it('should return a specific disciplina', async () => {
      const response = await request(app)
        .get('/api/disciplinas/test-disciplina-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('test-disciplina-1');
    });

    it('should return 404 for non-existent disciplina', async () => {
      const response = await request(app)
        .get('/api/disciplinas/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/disciplinas', () => {
    it('should create a new disciplina', async () => {
      const novaDisciplina = {
        nome: 'Estruturas de Dados',
        curso: 'Ciência da Computação',
        descricao: 'Estudo de algoritmos e estruturas fundamentais',
        cargaHoraria: 60,
        semestre: '2025/2'
      };

      const response = await request(app)
        .post('/api/disciplinas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(novaDisciplina);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nome).toBe(novaDisciplina.nome);
      disciplinaId = response.body.data.id;
    });

    it('should return error for duplicate disciplina name in same semester', async () => {
      const disciplinaDuplicada = {
        nome: 'Programação Web',
        curso: 'Análise e Desenvolvimento de Sistemas',
        descricao: 'Outra descrição',
        cargaHoraria: 40,
        semestre: '2025/2'
      };

      const response = await request(app)
        .post('/api/disciplinas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disciplinaDuplicada);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should return validation error for invalid data', async () => {
      const dadosInvalidos = {
        nome: 'A', // Muito curto
        curso: '',
        cargaHoraria: -10 // Negativo
      };

      const response = await request(app)
        .post('/api/disciplinas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dadosInvalidos);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/disciplinas/:id', () => {
    it('should update an existing disciplina', async () => {
      const dadosAtualizados = {
        nome: 'Programação Web Avançada',
        curso: 'Análise e Desenvolvimento de Sistemas',
        descricao: 'Desenvolvimento avançado de aplicações web',
        cargaHoraria: 100,
        semestre: '2025/2'
      };

      const response = await request(app)
        .put('/api/disciplinas/test-disciplina-1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dadosAtualizados);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nome).toBe(dadosAtualizados.nome);
    });

    it('should return 404 for non-existent disciplina', async () => {
      const response = await request(app)
        .put('/api/disciplinas/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Teste',
          curso: 'Teste',
          descricao: 'Teste',
          cargaHoraria: 40,
          semestre: '2025/2'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/disciplinas/:id', () => {
    it('should delete an existing disciplina', async () => {
      const response = await request(app)
        .delete('/api/disciplinas/test-disciplina-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent disciplina', async () => {
      const response = await request(app)
        .delete('/api/disciplinas/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/disciplinas/cursos', () => {
    it('should return list of unique courses', async () => {
      const response = await request(app)
        .get('/api/disciplinas/cursos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toContain('Análise e Desenvolvimento de Sistemas');
    });
  });
});