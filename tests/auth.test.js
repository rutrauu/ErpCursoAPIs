const request = require('supertest');
const app = require('../src/server');
const { users } = require('../src/models/dataStore');

describe('Auth Endpoints', () => {
  let authToken;

  // Limpar dados antes de cada teste
  beforeEach(() => {
    // Manter apenas o usuário admin padrão
    users.length = 1;
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Usuário registrado com sucesso');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'admin@erp.com', // Email que já existe
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Email já está em uso');
    });

    it('should return validation error for invalid data', async () => {
      const userData = {
        name: 'T', // Nome muito curto
        email: 'invalid-email',
        password: '123' // Senha muito curta
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Dados de entrada inválidos');
      expect(response.body.details).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'admin@erp.com',
        password: 'password'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Login realizado com sucesso');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();

      authToken = response.body.data.token;
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'admin@erp.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Credenciais inválidas');
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Credenciais inválidas');
    });
  });

  describe('GET /api/auth/profile', () => {
    beforeEach(async () => {
      // Fazer login para obter token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@erp.com',
          password: 'password'
        });
      authToken = loginResponse.body.data.token;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('admin@erp.com');
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Token de acesso requerido');
    });

    it('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Token inválido');
    });
  });
});