# 🏢 ERP Curso APIs

Sistema ERP (Enterprise Resource Planning) desenvolvido como trabalho acadêmico utilizando APIs RESTful em Node.js com Express.

## 📋 Descrição do Projeto

Este projeto consiste no desenvolvimento de APIs RESTful sem persistência de dados (dados em memória) para um sistema ERP completo. O objetivo é aplicar os conceitos e funcionalidades do REST, implementando um back-end robusto que futuramente pode ser integrado com um front-end.

## 🎯 Funcionalidades Implementadas

### ✅ Conceito A - Implementação Completa

- **CRUD Simples**: Gerenciamento de Produtos
- **CRUD com Relacionamento**: Clientes e Pedidos
- **Funcionalidades de Negócio**: 
  - Dashboard com estatísticas
  - Relatórios de vendas
  - Relatório de estoque
  - Relatório de clientes
- **Autenticação**: JWT com middleware de segurança
- **Arquitetura em Camadas**: Controllers, Services, Middlewares, Models
- **Tratamento de Erros**: Middleware centralizado
- **Validação**: Joi para validação de dados
- **Testes**: Jest e Supertest
- **Documentação**: README completo
- **Segurança**: Helmet, CORS, bcrypt

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **JWT** - Autenticação
- **Joi** - Validação de dados
- **bcryptjs** - Criptografia de senhas
- **Helmet** - Segurança HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Jest** - Testes
- **Supertest** - Testes de API
- **uuid** - Geração de IDs únicos
- **dotenv** - Variáveis de ambiente

## 📁 Estrutura do Projeto

```
ErpCursoAPIs/
├── src/
│   ├── controllers/          # Controladores das rotas
│   │   ├── authController.js
│   │   ├── clientController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   └── reportController.js
│   ├── middlewares/          # Middlewares da aplicação
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── requestLogger.js
│   │   └── validation.js
│   ├── models/               # Modelos de dados
│   │   ├── dataStore.js
│   │   └── validationSchemas.js
│   ├── routes/               # Definição das rotas
│   │   ├── authRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   └── reportRoutes.js
│   ├── services/             # Lógica de negócio
│   ├── utils/                # Utilitários
│   │   └── helpers.js
│   └── server.js             # Arquivo principal
├── tests/                    # Testes da aplicação
│   ├── auth.test.js
│   ├── products.test.js
│   └── setup.js
├── .env                      # Variáveis de ambiente
├── .gitignore
├── jest.config.js            # Configuração do Jest
├── package.json
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/rutrauu/ErpCursoAPIs.git
cd ErpCursoAPIs
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Execute a aplicação**

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

### 🧪 Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm test -- --coverage
```

## 📡 Endpoints da API

### 🔐 Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/api/auth/register` | Registrar usuário | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/profile` | Perfil do usuário | ✅ |
| GET | `/api/auth/users` | Listar usuários (admin) | ✅ Admin |

### 📦 Produtos

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/products` | Listar produtos | ✅ |
| GET | `/api/products/:id` | Obter produto por ID | ✅ |
| POST | `/api/products` | Criar produto | ✅ |
| PUT | `/api/products/:id` | Atualizar produto | ✅ |
| DELETE | `/api/products/:id` | Deletar produto | ✅ |
| GET | `/api/products/categories` | Listar categorias | ✅ |

### 👥 Clientes

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/clients` | Listar clientes | ✅ |
| GET | `/api/clients/:id` | Obter cliente por ID | ✅ |
| POST | `/api/clients` | Criar cliente | ✅ |
| PUT | `/api/clients/:id` | Atualizar cliente | ✅ |
| DELETE | `/api/clients/:id` | Deletar cliente | ✅ |

