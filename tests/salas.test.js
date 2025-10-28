const request = require('supertest');
const app = require('../src/server');
const { salas } = require('../src/models/dataStore');

describe('Salas Endpoints', () => {
  let authToken;

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
    // Reset salas para estado inicial
    salas.length = 0;
    salas.push(
      {
        id: 'test-sala-1',
        numero: 'A101',
        descricao: 'Laboratório de Informática 1',
        lotacao: 30,
        ativa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );
  });

  describe('GET /api/salas', () => {
    it('should return all salas', async () => {
      const response = await request(app)
        .get('/api/salas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter salas by numero', async () => {
      const response = await request(app)
        .get('/api/salas?numero=A101')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].numero).toContain('A101');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/salas');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/salas/:id', () => {
    it('should return a specific sala', async () => {
      const response = await request(app)
        .get('/api/salas/test-sala-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('test-sala-1');
    });

    it('should return 404 for non-existent sala', async () => {
      const response = await request(app)
        .get('/api/salas/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/salas', () => {
    it('should create a new sala', async () => {
      const novaSala = {
        numero: 'B202',
        descricao: 'Sala de Reuniões',
        lotacao: 15
      };

      const response = await request(app)
        .post('/api/salas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(novaSala);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.numero).toBe(novaSala.numero);
    });

    it('should return error for duplicate sala number', async () => {
      const salaDuplicada = {
        numero: 'A101',
        descricao: 'Outra descrição',
        lotacao: 25
      };

      const response = await request(app)
        .post('/api/salas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(salaDuplicada);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should return validation error for invalid data', async () => {
      const dadosInvalidos = {
        numero: '', // Vazio
        descricao: '',
        lotacao: -5 // Negativo
      };

      const response = await request(app)
        .post('/api/salas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dadosInvalidos);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/salas/:id', () => {
    it('should update an existing sala', async () => {
      const dadosAtualizados = {
        numero: 'A101',
        descricao: 'Laboratório de Informática Atualizado',
        lotacao: 35
      };

      const response = await request(app)
        .put('/api/salas/test-sala-1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dadosAtualizados);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.descricao).toBe(dadosAtualizados.descricao);
    });

    it('should return 404 for non-existent sala', async () => {
      const response = await request(app)
        .put('/api/salas/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numero: 'C301',
          descricao: 'Teste',
          lotacao: 20
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/salas/:id', () => {
    it('should delete an existing sala', async () => {
      const response = await request(app)
        .delete('/api/salas/test-sala-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent sala', async () => {
      const response = await request(app)
        .delete('/api/salas/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/salas/:id/disponibilidade', () => {
    it('should check sala availability', async () => {
      const response = await request(app)
        .get('/api/salas/test-sala-1/disponibilidade?semestreLetivo=2025/2&diaSemana=segunda-feira')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('disponivel');
    });

    it('should return error without required parameters', async () => {
      const response = await request(app)
        .get('/api/salas/test-sala-1/disponibilidade')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});