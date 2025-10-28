# 🚀 Guia de Requisições Postman - Sistema de Gestão Acadêmica

Este arquivo contém todas as requisições prontas para testar a API no Postman.

## 📋 **Configuração Inicial**

### **Base URL:**
```
http://localhost:3000
```

### **Headers Padrão:**
```
Content-Type: application/json
```

---

## 🔐 **1. AUTENTICAÇÃO**

### **1.1 Registrar Usuário**
```
POST http://localhost:3000/api/auth/register
```

**Body (JSON):**
```json
{
  "nome": "Administrador Sistema",
  "email": "admin@teste.com",
  "password": "123456",
  "role": "admin"
}
```

### **1.2 Login**
```
POST http://localhost:3000/api/auth/login
```

**Body (JSON):**
```json
{
  "email": "admin@teste.com",
  "password": "123456"
}
```

**⚠️ IMPORTANTE:** Copie o `token` da resposta e use em todas as próximas requisições!

### **1.3 Perfil do Usuário**
```
GET http://localhost:3000/api/auth/profile
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

---

## 📚 **2. DISCIPLINAS**

### **2.1 Criar Disciplina**
```
POST http://localhost:3000/api/disciplinas
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nome": "Programação Orientada a Objetos",
  "curso": "Ciência da Computação",
  "descricao": "Disciplina focada em conceitos de POO",
  "cargaHoraria": 80,
  "semestre": "2025/2"
}
```

### **2.2 Listar Todas as Disciplinas**
```
GET http://localhost:3000/api/disciplinas
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

### **2.3 Buscar Disciplina por ID**
```
GET http://localhost:3000/api/disciplinas/[ID_DA_DISCIPLINA]
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

### **2.4 Atualizar Disciplina**
```
PUT http://localhost:3000/api/disciplinas/[ID_DA_DISCIPLINA]
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nome": "Programação Orientada a Objetos Avançada",
  "curso": "Ciência da Computação",
  "descricao": "Disciplina avançada de POO com padrões de projeto",
  "cargaHoraria": 100,
  "semestre": "2025/2"
}
```

### **2.5 Deletar Disciplina**
```
DELETE http://localhost:3000/api/disciplinas/[ID_DA_DISCIPLINA]
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

### **2.6 Listar Cursos Únicos**
```
GET http://localhost:3000/api/disciplinas/cursos
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

---

## 🏫 **3. SALAS**

### **3.1 Criar Sala**
```
POST http://localhost:3000/api/salas
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
Content-Type: application/json
```

**Body (JSON) - Opção 1:**
```json
{
  "numero": "A101",
  "descricao": "Sala de aula padrão",
  "lotacao": 40,
  "nome": "Sala A101",
  "tipo": "sala-aula"
}
```

**Body (JSON) - Opção 2 (sem nome):**
```json
{
  "numero": "B202",
  "descricao": "Laboratório de informática",
  "lotacao": 30,
  "tipo": "laboratorio"
}
```

### **3.2 Listar Todas as Salas**
```
GET http://localhost:3000/api/salas
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

### **3.3 Filtrar Salas por Número**
```
GET http://localhost:3000/api/salas?numero=A101
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

### **3.4 Buscar Sala por ID**
```
GET http://localhost:3000/api/salas/[ID_DA_SALA]
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

### **3.5 Atualizar Sala**
```
PUT http://localhost:3000/api/salas/[ID_DA_SALA]
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "numero": "A101",
  "descricao": "Sala de aula renovada",
  "lotacao": 45,
  "nome": "Sala A101 Renovada",
  "tipo": "sala-aula"
}
```

### **3.6 Deletar Sala**
```
DELETE http://localhost:3000/api/salas/[ID_DA_SALA]
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

### **3.7 Verificar Disponibilidade da Sala**
```
GET http://localhost:3000/api/salas/[ID_DA_SALA]/disponibilidade?semestreLetivo=2025/2&diaSemana=segunda-feira
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

---

## 👥 **4. TURMAS**

### **4.1 Criar Turma**
```
POST http://localhost:3000/api/turmas
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
Content-Type: application/json
```

