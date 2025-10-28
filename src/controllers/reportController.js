const { orders, clients, products } = require('../models/dataStore');

class ReportController {
  // Dashboard com estatísticas gerais
  static async getDashboard(req, res) {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      // Estatísticas básicas
      const totalClients = clients.filter(c => c.active).length;
      const totalProducts = products.filter(p => p.active).length;
      const totalOrders = orders.length;

      // Pedidos dos últimos 30 dias
      const recentOrders = orders.filter(order => 
        new Date(order.orderDate) >= thirtyDaysAgo
      );

      // Receita total
      const totalRevenue = orders
        .filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.totalAmount, 0);

      // Receita dos últimos 30 dias
      const recentRevenue = recentOrders
        .filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.totalAmount, 0);

      // Produtos com estoque baixo (menos de 5 unidades)
      const lowStockProducts = products
        .filter(p => p.active && p.stock < 5)
        .map(p => ({
          id: p.id,
          name: p.name,
          code: p.code,
          stock: p.stock,
          category: p.category
        }));

      // Pedidos por status
      const ordersByStatus = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      // Top 5 produtos mais vendidos
      const productSales = {};
      orders.forEach(order => {
        if (order.status !== 'cancelled') {
          order.items.forEach(item => {
            if (!productSales[item.productId]) {
              productSales[item.productId] = {
                quantity: 0,
                revenue: 0
              };
            }
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.total;
          });
        }
      });

      const topProducts = Object.entries(productSales)
        .map(([productId, sales]) => {
          const product = products.find(p => p.id === productId);
          return {
            product: product ? {
              id: product.id,
              name: product.name,
              code: product.code
            } : null,
            quantitySold: sales.quantity,
            revenue: sales.revenue
          };
        })
        .filter(item => item.product !== null)
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, 5);

      // Vendas por mês (últimos 6 meses)
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const monthlySales = {};

      // Inicializar meses
      for (let i = 0; i < 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlySales[key] = { orders: 0, revenue: 0 };
      }

      // Calcular vendas por mês
      orders.forEach(order => {
        if (order.status !== 'cancelled' && new Date(order.orderDate) >= sixMonthsAgo) {
          const orderDate = new Date(order.orderDate);
          const key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
          if (monthlySales[key]) {
            monthlySales[key].orders += 1;
            monthlySales[key].revenue += order.totalAmount;
          }
        }
      });

      res.status(200).json({
        status: 'success',
        data: {
          overview: {
            totalClients,
            totalProducts,
            totalOrders,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            recentOrders: recentOrders.length,
            recentRevenue: parseFloat(recentRevenue.toFixed(2))
          },
          ordersByStatus,
          topProducts,
          lowStockProducts,
          monthlySales: Object.entries(monthlySales)
            .map(([month, data]) => ({
              month,
              orders: data.orders,
              revenue: parseFloat(data.revenue.toFixed(2))
            }))
            .sort((a, b) => a.month.localeCompare(b.month))
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

  // Relatório de vendas
  static async getSalesReport(req, res) {
    try {
      const { 
        startDate, 
        endDate, 
        groupBy = 'day', // day, week, month
        productId,
        clientId,
        status = 'delivered'
      } = req.query;

      let filteredOrders = orders.filter(order => order.status !== 'cancelled');

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

      // Filtrar por produto específico
      if (productId) {
        filteredOrders = filteredOrders.filter(order =>
          order.items.some(item => item.productId === productId)
        );
      }

      // Filtrar por cliente específico
      if (clientId) {
        filteredOrders = filteredOrders.filter(order => order.clientId === clientId);
      }

      // Filtrar por status específico
      if (status !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === status);
      }

      // Agrupar dados
      const groupedData = {};
      const getGroupKey = (date) => {
        const d = new Date(date);
        switch (groupBy) {
          case 'week':
            const weekStart = new Date(d.setDate(d.getDate() - d.getDay()));
            return weekStart.toISOString().split('T')[0];
          case 'month':
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          default: // day
            return d.toISOString().split('T')[0];
        }
      };

      filteredOrders.forEach(order => {
        const key = getGroupKey(order.orderDate);
        if (!groupedData[key]) {
          groupedData[key] = {
            period: key,
            orders: 0,
            revenue: 0,
            items: 0
          };
        }
        groupedData[key].orders += 1;
        groupedData[key].revenue += order.totalAmount;
        groupedData[key].items += order.items.reduce((sum, item) => sum + item.quantity, 0);
      });

      // Converter para array e ordenar
      const salesData = Object.values(groupedData)
        .map(data => ({
          ...data,
          revenue: parseFloat(data.revenue.toFixed(2))
        }))
        .sort((a, b) => a.period.localeCompare(b.period));

      // Calcular totais
      const totals = salesData.reduce((acc, curr) => ({
        totalOrders: acc.totalOrders + curr.orders,
        totalRevenue: acc.totalRevenue + curr.revenue,
        totalItems: acc.totalItems + curr.items
      }), { totalOrders: 0, totalRevenue: 0, totalItems: 0 });

      res.status(200).json({
        status: 'success',
        data: {
          salesData,
          totals: {
            ...totals,
            totalRevenue: parseFloat(totals.totalRevenue.toFixed(2))
          },
          filters: {
            startDate,
            endDate,
            groupBy,
            productId,
            clientId,
            status
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

  // Relatório de estoque
  static async getInventoryReport(req, res) {
    try {
      const { category, lowStock = false } = req.query;

      let filteredProducts = [...products];

      // Filtrar por categoria
      if (category) {
        filteredProducts = filteredProducts.filter(product => 
          product.category.toLowerCase() === category.toLowerCase()
        );
      }

      // Filtrar produtos com estoque baixo
      if (lowStock === 'true') {
        filteredProducts = filteredProducts.filter(product => product.stock < 10);
      }

      // Calcular estatísticas
      const totalProducts = filteredProducts.length;
      const totalValue = filteredProducts.reduce((sum, product) => 
        sum + (product.price * product.stock), 0
      );
      const totalItems = filteredProducts.reduce((sum, product) => sum + product.stock, 0);

      // Produtos por categoria
      const categorySummary = filteredProducts.reduce((acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] = {
            products: 0,
            totalItems: 0,
            totalValue: 0
          };
        }
        acc[product.category].products += 1;
        acc[product.category].totalItems += product.stock;
        acc[product.category].totalValue += product.price * product.stock;
        return acc;
      }, {});

      const categoryData = Object.entries(categorySummary).map(([category, data]) => ({
        category,
        products: data.products,
        totalItems: data.totalItems,
        totalValue: parseFloat(data.totalValue.toFixed(2))
      }));

      res.status(200).json({
        status: 'success',
        data: {
          summary: {
            totalProducts,
            totalItems,
            totalValue: parseFloat(totalValue.toFixed(2))
          },
          products: filteredProducts.map(product => ({
            id: product.id,
            name: product.name,
            code: product.code,
            category: product.category,
            price: product.price,
            stock: product.stock,
            value: parseFloat((product.price * product.stock).toFixed(2)),
            status: product.stock < 5 ? 'critical' : product.stock < 10 ? 'low' : 'normal'
          })),
          categoryData
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

  // Relatório de clientes
  static async getCustomerReport(req, res) {
    try {
      // Calcular estatísticas por cliente
      const customerStats = clients.map(client => {
        const clientOrders = orders.filter(order => 
          order.clientId === client.id && order.status !== 'cancelled'
        );
        
        const totalOrders = clientOrders.length;
        const totalSpent = clientOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const lastOrderDate = clientOrders.length > 0 
          ? new Date(Math.max(...clientOrders.map(o => new Date(o.orderDate))))
          : null;

        return {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          totalOrders,
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          averageOrderValue: totalOrders > 0 ? parseFloat((totalSpent / totalOrders).toFixed(2)) : 0,
          lastOrderDate,
          status: client.active ? 'active' : 'inactive'
        };
      });

      // Ordenar por valor total gasto (decrescente)
      customerStats.sort((a, b) => b.totalSpent - a.totalSpent);

      // Calcular totais
      const totalCustomers = customerStats.length;
      const activeCustomers = customerStats.filter(c => c.status === 'active').length;
      const totalRevenue = customerStats.reduce((sum, customer) => sum + customer.totalSpent, 0);

      res.status(200).json({
        status: 'success',
        data: {
          summary: {
            totalCustomers,
            activeCustomers,
            totalRevenue: parseFloat(totalRevenue.toFixed(2))
          },
          customers: customerStats
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

module.exports = ReportController;