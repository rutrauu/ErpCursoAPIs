const { v4: uuidv4 } = require('uuid');
const { orders, clients, products } = require('../models/dataStore');

class OrderController {
  // Listar todos os pedidos
  static async getAllOrders(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        clientId,
        startDate,
        endDate,
        sortBy = 'orderDate',
        sortOrder = 'desc'
      } = req.query;

      let filteredOrders = [...orders];

      // Filtrar por status
      if (status) {
        filteredOrders = filteredOrders.filter(order => 
          order.status === status
        );
      }

      // Filtrar por cliente
      if (clientId) {
        filteredOrders = filteredOrders.filter(order => 
          order.clientId === clientId
        );
      }

      // Filtrar por data
      if (startDate) {
        filteredOrders = filteredOrders.filter(order => 
          new Date(order.orderDate) >= new Date(startDate)
        );
      }

      if (endDate) {
        filteredOrders = filteredOrders.filter(order => 
          new Date(order.orderDate) <= new Date(endDate)
        );
      }

      // Ordenação
      filteredOrders.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'orderDate' || sortBy === 'createdAt') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (sortOrder === 'desc') {
          return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });

      // Paginação
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

      // Enriquecer dados com informações do cliente e produtos
      const enrichedOrders = paginatedOrders.map(order => {
        const client = clients.find(c => c.id === order.clientId);
        const enrichedItems = order.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            ...item,
            product: product ? {
              id: product.id,
              name: product.name,
              code: product.code
            } : null
          };
        });

        return {
          ...order,
          client: client ? {
            id: client.id,
            name: client.name,
            email: client.email
          } : null,
          items: enrichedItems
        };
      });

      res.status(200).json({
        status: 'success',
        data: {
          orders: enrichedOrders,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredOrders.length / limit),
            totalItems: filteredOrders.length,
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

  // Obter pedido por ID
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = orders.find(o => o.id === id);

      if (!order) {
        return res.status(404).json({
          status: 'error',
          message: 'Pedido não encontrado'
        });
      }

      // Enriquecer dados com informações do cliente e produtos
      const client = clients.find(c => c.id === order.clientId);
      const enrichedItems = order.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          ...item,
          product: product || null
        };
      });

      const enrichedOrder = {
        ...order,
        client: client || null,
        items: enrichedItems
      };

      res.status(200).json({
        status: 'success',
        data: {
          order: enrichedOrder
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

  // Criar novo pedido
  static async createOrder(req, res) {
    try {
      const { clientId, items, notes } = req.body;

      // Verificar se o cliente existe
      const client = clients.find(c => c.id === clientId);
      if (!client) {
        return res.status(404).json({
          status: 'error',
          message: 'Cliente não encontrado'
        });
      }

      // Verificar e calcular itens do pedido
      let totalAmount = 0;
      const processedItems = [];

      for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          return res.status(404).json({
            status: 'error',
            message: `Produto com ID ${item.productId} não encontrado`
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            status: 'error',
            message: `Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`
          });
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        processedItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
          total: itemTotal
        });

        // Atualizar estoque do produto
        product.stock -= item.quantity;
        product.updatedAt = new Date();
      }

      const newOrder = {
        id: uuidv4(),
        clientId,
        items: processedItems,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        status: 'pending',
        orderDate: new Date(),
        deliveryDate: null,
        notes: notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      orders.push(newOrder);

      // Retornar pedido com dados enriquecidos
      const enrichedItems = newOrder.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          ...item,
          product: product ? {
            id: product.id,
            name: product.name,
            code: product.code
          } : null
        };
      });

      const enrichedOrder = {
        ...newOrder,
        client: {
          id: client.id,
          name: client.name,
          email: client.email
        },
        items: enrichedItems
      };

      res.status(201).json({
        status: 'success',
        message: 'Pedido criado com sucesso',
        data: {
          order: enrichedOrder
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

  // Atualizar status do pedido
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, deliveryDate } = req.body;

      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'Status inválido. Valores permitidos: ' + validStatuses.join(', ')
        });
      }

      const orderIndex = orders.findIndex(o => o.id === id);
      if (orderIndex === -1) {
        return res.status(404).json({
          status: 'error',
          message: 'Pedido não encontrado'
        });
      }

      const order = orders[orderIndex];

      // Se o pedido está sendo cancelado, devolver o estoque
      if (status === 'cancelled' && order.status !== 'cancelled') {
        order.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            product.stock += item.quantity;
            product.updatedAt = new Date();
          }
        });
      }

      // Atualizar o pedido
      const updatedOrder = {
        ...order,
        status,
        ...(deliveryDate && { deliveryDate: new Date(deliveryDate) }),
        updatedAt: new Date()
      };

      orders[orderIndex] = updatedOrder;

      res.status(200).json({
        status: 'success',
        message: 'Status do pedido atualizado com sucesso',
        data: {
          order: updatedOrder
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

  // Deletar pedido
  static async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const orderIndex = orders.findIndex(o => o.id === id);

      if (orderIndex === -1) {
        return res.status(404).json({
          status: 'error',
          message: 'Pedido não encontrado'
        });
      }

      const order = orders[orderIndex];

      // Devolver estoque se o pedido não foi cancelado
      if (order.status !== 'cancelled') {
        order.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            product.stock += item.quantity;
            product.updatedAt = new Date();
          }
        });
      }

      const deletedOrder = orders.splice(orderIndex, 1)[0];

      res.status(200).json({
        status: 'success',
        message: 'Pedido deletado com sucesso',
        data: {
          order: deletedOrder
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

module.exports = OrderController;