**Body (JSON) - Formato 1 (horário unificado):**
```json
{
  "semestreLetivo": "2025/2",
  "disciplinaId": "[ID_DA_DISCIPLINA]",
  "professor": "Prof. João Silva",
  "salaId": "[ID_DA_SALA]",
  "diaSemana": "segunda-feira",
  "horario": "19:00-22:30",
  "vagas": 35
}
```

**Body (JSON) - Formato 2 (horários separados):**
```json
{
  "semestreLetivo": "2025/2",
  "disciplinaId": "[ID_DA_DISCIPLINA]",
  "professor": "Prof. Maria Santos",
  "salaId": "[ID_DA_SALA]",
  "diaSemana": "terça-feira",
  "horarioInicio": "19:00",
  "horarioFim": "22:30",
  "vagas": 40
}
```

### **4.2 Listar Todas as Turmas**
```
GET http://localhost:3000/api/turmas
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

### **4.3 Filtrar Turmas por Semestre**
```
GET http://localhost:3000/api/turmas?semestreLetivo=2025/2
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

### **4.4 Ordenar Turmas por Dia e Sala**
```
GET http://localhost:3000/api/turmas?ordenacao=dia-sala
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

### **4.5 Atualizar Turma**
```
PUT http://localhost:3000/api/turmas/[ID_DA_TURMA]
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "semestreLetivo": "2025/2",
  "disciplinaId": "[ID_DA_DISCIPLINA]",
  "professor": "Prof. Carlos Oliveira",
  "salaId": "[ID_DA_SALA]",
  "diaSemana": "quarta-feira",
  "horario": "19:00-22:30",
  "vagas": 30
}
```

### **4.6 Deletar Turma**
```
DELETE http://localhost:3000/api/turmas/[ID_DA_TURMA]
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

### **4.7 Relatório de Turmas**
```
GET http://localhost:3000/api/turmas/relatorio?semestreLetivo=2025/2
```

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_AQUI]
```

---

## 🎯 **5. FLUXO DE TESTE COMPLETO**

### **Passo 1:** Fazer Login
```json
POST http://localhost:3000/api/auth/login
{
  "email": "admin@teste.com",
  "password": "123456"
}
```

### **Passo 2:** Criar Disciplina
```json
POST http://localhost:3000/api/disciplinas
{
  "nome": "Estruturas de Dados",
  "curso": "Ciência da Computação",
  "descricao": "Estudo de estruturas de dados fundamentais",
  "cargaHoraria": 80,
  "semestre": "2025/2"
}
```

### **Passo 3:** Criar Sala
```json
POST http://localhost:3000/api/salas
{
  "numero": "LAB01",
  "descricao": "Laboratório de Programação",
  "lotacao": 25,
  "tipo": "laboratorio"
}
```

### **Passo 4:** Criar Turma
```json
POST http://localhost:3000/api/turmas
{
  "semestreLetivo": "2025/2",
  "disciplinaId": "[ID_DA_DISCIPLINA_CRIADA]",
  "professor": "Prof. Ana Costa",
  "salaId": "[ID_DA_SALA_CRIADA]",
  "diaSemana": "segunda-feira",
  "horario": "19:00-22:30",
  "vagas": 25
}
```

---

## ⚠️ **OBSERVAÇÕES IMPORTANTES**

### **Validações e Regras de Negócio:**

1. **Disciplinas:**
   - Não pode haver disciplinas com mesmo nome no mesmo semestre
   - Carga horária deve ser positiva

2. **Salas:**
   - Número da sala deve ser único
   - Lotação deve ser positiva

3. **Turmas:**
   - Relação 1:1 entre disciplina e turma no mesmo semestre
   - Professor não pode ter mais de uma turma no mesmo dia/semestre
   - Sala não pode ter mais de uma turma no mesmo dia/semestre
   - Horário deve estar no formato HH:MM ou HH:MM-HH:MM

### **Tipos de Sala Válidos:**
- `sala-aula`
- `laboratorio`
- `auditorio`
- `biblioteca`

### **Dias da Semana Válidos:**
- `segunda-feira`
- `terça-feira`
- `quarta-feira`
- `quinta-feira`
- `sexta-feira`
- `sábado`

### **Roles de Usuário:**
- `admin`
- `professor`
- `coordenador`