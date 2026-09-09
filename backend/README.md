# TemPro API

Backend Node.js + TypeScript do marketplace de prestadores. Usa Postgres
hospedado no Supabase.

## Subir

```bash
cd backend
npm install
npx prisma migrate deploy
npm run db:seed       # opcional: recria os dados de exemplo
npm run dev          # http://localhost:3333
```

O frontend (Vite na porta 5173) encaminha `/api` para esta API.

## Variáveis

Copie `.env.example` para `.env`. A senha do Postgres precisa estar URL-encoded
em `DATABASE_URL` (`!` vira `%21`).

No Supabase, use a **connection pooler** (Supavisor) em vez da conexão direta
(`db.<projeto>.supabase.co`) — a conexão direta é somente IPv6 e não funciona
em muitos ambientes (Vercel Functions incluso, sem o add-on de IPv4). Pegue as
strings em Project Settings → Database → Connection pooling:

- `DATABASE_URL`: pooler em modo *transaction* (porta `6543`, com
  `?pgbouncer=true`) — usada em runtime pela API.
- `DIRECT_URL`: pooler em modo *session* (porta `5432`) ou a conexão direta —
  usada pelo Prisma só durante `migrate deploy`/`migrate dev`.

| Chave | Padrão | Uso |
| --- | --- | --- |
| `PORT` | `3333` | Porta HTTP |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS |
| `DATABASE_URL` | — | Postgres (pooler, runtime) |
| `DIRECT_URL` | — | Postgres (conexão para migrations) |
| `JWT_SECRET` | — | Assinatura do token de login |

Usuário de demonstração (depois do seed): `joao@tempro.local` / `joao1234`.

## Rotas

| Método | Caminho | O quê |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness |
| `POST` | `/api/auth/register` | Cria usuário + prestador |
| `POST` | `/api/auth/login` | Login (devolve JWT) |
| `GET` | `/api/auth/me` | Usuário logado, perfil, serviços e produtos |
| `GET` | `/api/categories` | Categorias cadastradas |
| `GET` | `/api/cities` | Busca municípios no IBGE |
| `GET` | `/api/bootstrap` | Catálogo público + meta |
| `GET` | `/api/meta` | Categorias, cidades, destaques |
| `GET` | `/api/providers` | Busca |
| `GET` | `/api/providers/:id` | Perfil público |
| `GET/PUT` | `/api/panel/profile` | Perfil (JWT) |
| `POST` | `/api/panel/profile/reset` | Restaura o seed (JWT) |
| `GET/POST` | `/api/panel/services` | Serviços (JWT) |
| `GET/PATCH/DELETE` | `/api/panel/services/:id` | Um serviço (JWT) |
| `GET/POST` | `/api/panel/products` | Produtos (JWT) |
| `GET/PATCH/DELETE` | `/api/panel/products/:id` | Um produto (JWT) |
