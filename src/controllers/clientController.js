const { v4: uuidv4 } = require('uuid');
const { clients } = require('../models/dataStore');

class ClientController {
  // Listar todos os clientes
  static async getAllClients(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        active, 
        search,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      let filteredClients = [...clients];

      // Filtrar por status ativo
      if (active !== undefined) {
        filteredClients = filteredClients.filter(client => 
          client.active === (active === 'true')
        );
      }

      // Busca por texto
      if (search) {
        const searchTerm = search.toLowerCase();
        filteredClients = filteredClients.filter(client =>
          client.name.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm) ||
          client.document.toLowerCase().includes(searchTerm) ||
          client.phone.toLowerCase().includes(searchTerm)
        );
      }

      // Ordenação
      filteredClients.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOrder === 'desc') {
          return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });

      // Paginação
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedClients = filteredClients.slice(startIndex, endIndex);

      res.status(200).json({
        status: 'success',
        data: {
          clients: paginatedClients,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredClients.length / limit),
            totalItems: filteredClients.length,
            itemsPerPage: parseInt(limit)
          }
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

  // Obter cliente por ID
  static async getClientById(req, res) {
    try {
      const { id } = req.params;
      const client = clients.find(c => c.id === id);

      if (!client) {
        return res.status(404).json({
          status: 'error',
          message: 'Cliente não encontrado'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          client
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

  // Criar novo cliente
  static async createClient(req, res) {
    try {
      const { name, email, phone, document, address, active } = req.body;

      // Verificar se o email já existe
      const existingEmailClient = clients.find(c => c.email === email);
      if (existingEmailClient) {
        return res.status(409).json({
          status: 'error',
          message: 'Email já está em uso'
        });
      }

      // Verificar se o documento já existe
      const existingDocClient = clients.find(c => c.document === document);
      if (existingDocClient) {
        return res.status(409).json({
          status: 'error',
          message: 'Documento já está em uso'
        });
      }

      const newClient = {
        id: uuidv4(),
        name,
        email,
        phone,
        document,
        address,
        active: active !== undefined ? active : true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      clients.push(newClient);

      res.status(201).json({
        status: 'success',
        message: 'Cliente criado com sucesso',
        data: {
          client: newClient
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

  // Atualizar cliente
  static async updateClient(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, document, address, active } = req.body;

      const clientIndex = clients.findIndex(c => c.id === id);
      if (clientIndex === -1) {
        return res.status(404).json({
          status: 'error',
          message: 'Cliente não encontrado'
        });
      }

      // Verificar se o email já existe em outro cliente
      if (email) {
        const existingEmailClient = clients.find(c => c.email === email && c.id !== id);
        if (existingEmailClient) {
          return res.status(409).json({
            status: 'error',
            message: 'Email já está em uso'
          });
        }
      }

      // Verificar se o documento já existe em outro cliente
      if (document) {
        const existingDocClient = clients.find(c => c.document === document && c.id !== id);
        if (existingDocClient) {
          return res.status(409).json({
            status: 'error',
            message: 'Documento já está em uso'
          });
        }
      }

      // Atualizar campos fornecidos
      const updatedClient = {
        ...clients[clientIndex],
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(document && { document }),
        ...(address && { address }),
        ...(active !== undefined && { active }),
        updatedAt: new Date()
      };

      clients[clientIndex] = updatedClient;

      res.status(200).json({
        status: 'success',
        message: 'Cliente atualizado com sucesso',
        data: {
          client: updatedClient
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

  // Deletar cliente
  static async deleteClient(req, res) {
    try {
      const { id } = req.params;
      const clientIndex = clients.findIndex(c => c.id === id);

      if (clientIndex === -1) {
        return res.status(404).json({
          status: 'error',
          message: 'Cliente não encontrado'
        });
      }

      const deletedClient = clients.splice(clientIndex, 1)[0];

      res.status(200).json({
        status: 'success',
        message: 'Cliente deletado com sucesso',
        data: {
          client: deletedClient
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

module.exports = ClientController;