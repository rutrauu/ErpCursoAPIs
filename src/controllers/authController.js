const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { users } = require('../models/dataStore');

class AuthController {
  // Registrar novo usuário
  static async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Verificar se o usuário já existe
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        return res.status(409).json({
          status: 'error',
          message: 'Email já está em uso'
        });
      }

      // Criptografar a senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Criar novo usuário
      const newUser = {
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Adicionar usuário ao array
      users.push(newUser);

      // Gerar token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Retornar resposta sem a senha
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        status: 'success',
        message: 'Usuário registrado com sucesso',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  }

  // Login do usuário
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuário pelo email
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Credenciais inválidas'
        });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Credenciais inválidas'
        });
      }

      // Gerar token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Retornar resposta sem a senha
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        status: 'success',
        message: 'Login realizado com sucesso',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  }

  // Obter perfil do usuário logado
  static async getProfile(req, res) {
    try {
      const user = users.find(u => u.id === req.user.id);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Usuário não encontrado'
        });
      }

      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        status: 'success',
        data: {
          user: userWithoutPassword
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  }

  // Listar todos os usuários (apenas admin)
  static async getAllUsers(req, res) {
    try {
      const usersWithoutPassword = users.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.status(200).json({
        status: 'success',
        data: {
          users: usersWithoutPassword,
          total: usersWithoutPassword.length
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  }
}

module.exports = AuthController;