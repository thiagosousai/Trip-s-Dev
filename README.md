
# ✈️ Trip's Dev

> Aplicação web para **planejamento e organização de viagens**, permitindo centralizar destinos, roteiros, atividades e custos em um único lugar.

---

## 📌 Sobre o projeto

O **Trip's Dev** é uma aplicação web desenvolvida para facilitar o planejamento de viagens.

A plataforma permite que usuários criem e gerenciem viagens, organizem atividades em seus roteiros, acompanhem custos estimados e consultem suas próximas viagens por meio de uma interface responsiva.

A aplicação é dividida em **frontend** e **backend**, que se comunicam através de uma **API REST**.

---

## 🚀 Funcionalidades

### 👤 Usuários

* Cadastro de usuário
* Login e encerramento de sessão
* Persistência da sessão no navegador
* Exclusão da conta
* Remoção dos dados relacionados à conta

### ✈️ Viagens

* Cadastro de viagens
* Edição de viagens
* Exclusão de viagens
* Busca de viagens por destino

### 📋 Roteiros

* Cadastro de atividades
* Edição de atividades
* Exclusão de atividades
* Categoria da atividade
* Data e horário
* Local
* Custo
* Detalhes da atividade

### 📊 Dashboard

* Próxima viagem
* Resumo das atividades
* Custo estimado
* Visualização organizada das viagens

### 📱 Interface

* Layout responsivo
* Suporte para desktop e dispositivos móveis

---

## 🛠️ Tecnologias

### Frontend

* **React 19**
* **TypeScript**
* **Vite 8**
* **React Router DOM**
* **Tailwind CSS 4**
* CSS responsivo

### Backend

* **Node.js**
* **Express**
* **CORS**
* **SQLite**
* `node:sqlite`

### Arquitetura

```text
┌─────────────────────┐
│      Frontend       │
│ React + TypeScript  │
│       + Vite        │
└──────────┬──────────┘
           │
           │ HTTP / REST API
           ▼
┌─────────────────────┐
│       Backend       │
│ Node.js + Express   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│       SQLite        │
│     trip.db         │
└─────────────────────┘
```

---

## 🔐 Segurança

O cadastro de usuários possui requisitos mínimos para as senhas:

* Pelo menos **8 caracteres**
* Pelo menos **uma letra maiúscula**
* Pelo menos **uma letra minúscula**
* Pelo menos **um número**

As senhas **não são armazenadas em texto puro**.

O backend utiliza o algoritmo **`scrypt`**, com **salt aleatório**, para gerar o hash das senhas antes de armazená-las no SQLite.

Além disso:

* A API nunca retorna a senha do usuário.
* Contas antigas armazenadas antes da implementação do hash são convertidas automaticamente quando o backend é iniciado.

---

## 📁 Estrutura do projeto

```text
.
├── backend/
│   ├── server.js          # API REST
│   ├── trip.db            # Banco SQLite local
│   └── package.json       # Dependências do backend
│
├── src/
│   ├── components/        # Componentes da interface
│   ├── services/          # Comunicação com a API
│   ├── App.tsx            # Rotas e gerenciamento da sessão
│   └── App.css            # Estilos da aplicação
│
├── index.html
├── package.json            # Dependências e scripts do frontend
└── vite.config.ts          # Configuração do Vite
```

---

## 🗄️ Banco de dados

O banco SQLite é criado automaticamente na primeira inicialização do backend:

```text
backend/trip.db
```

O banco possui as seguintes tabelas:

| Tabela     | Descrição                        |
| ---------- | -------------------------------- |
| `usuarios` | Dados dos usuários               |
| `viagens`  | Viagens cadastradas              |
| `roteiro`  | Atividades associadas às viagens |

### Migração de dados

Caso exista um arquivo legado:

```text
backend/data.json
```

os dados são migrados automaticamente para o SQLite quando o banco ainda estiver vazio.

Após a migração, os novos dados passam a ser armazenados diretamente no SQLite.

---

## 🔌 API REST

| Método   | Endpoint                                  | Descrição                     |
| -------- | ----------------------------------------- | ----------------------------- |
| `POST`   | `/usuarios`                               | Cadastra um usuário           |
| `POST`   | `/login`                                  | Autentica um usuário          |
| `DELETE` | `/usuarios/:id`                           | Exclui uma conta e seus dados |
| `GET`    | `/viagens?usuarioId=:id`                  | Lista as viagens do usuário   |
| `POST`   | `/viagens`                                | Cria uma viagem               |
| `PATCH`  | `/viagens/:id`                            | Edita uma viagem              |
| `DELETE` | `/viagens/:id?usuarioId=:id`              | Exclui uma viagem             |
| `POST`   | `/viagens/:id/roteiro`                    | Adiciona uma atividade        |
| `PATCH`  | `/viagens/:viagemId/roteiro/:atividadeId` | Edita uma atividade           |
| `DELETE` | `/viagens/:viagemId/roteiro/:atividadeId` | Exclui uma atividade          |

---

## 🌐 Deploy

O projeto possui uma versão publicada e disponível para acesso através do deploy realizado para a aplicação.

---

## 🧪 Build e formatação

### Build de produção

Para verificar se o frontend pode ser compilado corretamente:

```bash
npm run build
```

### Formatação

Para formatar os arquivos do projeto:

```bash
npm run format
```

---

## 📍 Status do projeto

**Concluído.**

O projeto possui uma arquitetura separada entre frontend e backend, persistência de dados em SQLite, autenticação de usuários e gerenciamento completo de viagens e atividades.

A aplicação também possui uma versão publicada por meio de deploy.

---

## 👨‍💻 Desenvolvimento

Projeto desenvolvido como aplicação web utilizando tecnologias modernas do ecossistema JavaScript/TypeScript, com foco em organização de viagens, arquitetura cliente-servidor e persistência de dados.
