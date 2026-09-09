# Serviços Perto (TemPro)

Marketplace de prestadores de serviço locais — MVP navegável.

Monorepo npm workspaces:

| Pasta | Pacote | Stack |
| --- | --- | --- |
| `frontend/` | `@tempro/frontend` | Vite + React + TypeScript |
| `backend/` | `@tempro/backend` | Node + Express + Prisma + Postgres |

## Rodando

Na raiz do monorepo:

```bash
npm install

# 1. API — cria tabelas e carrega o seed
npm run db:migrate -w @tempro/backend
npm run db:seed
npm run dev:api        # http://localhost:3333

# 2. Frontend (outra aba)
npm run dev            # http://localhost:5173  (proxy /api → :3333)
```

Outros scripts da raiz:

```bash
npm run build          # frontend → frontend/dist/
npm run build:api      # backend → backend/dist/
npm run preview        # serve o build do frontend
npm run typecheck
npm run typecheck:api
```

Detalhes da API, schema e rotas: `backend/README.md`.

## Rotas

| Rota                     | Tela                                                      |
| ------------------------ | --------------------------------------------------------- |
| `/`                      | Home — hero, busca, categorias, destaques                  |
| `/buscar`                | Resultados com filtros                                     |
| `/prestador/:id`         | Perfil público do prestador                                |
| `/painel`                | Visão geral do prestador                                   |
| `/painel/perfil`         | Editar o perfil público                                    |
| `/painel/servicos`       | Lista dos serviços cadastrados                             |
| `/painel/servicos/novo`  | Cadastro de serviço                                        |
| `/painel/servicos/:id/editar` | Edição de serviço                                     |
| qualquer outra           | 404                                                        |

A **busca mora na URL** (`/buscar?q=eletricista&cidade=Lajeado%20-%20RS`),
então o resultado é compartilhável, favoritável e o botão voltar funciona.
Parâmetros no valor padrão são omitidos para o link ficar curto.

> **Hospedagem:** é uma SPA com rotas no history API. O servidor precisa
> devolver `index.html` para qualquer caminho, senão um deep link como
> `/prestador/joao` dá 404. `vite preview` já faz isso; em produção configure
> o rewrite (`try_files`, `_redirects`, `vercel.json` etc.).

## Regra de busca

`frontend/src/lib/search.ts`. Um único campo de texto cruza nome, categoria,
descrição e cidade: **todas** as palavras digitadas precisam aparecer no texto
do prestador, então `eletricista joão` restringe em vez de ampliar.

Três detalhes que valem lembrar:

- Se a consulta **nomeia uma cidade** (`clima lajeado`), o seletor de cidade é
  ignorado — o texto já disse onde procurar — e o título do resultado deixa de
  citar a cidade do seletor, para não contradizer a lista.
- Consulta e categorias **se substituem**, nos dois sentidos: escolher uma
  categoria limpa o texto, e buscar um texto novo zera as categorias. Os dois
  respondem à mesma pergunta; somados, devolveriam zero sempre que
  discordassem, e os chips acabariam rotulando a lista errada. Cidade, forma e
  preço são eixos diferentes e permanecem.
- **Categorias são multi-seleção.** O menu soma (`?categoria=Eletricista,Pintor`);
  nenhuma marcada significa todas. O título acompanha: uma categoria vira o
  plural ("Eletricistas"), duas viram "A e B", e daí em diante conta a cauda
  ("Eletricistas, Pintores e mais 2") para não ficar maior que o resto.
- Um prestador marcado como `Ambos` satisfaz qualquer forma de atendimento.

**Um campo de busca por tela.** A home tem a busca no hero; nas demais páginas
ela fica no header, e na `/buscar` é esse campo do header que edita o `q` —
a barra de filtros ali só tem categoria, cidade, forma e preço.

## Estado

- **Filtros de busca** → query params (`frontend/src/lib/urls.ts`).
- **Catálogo, perfil e serviços** → API TemPro (`CatalogProvider` + painel).
- **Toast** → `ToastProvider`, montado uma vez na raiz do app.

O preço de um serviço é guardado **em partes** (`priceType` + `priceAmount`),
nunca como a string renderizada: guardar "A partir de R$ 150" obrigaria a
desmontar o texto toda vez que a linha fosse editada.

### O painel é a fonte de verdade do perfil público

`ProfileProvider` também expõe `useCatalog()`: a lista de prestadores com o
perfil editado aplicado por cima do seed. Home, busca e perfil leem dela, então
mudar nome, cidade ou forma de atendimento no painel aparece na busca na hora.

O perfil público do prestador logado mostra os serviços do painel, não os do
catálogo estático — senão "Visualizar meu perfil público" exibiria uma lista
diferente da que você acabou de editar em "Meus serviços".

## Dados

O catálogo vive no Postgres (`tempro`). O frontend busca em `GET /api/bootstrap`
e o painel grava perfil/serviços na API. `frontend/src/data/providers.ts` ficou
só como referência do seed original — a cópia que entra no banco está em
`backend/src/data/seed-providers.ts`.

A busca no cliente continua em `frontend/src/lib/search.ts` (e a API replica a
mesma regra em `GET /api/providers`).

O painel pede login (`/entrar`). Conta de demo depois do seed:
`joao@tempro.local` / `joao1234`. Quem não tem conta cria em `/cadastrar`.

Categorias e cidades saem do `GET /api/meta` (derivadas do que está no banco),
então um prestador novo numa cidade nova já aparece nos filtros.

### Imagens

O seed da API anexa fotos de placeholder derivadas da categoria (LoremFlickr).
Cerca de 2 em 3 recebem logo e 1 em 3 recebe portfólio, de propósito: o layout
tem que aguentar quem subiu arte e quem não subiu. Sem logo, o perfil cai no
monograma tintado.

## Contato

`frontend/src/lib/contact.ts` monta os links de WhatsApp, telefone e Instagram
a partir dos campos `whatsapp` / `phone` / `instagram` do prestador. Nenhum
prestador do catálogo de exemplo tem esses dados, então os botões mostram um
toast de confirmação — mas **em "Meu perfil" você preenche os seus e os botões
passam a abrir o destino real**, sem mudar a interface.

Número de WhatsApp é normalizado para E.164: as pessoas digitam
"(51) 99999-8888", e um número nacional de 10 ou 11 dígitos ganha o 55 na
frente. Sem isso o `wa.me` sairia quebrado.

## Configuração

`frontend/src/config.ts`:

| Chave         | Efeito                                        |
| ------------- | --------------------------------------------- |
| `showPrices`  | Exibe preços em cards, perfis e painel         |
| `showGallery` | Permite a galeria "Trabalhos realizados"       |

A galeria só aparece quando o prestador tem `photos` — cerca de um terço do
catálogo. Quatro molduras tracejadas num perfil público leem como página
quebrada, enquanto a ausência da seção lê como "esse profissional ainda não
postou fotos".

## Estilo

- `frontend/src/styles/tokens.css` — tokens do design system **Modernist**,
  mais a camada de produto (raios, grounds, alturas de controle). É aqui que a
  identidade visual é ajustada.
- `frontend/src/styles/app.css` — classes da aplicação, todas sobre os tokens.
  Nenhuma cor de marca solta.

Mobile-first: as regras base são o layout de telefone e as media queries
alargam. Aos 900px a sidebar do painel vira trilho lateral fixo e o perfil
ganha a coluna de contato grudada.
