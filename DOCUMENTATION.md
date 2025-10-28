# Documentação da API ERP

## 📚 Visão Geral

Esta API RESTful foi desenvolvida para um sistema ERP (Enterprise Resource Planning) completo, implementando todas as funcionalidades necessárias para gerenciar produtos, clientes, pedidos e relatórios de uma empresa.

## 🏗️ Arquitetura

### Camadas da Aplicação

```
┌─────────────────────────────────────┐
│              ROTAS (Routes)         │
├─────────────────────────────────────┤
│           CONTROLADORES             │
│            (Controllers)            │
├─────────────────────────────────────┤
│            MIDDLEWARES              │
│        (Auth, Validation, etc)      │
├─────────────────────────────────────┤
│             MODELOS                 │
│           (Data Models)             │
├─────────────────────────────────────┤
│           ARMAZENAMENTO             │
│            (In-Memory)              │
└─────────────────────────────────────┘
```

### Fluxo de Requisição

1. **Cliente** faz requisição HTTP
2. **Middleware de Log** registra a requisição
3. **Middleware de Autenticação** verifica token JWT (se necessário)
4. **Middleware de Validação** valida dados de entrada
5. **Controller** processa a lógica de negócio
6. **Model** manipula os dados
7. **Response** é enviada ao cliente

## 🔐 Sistema de Autenticação

### JWT (JSON Web Token)

A API utiliza JWT para autenticação stateless:

- **Registro**: Cria usuário e retorna token
- **Login**: Valida credenciais e retorna token
- **Proteção**: Middlewares verificam token em rotas protegidas

### Estrutura do Token

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "iat": 1640995200,
  "exp": 1641600000
}
```

### Níveis de Acesso

- **Usuário**: Acesso básico a produtos, clientes, pedidos
- **Admin**: Acesso completo + gerenciamento de usuários

## 📊 Modelos de Dados

### Usuário (User)

```json
{
  "id": "uuid",
  "name": "string",
  "email": "string (unique)",
  "password": "string (hashed)",
  "role": "user|admin",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Produto (Product)

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "stock": "number",
  "code": "string (unique)",
  "active": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Cliente (Client)

```json
{
  "id": "uuid",
  "name": "string",
  "email": "string (unique)",
  "phone": "string",
  "document": "string (unique)",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string"
  },
  "active": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Pedido (Order)

```json
{
  "id": "uuid",
  "clientId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": "number",
      "unitPrice": "number",
      "total": "number"
    }
  ],
  "totalAmount": "number",
  "status": "pending|confirmed|shipped|delivered|cancelled",
  "orderDate": "datetime",
  "deliveryDate": "datetime|null",
  "notes": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 🛠️ Middlewares

### 1. Autenticação (authMiddleware)

- Verifica presença do token JWT
- Valida assinatura do token
- Adiciona dados do usuário à requisição
- Retorna erro 401 se inválido

### 2. Autorização (adminMiddleware)

- Verifica se o usuário é admin
- Usado em rotas administrativas
- Retorna erro 403 se não autorizado

### 3. Validação (validation)

- Usa Joi para validar dados de entrada
- Valida estrutura, tipos e regras de negócio
- Retorna erro 400 com detalhes se inválido

### 4. Tratamento de Erros (errorHandler)

- Captura erros não tratados
- Formata respostas de erro
- Oculta detalhes em produção
- Log de erros para debugging

### 5. Logger de Requisições (requestLogger)

- Registra todas as requisições HTTP
- Inclui método, URL, IP e timestamp
- Mede tempo de resposta
- Útil para debugging e monitoramento

## 🔄 Fluxos de Negócio

### Criação de Pedido

1. **Validar Cliente**: Verificar se existe e está ativo
2. **Validar Produtos**: Verificar se existem e têm estoque
3. **Calcular Totais**: Preço unitário × quantidade
4. **Atualizar Estoque**: Reduzir estoque dos produtos
5. **Criar Pedido**: Salvar com status "pending"
6. **Retornar Dados**: Incluir informações de cliente e produtos

### Cancelamento de Pedido

1. **Verificar Status**: Apenas pedidos não enviados
2. **Devolver Estoque**: Restaurar quantidades dos produtos
3. **Atualizar Status**: Marcar como "cancelled"
4. **Log da Operação**: Registrar cancelamento

### Relatórios

#### Dashboard
- Estatísticas gerais do sistema
- Métricas de vendas e estoque
- Produtos mais vendidos
- Alertas de estoque baixo

#### Relatório de Vendas
- Filtros por período, cliente, produto
- Agrupamento por dia/semana/mês
- Cálculos de receita e volume

## 🧪 Estratégia de Testes

### Tipos de Testes

1. **Testes Unitários**: Funções individuais
2. **Testes de Integração**: APIs endpoints
3. **Testes de Middleware**: Autenticação e validação

### Estrutura dos Testes

```javascript
describe('Feature', () => {
  beforeAll(() => {
    // Setup inicial
  });
  
  beforeEach(() => {
    // Reset para cada teste
  });
  
  describe('Scenario', () => {
    it('should behave correctly', async () => {
      // Arrange, Act, Assert
    });
  });
});
```

### Cobertura de Testes

- **Controllers**: Todos os endpoints
- **Middlewares**: Casos de sucesso e erro
- **Validações**: Dados válidos e inválidos
- **Autorização**: Permissões corretas

## 🚀 Deploy e Produção

### Variáveis de Ambiente

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=super_secret_key_here
JWT_EXPIRES_IN=7d
```

### Heroku Deploy

```bash
# Configurar Heroku
heroku create nome-da-app
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=seu_secret_aqui

# Deploy
git push heroku main
```

### Monitoramento

- **Health Check**: `/health` endpoint
- **Logs**: Middleware de logging
- **Performance**: Tempo de resposta
- **Erros**: Tratamento centralizado

## 📈 Melhorias Futuras

### Performance
- [ ] Cache com Redis
- [ ] Otimização de consultas
- [ ] Compressão de respostas

### Funcionalidades
- [ ] Upload de imagens de produtos
- [ ] Notificações por email
- [ ] Sistema de permissões granular
- [ ] API de integração com terceiros

### Infraestrutura
- [ ] Banco de dados persistente
- [ ] Load balancing
- [ ] CDN para assets
- [ ] Monitoramento avançado

## 🔗 Recursos Úteis

- [Express.js Docs](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [Joi Validation](https://joi.dev/)
- [Jest Testing](https://jestjs.io/)
- [Supertest](https://github.com/visionmedia/supertest)