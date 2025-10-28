// Configuração global para os testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '0'; // Use random available port

// Configurar timeout para testes
jest.setTimeout(30000);