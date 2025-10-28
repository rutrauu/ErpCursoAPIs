const { v4: uuidv4 } = require('uuid');
const { products } = require('../models/dataStore');

class ProductController {
  // Listar todos os produtos
  static async getAllProducts(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        active, 
        search,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      let filteredProducts = [...products];

      // Filtrar por categoria
      if (category) {
        filteredProducts = filteredProducts.filter(product => 
          product.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      // Filtrar por status ativo
      if (active !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.active === (active === 'true')
        );
      }

      // Busca por texto
      if (search) {
        const searchTerm = search.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.code.toLowerCase().includes(searchTerm)
        );
      }

      // Ordenação
      filteredProducts.sort((a, b) => {
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
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      res.status(200).json({
        status: 'success',
        data: {
          products: paginatedProducts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredProducts.length / limit),
            totalItems: filteredProducts.length,
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

  // Obter produto por ID
  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = products.find(p => p.id === id);

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Produto não encontrado'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          product
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

  // Criar novo produto
  static async createProduct(req, res) {
    try {
      const { name, description, price, category, stock, code, active } = req.body;

      // Verificar se o código do produto já existe
      const existingProduct = products.find(p => p.code === code);
      if (existingProduct) {
        return res.status(409).json({
          status: 'error',
          message: 'Código do produto já existe'
        });
      }

      const newProduct = {
        id: uuidv4(),
        name,
        description,
        price,
        category,
        stock,
        code,
        active: active !== undefined ? active : true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      products.push(newProduct);

      res.status(201).json({
        status: 'success',
        message: 'Produto criado com sucesso',
        data: {
          product: newProduct
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

  // Atualizar produto
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, category, stock, code, active } = req.body;

      const productIndex = products.findIndex(p => p.id === id);
      if (productIndex === -1) {
        return res.status(404).json({
          status: 'error',
          message: 'Produto não encontrado'
        });
      }

      // Verificar se o código já existe em outro produto
      if (code) {
        const existingProduct = products.find(p => p.code === code && p.id !== id);
        if (existingProduct) {
          return res.status(409).json({
            status: 'error',
            message: 'Código do produto já existe'
          });
        }
      }

      // Atualizar campos fornecidos
      const updatedProduct = {
        ...products[productIndex],
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price }),
        ...(category && { category }),
        ...(stock !== undefined && { stock }),
        ...(code && { code }),
        ...(active !== undefined && { active }),
        updatedAt: new Date()
      };

      products[productIndex] = updatedProduct;

      res.status(200).json({
        status: 'success',
        message: 'Produto atualizado com sucesso',
        data: {
          product: updatedProduct
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

  // Deletar produto
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const productIndex = products.findIndex(p => p.id === id);

      if (productIndex === -1) {
        return res.status(404).json({
          status: 'error',
          message: 'Produto não encontrado'
        });
      }

      const deletedProduct = products.splice(productIndex, 1)[0];

      res.status(200).json({
        status: 'success',
        message: 'Produto deletado com sucesso',
        data: {
          product: deletedProduct
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

  // Obter categorias de produtos
  static async getCategories(req, res) {
    try {
      const categories = [...new Set(products.map(p => p.category))];
      
      res.status(200).json({
        status: 'success',
        data: {
          categories: categories.sort()
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

module.exports = ProductController;