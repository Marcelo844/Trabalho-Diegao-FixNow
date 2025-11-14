# Fixnow — Site (Full Stack Skeleton)

Este repositório contém um *esqueleto inicial* de um marketplace de serviços locais (**Fixnow**), baseado no plano de negócio.
- **Front-end**: React (Vite) + React Router + **Bootstrap** (CDN).
- **Back-end**: Node.js + Express + Prisma (**SQLite** no dev).

## Como rodar

### 1) Back-end
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

O servidor sobe em `http://localhost:4000`.

### 2) Front-end
```bash
cd ../frontend
npm install
npm run dev
```
O front sobe (Vite) e consumirá o back em `http://localhost:4000`.

> **Trocar para PostgreSQL (produção)**: edite `DATABASE_URL` no `.env` do backend e ajuste o `schema.prisma` se necessário. Depois rode `npx prisma migrate deploy` no servidor.

## Estrutura
```
fixnow-site/
  frontend/  # React + Bootstrap (CDN)
  backend/   # Express + Prisma (SQLite dev)
```