### 📋 Pedidos

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/orders` | Listar pedidos | ✅ |
| GET | `/api/orders/:id` | Obter pedido por ID | ✅ |
| POST | `/api/orders` | Criar pedido | ✅ |
| PATCH | `/api/orders/:id/status` | Atualizar status | ✅ |
| DELETE | `/api/orders/:id` | Deletar pedido | ✅ |

### 📊 Relatórios

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/reports/dashboard` | Dashboard geral | ✅ |
| GET | `/api/reports/sales` | Relatório de vendas | ✅ |
| GET | `/api/reports/inventory` | Relatório de estoque | ✅ |
| GET | `/api/reports/customers` | Relatório de clientes | ✅ |

## 🔧 Exemplos de Uso

### Registro de Usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123",
    "role": "user"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@erp.com",
    "password": "password"
  }'
```

### Criar Produto

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "name": "Notebook Dell",
    "description": "Notebook para uso corporativo",
    "price": 2500.00,
    "category": "Eletrônicos",
    "stock": 10,
    "code": "NB001"
  }'
```

### Criar Pedido

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "clientId": "ID_DO_CLIENTE",
    "items": [
      {
        "productId": "ID_DO_PRODUTO",
        "quantity": 2
      }
    ],
    "notes": "Pedido urgente"
  }'
```

## 🔒 Segurança

- **Autenticação JWT**: Tokens seguros com expiração
- **Bcrypt**: Hash das senhas
- **Helmet**: Headers de segurança HTTP
- **CORS**: Configuração de Cross-Origin
- **Validação**: Joi para validação de entrada
- **Middleware**: Proteção de rotas

## 📝 Validações

### Produto
- Nome: 2-100 caracteres
- Descrição: até 500 caracteres
- Preço: valor positivo
- Estoque: número inteiro não negativo
- Código: obrigatório e único

### Cliente
- Nome: 2-100 caracteres
- Email: formato válido e único
- Telefone: obrigatório
- Documento: obrigatório e único
- Endereço: completo com todos os campos

### Pedido
- Cliente: deve existir
- Itens: pelo menos 1 item
- Produtos: devem existir e ter estoque
- Quantidade: número positivo

## 📈 Relatórios Implementados

### Dashboard
- Estatísticas gerais (clientes, produtos, pedidos)
- Receita total e dos últimos 30 dias
- Produtos com estoque baixo
- Pedidos por status
- Top 5 produtos mais vendidos
- Vendas por mês (últimos 6 meses)

### Relatório de Vendas
- Filtros por data, produto, cliente, status
- Agrupamento por dia/semana/mês
- Totais de pedidos, receita e itens

### Relatório de Estoque
- Produtos por categoria
- Produtos com estoque baixo
- Valor total do estoque
- Status do estoque (crítico/baixo/normal)

### Relatório de Clientes
- Estatísticas por cliente
- Total gasto, número de pedidos
- Valor médio por pedido
- Data do último pedido

## 🧪 Testes

O projeto inclui testes automatizados cobrindo:

- **Autenticação**: Registro, login, perfil
- **Produtos**: CRUD completo
- **Validações**: Dados de entrada
- **Middlewares**: Autenticação e autorização
- **Respostas**: Formatos e códigos HTTP

### Executar Testes

```bash
npm test                    # Executar todos os testes
npm run test:watch         # Modo watch
npm test -- --coverage    # Com coverage
```

## 🌐 Deploy

### Variáveis de Ambiente para Produção

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=seu_jwt_secret_super_seguro_e_complexo
JWT_EXPIRES_IN=7d
```

### Heroku Deploy

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login no Heroku
heroku login

# Criar aplicação
heroku create seu-app-erp

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=seu_jwt_secret_super_seguro

# Deploy
git push heroku main
```

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Seu Nome**
- GitHub: [@rutrauu](https://github.com/rutrauu)
- Email: seu-email@exemplo.com

## 🙏 Agradecimentos

- Professor e colegas de curso
- Comunidade Node.js
- Documentação das tecnologias utilizadas

---

⭐ **Se este projeto te ajudou, considere dar uma estrela no GitHub!**