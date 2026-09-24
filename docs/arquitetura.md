# Arquitetura

TemPro é um monorepo npm workspaces: SPA React + API Express sobre Postgres (Supabase).

## Visão geral

```
┌─────────────────────┐         /api (proxy Vite)        ┌─────────────────────┐
│  frontend (:5173)   │ ────────────────────────────────► │  backend (:3333)    │
│  Vite + React + TS  │                                   │  Express + Prisma   │
└─────────────────────┘                                   └──────────┬──────────┘
                                                                     │
                                                                     ▼
                                                          ┌─────────────────────┐
                                                          │  Postgres (Supabase)│
                                                          └─────────────────────┘
```

| Pasta | Pacote | Papel |
| --- | --- | --- |
| `frontend/` | `@tempro/frontend` | UI pública, busca, onboarding de convidado, painel do prestador |
| `backend/` | `@tempro/backend` | Auth JWT, catálogo, painel, busca de cidades (IBGE) |
| `e2e/` | Playwright | Fluxos críticos (auth, busca, painel, onboarding) |

`npm run dev` na raiz sobe API e frontend juntos. O Vite encaminha `/api` para `:3333`, então o app não fica “meio no ar”.

## Frontend

### Árvore de providers

```
ToastProvider
└── AuthProvider
    └── CatalogProvider          ← GET /api/bootstrap
        └── ProfileProvider      ← perfil do painel + overlay no catálogo
            └── ServicesProvider ← serviços/produtos do prestador logado
```

- **Filtros de busca** vivem na URL (`frontend/src/lib/urls.ts`), não em estado global — o resultado é compartilhável e o voltar do browser funciona.
- **Catálogo / perfil / serviços** vêm da API via providers.
- **Toast** é montado uma vez na raiz.

### Layouts e rotas

| Layout | Rotas | Função |
| --- | --- | --- |
| `GateLayout` | `/bem-vindo`, `/onboarding` | Intro do convidado (localStorage) |
| `PublicLayout` | `/`, `/buscar`, `/prestador/:id`, login/cadastro | Superfície pública |
| `PanelLayout` | `/painel/*` | Área autenticada (`RequireAuth`) |

Definição: `frontend/src/App.tsx`.

### Fontes de verdade no cliente

| Concern | Onde |
| --- | --- |
| Busca / ranking de resultado | `frontend/src/lib/search.ts` (espelhada em `GET /api/providers`) |
| Montagem de links de contato | `frontend/src/lib/contact.ts` |
| Formatação de preço | `frontend/src/lib/pricing.ts` |
| Flag de onboarding convidado | `frontend/src/lib/guest.ts` |
| Tokens visuais | `frontend/src/styles/tokens.css` + `app.css` |
| Feature flags de UI | `frontend/src/config.ts` (`showPrices`, `showGallery`) |

`frontend/src/data/providers.ts` é só referência histórica do seed; o que entra no banco está em `backend/src/data/seed-providers.ts`.

## Backend

### Camadas

| Módulo | Responsabilidade |
| --- | --- |
| `app.ts` | Express, CORS, JSON, handler de `HttpError` / Zod |
| `routes.ts` | Rotas `/api/*` |
| `auth.ts` / `users.ts` | Registro, login, JWT |
| `store.ts` + Prisma | Persistência |
| `search.ts` | Filtros do catálogo público |
| `cities.ts` | Proxy/busca de municípios no IBGE |
| `schemas.ts` | Validação Zod de entrada |
| `mappers.ts` / `pricing.ts` | Formato da API ↔ domínio |

### Modelo de dados (Prisma)

```
User 1──1 Provider ──* Service
                 └──* Product
                 └──* ProviderPhoto
Category 1──* Service
```

- **User**: credenciais + vínculo obrigatório a um `Provider` (`providerId`).
- **Provider**: perfil público (cidade principal + `serviceCities[]`, modo de atendimento, contatos, mídia).
- **Service / Product**: preço em partes (`priceType` + `priceAmount`) e também `displayPrice` para listagem.
- **Category**: taxonomia canônica; serviços referenciam por FK.

Schema: `backend/prisma/schema.prisma`.

### Auth

- Registro cria **usuário + prestador** na mesma operação.
- Login devolve **JWT**; rotas `/api/panel/*` exigem Bearer.
- Segredo: `JWT_SECRET`. Demo pós-seed: `joao@tempro.local` / `joao1234`.

### Integrações externas

| Destino | Uso |
| --- | --- |
| Supabase Postgres | Dados (pooler em `DATABASE_URL`; `DIRECT_URL` para migrate) |
| IBGE | `GET /api/cities` — municípios para o seletor |
| LoremFlickr (seed) | Placeholders de logo/portfólio |

## Contratos principais da API

| Método | Caminho | Notas |
| --- | --- | --- |
| `GET` | `/api/bootstrap` | Catálogo público + meta (primeira carga) |
| `GET` | `/api/meta` | Categorias, cidades e destaques derivados do banco |
| `GET` | `/api/providers` | Busca (mesmas regras do cliente) |
| `GET` | `/api/providers/:id` | Perfil público |
| `POST` | `/api/auth/register` / `login` | Conta |
| `GET/PUT` | `/api/panel/profile` | Perfil do logado |
| `CRUD` | `/api/panel/services` · `/api/panel/products` | Oferta do prestador |

Lista completa: `backend/README.md`.

## Deploy e SPA

A UI é history API. Em produção o host precisa reescrever caminhos desconhecidos para `index.html` (já coberto por `frontend/vercel.json` / `vite preview`). Deep links como `/prestador/joao` falham sem esse rewrite.

## Testes

Playwright em `e2e/` sobe API + Vite se necessário e assume banco seedado. Cobertura focada em auth, busca, painel e onboarding de convidado.
