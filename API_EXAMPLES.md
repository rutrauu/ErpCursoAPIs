# Exemplos de uso da API ERP

Este arquivo contém exemplos práticos de como usar todos os endpoints da API.

## Variáveis de Ambiente

```bash
export API_URL="http://localhost:3000/api"
export TOKEN="seu_token_jwt_aqui"
```

## 1. Autenticação

### 1.1 Registrar Usuário

```bash
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123",
    "role": "user"
  }'
```

### 1.2 Login

```bash
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@erp.com",
    "password": "password"
  }'
```

### 1.3 Obter Perfil

```bash
curl -X GET $API_URL/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

## 2. Produtos

### 2.1 Listar Produtos

```bash
# Todos os produtos
curl -X GET $API_URL/products \
  -H "Authorization: Bearer $TOKEN"

# Com filtros
curl -X GET "$API_URL/products?page=1&limit=5&category=Eletrônicos&search=notebook" \
  -H "Authorization: Bearer $TOKEN"
```

### 2.2 Obter Produto por ID

```bash
curl -X GET $API_URL/products/{id} \
  -H "Authorization: Bearer $TOKEN"
```

### 2.3 Criar Produto

```bash
curl -X POST $API_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "MacBook Pro",
    "description": "Notebook Apple para desenvolvedores",
    "price": 8999.99,
    "category": "Eletrônicos",
    "stock": 5,
    "code": "MBP001"
  }'
```

### 2.4 Atualizar Produto

```bash
curl -X PUT $API_URL/products/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "MacBook Pro M3",
    "price": 9999.99,
    "stock": 3
  }'
```

### 2.5 Deletar Produto

```bash
curl -X DELETE $API_URL/products/{id} \
  -H "Authorization: Bearer $TOKEN"
```

### 2.6 Listar Categorias

```bash
curl -X GET $API_URL/products/categories \
  -H "Authorization: Bearer $TOKEN"
```

## 3. Clientes

### 3.1 Listar Clientes

```bash
curl -X GET $API_URL/clients \
  -H "Authorization: Bearer $TOKEN"
```

### 3.2 Criar Cliente

```bash
curl -X POST $API_URL/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@email.com",
    "phone": "(11) 98765-4321",
    "document": "987.654.321-00",
    "address": {
      "street": "Av. Paulista, 1000",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01310-100"
    }
  }'
```

### 3.3 Atualizar Cliente

```bash
curl -X PUT $API_URL/clients/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phone": "(11) 99999-8888",
    "address": {
      "street": "Av. Paulista, 1500",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01310-200"
    }
  }'
```

## 4. Pedidos

### 4.1 Listar Pedidos

```bash
# Todos os pedidos
curl -X GET $API_URL/orders \
  -H "Authorization: Bearer $TOKEN"

# Com filtros
curl -X GET "$API_URL/orders?status=pending&clientId={clientId}" \
  -H "Authorization: Bearer $TOKEN"
```

### 4.2 Criar Pedido

```bash
curl -X POST $API_URL/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "clientId": "{clientId}",
    "items": [
      {
        "productId": "{productId}",
        "quantity": 2
      },
      {
        "productId": "{productId2}",
        "quantity": 1
      }
    ],
    "notes": "Entrega urgente"
  }'
```

### 4.3 Atualizar Status do Pedido

```bash
curl -X PATCH $API_URL/orders/{id}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "shipped",
    "deliveryDate": "2023-12-25"
  }'
```

## 5. Relatórios

### 5.1 Dashboard

```bash
curl -X GET $API_URL/reports/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### 5.2 Relatório de Vendas

```bash
curl -X GET "$API_URL/reports/sales?startDate=2023-01-01&endDate=2023-12-31&groupBy=month" \
  -H "Authorization: Bearer $TOKEN"
```

### 5.3 Relatório de Estoque

```bash
curl -X GET "$API_URL/reports/inventory?lowStock=true" \
  -H "Authorization: Bearer $TOKEN"
```

### 5.4 Relatório de Clientes

```bash
curl -X GET $API_URL/reports/customers \
  -H "Authorization: Bearer $TOKEN"
```

## Exemplos com Dados Reais

### Fluxo Completo: Criar Cliente e Fazer Pedido

```bash
# 1. Fazer login
TOKEN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.com","password":"password"}' | \
  jq -r '.data.token')

# 2. Criar produto
PRODUCT_ID=$(curl -s -X POST $API_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "iPhone 15",
    "description": "Smartphone Apple",
    "price": 4999.99,
    "category": "Eletrônicos",
    "stock": 10,
    "code": "IP15001"
  }' | jq -r '.data.product.id')

# 3. Criar cliente
CLIENT_ID=$(curl -s -X POST $API_URL/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Pedro Oliveira",
    "email": "pedro@email.com",
    "phone": "(11) 99999-9999",
    "document": "111.222.333-44",
    "address": {
      "street": "Rua das Flores, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567"
    }
  }' | jq -r '.data.client.id')

# 4. Criar pedido
ORDER_ID=$(curl -s -X POST $API_URL/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"clientId\": \"$CLIENT_ID\",
    \"items\": [
      {
        \"productId\": \"$PRODUCT_ID\",
        \"quantity\": 1
      }
    ],
    \"notes\": \"Primeira compra do cliente\"
  }" | jq -r '.data.order.id')

# 5. Atualizar status do pedido
curl -X PATCH $API_URL/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "confirmed"}'

echo "Pedido $ORDER_ID criado para cliente $CLIENT_ID com produto $PRODUCT_ID"
```

## Códigos de Status HTTP

- `200` - OK (sucesso)
- `201` - Created (criado com sucesso)
- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (não autenticado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found (não encontrado)
- `409` - Conflict (conflito, ex: email duplicado)
- `500` - Internal Server Error (erro interno)

## Estrutura de Resposta

### Sucesso
```json
{
  "status": "success",
  "message": "Operação realizada com sucesso",
  "data": {
    // dados da resposta
  }
}
```

### Erro
```json
{
  "status": "error",
  "message": "Descrição do erro",
  "details": [
    {
      "field": "campo",
      "message": "mensagem específica"
    }
  ]
}
```