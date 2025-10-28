// Simulação de banco de dados em memória
const { v4: uuidv4 } = require('uuid');

// Armazenamento em memória
const users = [
  {
    id: uuidv4(),
    email: 'admin@erp.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Administrador',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const products = [
  {
    id: uuidv4(),
    name: 'Notebook Dell Inspiron',
    description: 'Notebook para uso corporativo',
    price: 2500.00,
    category: 'Eletrônicos',
    stock: 10,
    code: 'NB001',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Mouse Wireless',
    description: 'Mouse sem fio ergonômico',
    price: 85.50,
    category: 'Acessórios',
    stock: 25,
    code: 'MS001',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const clients = [
  {
    id: uuidv4(),
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    document: '123.456.789-00',
    address: {
      street: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    },
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const orders = [
  {
    id: uuidv4(),
    clientId: clients[0].id,
    items: [
      {
        productId: products[0].id,
        quantity: 1,
        unitPrice: products[0].price,
        total: products[0].price
      }
    ],
    totalAmount: products[0].price,
    status: 'pending', // pending, confirmed, shipped, delivered, cancelled
    orderDate: new Date(),
    deliveryDate: null,
    notes: 'Primeira compra do cliente',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Exportar os dados
module.exports = {
  users,
  products,
  clients,
  orders
};