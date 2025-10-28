/* eslint-disable no-unused-vars */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { users } = require('../models/dataStore');
const { userSchema, loginSchema } = require('../models/validationSchemas');

class AuthController {
  // Registrar novo usuário
  static async register(req, res) {
    try {
      // Validar dados de entrada
      const { error, value } = userSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map(detail => detail.message)
        });
      }

      const { name, email, password, role } = value;

      // Verificar se o usuário já existe
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email já está em uso'
        });
      }

      // Criptografar a senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Criar novo usuário
      const newUser = {
        id: uuidv4(),
        name, // Nome completo conforme especificação
        email,
        password: hashedPassword,
        role: role || 'professor',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Adicionar usuário ao array
      users.push(newUser);

      // Gerar token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET || 'default_secret_key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Retornar resposta sem a senha
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  }

  // Login do usuário
  static async login(req, res) {
    try {
      // Validar dados de entrada
      const { error, value } = loginSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map(detail => detail.message)
        });
      }

      const { email, password } = value;

      // Buscar usuário pelo email
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Gerar token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'default_secret_key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Retornar resposta sem a senha
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
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