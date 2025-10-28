/* eslint-disable no-unused-vars */
// Script para testar a autenticação
const axios = require('axios');

const baseURL = 'http://localhost:3000/api';

async function testarAutenticacao() {
  try {
    console.log('🔐 Testando autenticação...\n');

    // 0. Registrar usuário primeiro
    console.log('0. Registrando usuário admin...');
    try {
      const registerResponse = await axios.post(`${baseURL}/auth/register`, {
        name: 'Administrador Sistema',
        email: 'admin@teste.com',
        password: '123456',
        role: 'admin'
      });
      console.log('✅ Usuário registrado com sucesso!');
    } catch (registerError) {
      if (registerError.response?.status === 409) {
        console.log('ℹ️  Usuário já existe, continuando...');
      } else {
        throw registerError;
      }
    }

    // 1. Fazer login
    console.log('\n1. Fazendo login...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@teste.com',
      password: '123456'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login realizado com sucesso!');
      
      const token = loginResponse.data.data.token;
      console.log(`📝 Token recebido: ${token.substring(0, 50)}...`);

      // 2. Testar token imediatamente
      console.log('\n2. Testando token imediatamente...');
      const profileResponse = await axios.get(`${baseURL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.data.status === 'success') {
        console.log('✅ Token validado com sucesso!');
        console.log(`👤 Usuário: ${profileResponse.data.data.user.name}`);
        console.log(`📧 Email: ${profileResponse.data.data.user.email}`);
        console.log(`🎭 Role: ${profileResponse.data.data.user.role}`);
      } else {
        console.log('❌ Falha na validação do token');
      }

      // 3. Testar com uma requisição de disciplinas
      console.log('\n3. Testando token em endpoint protegido (disciplinas)...');
      const disciplinasResponse = await axios.get(`${baseURL}/disciplinas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Token funcionando em endpoint protegido!');
      console.log(`📚 Total de disciplinas: ${disciplinasResponse.data.data?.disciplinas?.length || 0}`);

    } else {
      console.log('❌ Falha no login');
    }

  } catch (error) {
    if (error.response) {
      console.log(`❌ Erro ${error.response.status}: ${error.response.data.message}`);
      if (error.response.data.errors) {
        console.log('Detalhes:', error.response.data.errors);
      }
    } else {
      console.log('❌ Erro de conexão:', error.message);
    }
  }
}

// Executar teste
testarAutenticacao();
