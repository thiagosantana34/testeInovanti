
🚀 Tecnologias

Frontend: React, React Router

Backend: Node.js, Express, JWT, Bcrypt, PostgreSQL

Banco de Dados: PostgreSQL

Autenticação: JWT (JSON Web Token)

#########################################################################################################

📁 Estrutura

task-manager-app/
├── backend/       → Servidor Express com API RESTful
└── frontend/      → Aplicação React com rotas e formulários


##########################################################################################################

Como rodar:
Crie o banco PostgreSQL e rode o script SQL para criar as tabelas.

No backend:

Copie o .env.exemplo para .env e configure seu DB e JWT_SECRET.

Rode npm install.

Rode npm run dev para rodar o servidor.

No frontend:

Rode npm install.

Rode npm start.

##########################################################################################################

📦 Instalação
Clone o repositório:

bash
Copiar
Editar
git clone https://github.com/seu-usuario/task-manager-app.git
cd task-manager-app
Configure o banco de dados:

Crie o banco:

sql
Copiar
Editar
CREATE DATABASE taskdb;
Execute o script schema.sql no PostgreSQL:

bash
Copiar
Editar
psql -U seu_usuario -d taskdb -f backend/schema.sql

##########################################################################################################

🔐 Configure variáveis de ambiente
Crie o arquivo .env na pasta backend/ com base no .env.example:

env
Copiar
Editar
DATABASE_URL=postgresql://seu_usuario:senha@localhost:5432/taskdb
JWT_SECRET=algum_segredo

##########################################################################################################

🚀 Rodando o Backend
bash
Copiar
Editar
cd backend
npm install
npm start
Servidor rodando em: http://localhost:3001

##########################################################################################################

💻 Rodando o Frontend

bash
Copiar
Editar
cd frontend
npm install
npm start
Frontend disponível em: http://localhost:3000