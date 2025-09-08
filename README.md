
# 📚 Este projeto é uma API desenvolvida como parte da minha jornada de aprendizado na [Rocketseat](https://www.rocketseat.com.br/). A aplicação simula o backend de um sistema de gerenciamento de tarefas, com foco em boas práticas, validação de dados e organização de código.

By Dev. Eduardo José Marinho


---

# 📋 Gerenciador de Tarefas

Este projeto é uma API RESTful desenvolvida em Node.js com TypeScript para gerenciamento de tarefas em equipe. Ele permite autenticação de usuários, atribuição de tarefas, categorização por status e prioridade, além de controle de acesso por níveis de permissão.

## 🚀 Tecnologias Utilizadas

- **Node.js** com **Express.js**
- **TypeScript**
- **PostgreSQL** com **Prisma ORM**
- **Docker**
- **JWT** para autenticação
- **Zod** para validação
- **Jest** para testes automatizados

## 📦 Estrutura do Projeto


├── prisma/              # Migrations e schema do banco ├── src/                 # Código-fonte da aplicação │   ├── controllers/     # Lógica de controle das rotas │   ├── services/        # Regras de negócio │   ├── routes/          # Definição das rotas │   ├── middlewares/     # Autenticação, validações etc. │   └── utils/           # Funções auxiliares ├── .env-example         # Exemplo de variáveis de ambiente ├── docker-compose.yml   # Configuração de containers ├── package.json         # Dependências e scripts └── tsconfig.json        # Configuração do TypeScript

## 🔐 Funcionalidades

### Autenticação e Autorização

- Cadastro e login de usuários
- Autenticação via JWT
- Níveis de acesso:
  - **Administrador(partner)**: gerencia usuários e equipes
  - **Membro(collaborator)**: gerencia tarefas atribuídas

### Tarefas

- Criar, editar, listar e excluir tarefas
- Atribuir tarefas a membros
- Definir status (pendente, em andamento, concluída)
- Definir prioridade (baixa, média, alta)

## 🧪 Testes

- Os testes são escritos com **Jest**, cobrindo as principais funcionalidades da API.

bash
npm run test


🐳 Docker
Para subir o ambiente com Docker:
docker-compose up


🌐 Deploy
O backend pode ser publicado na plataforma Render. Certifique-se de configurar as variáveis de ambiente corretamente.
📄 Variáveis de Ambiente
Crie um arquivo .env com base no .env-example:
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret


🛠️ Como rodar localmente
git clone https://github.com/EduJMarinho/manager.git
cd manager
npm install
npx prisma migrate dev
npm run dev


---


## 📄 Licença
Este projeto está sob licença MIT.


---

>#
🧠 Analisar 📚 Aprender ❌ Errar  
   🔁 Refatorar  🛠️ Construir  
          → → → → → → →  
→ Esse é o caminho do Dev. — Edu Marinho

