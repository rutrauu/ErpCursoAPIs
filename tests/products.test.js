const request = require('supertest');
const app = require('../src/server');
const { products, users } = require('../src/models/dataStore');

describe('Product Endpoints', () => {
  let authToken;

  beforeAll(async () => {
    // Ensure admin user exists for authentication
    users.splice(0); // Clear all users first
    users.push({
      id: 'admin-id',
      email: 'admin@erp.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      name: 'Administrador',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@erp.com',
        password: 'password'
      });
    authToken = loginResponse.body.data.token;
  });

  beforeEach(() => {
    // Reset products array
    products.splice(0); // Clear all products
    products.push(
      {
        id: 'test-product-1',
        name: 'Produto Teste 1',
        description: 'Descrição do produto teste 1',
        price: 100.00,
        category: 'Categoria 1',
        stock: 10,
        code: 'PROD001',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'test-product-2',
        name: 'Produto Teste 2',
        description: 'Descrição do produto teste 2',
        price: 200.00,
        category: 'Categoria 2',
        stock: 20,
        code: 'PROD002',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=categoria 1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].category).toBe('Categoria 1');
    });

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products?search=teste 1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].name).toBe('Produto Teste 1');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a specific product', async () => {
      const response = await request(app)
        .get('/api/products/test-product-1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.product.id).toBe('test-product-1');
      expect(response.body.data.product.name).toBe('Produto Teste 1');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Produto não encontrado');
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'Novo Produto',
        description: 'Descrição do novo produto',
        price: 150.00,
        category: 'Nova Categoria',
        stock: 15,
        code: 'PROD003'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Produto criado com sucesso');
      expect(response.body.data.product.name).toBe(productData.name);
      expect(response.body.data.product.code).toBe(productData.code);
      expect(response.body.data.product.id).toBeDefined();
    });

    it('should return error for duplicate product code', async () => {
      const productData = {
        name: 'Produto Duplicado',
        description: 'Descrição',
        price: 100.00,
        category: 'Categoria',
        stock: 10,
        code: 'PROD001' // Código que já existe
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Código do produto já existe');
    });

    it('should return validation error for invalid data', async () => {
      const productData = {
        name: 'P', // Nome muito curto
        description: '',
        price: -10, // Preço negativo
        category: '',
        stock: -5, // Estoque negativo
        code: ''
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Dados de entrada inválidos');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update an existing product', async () => {
      const updateData = {
        name: 'Produto Atualizado',
        price: 120.00
      };

      const response = await request(app)
        .put('/api/products/test-product-1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Produto atualizado com sucesso');
      expect(response.body.data.product.name).toBe(updateData.name);
      expect(response.body.data.product.price).toBe(updateData.price);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .put('/api/products/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Produto não encontrado');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete an existing product', async () => {
      const response = await request(app)
        .delete('/api/products/test-product-1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Produto deletado com sucesso');
      expect(response.body.data.product.id).toBe('test-product-1');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .delete('/api/products/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Produto não encontrado');
    });
  });

  describe('GET /api/products/categories', () => {
    it('should return all product categories', async () => {
      const response = await request(app)
        .get('/api/products/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.categories).toEqual(
        expect.arrayContaining(['Categoria 1', 'Categoria 2'])
      );
    });
  });
});