# Regras de negócio

Regras do produto TemPro (MVP). Quando o código divergir deste texto, atualize **este arquivo** junto com a mudança — a fonte de implementação está citada em cada seção.

## Produto

TemPro é um **marketplace local de prestadores de serviço**: quem busca encontra profissionais por cidade/categoria; quem presta gerencia perfil e oferta no painel.

## Conta e identidade

- Cadastro exige nome, primeiro nome, sobrenome, **celular com DDD** (11 dígitos nacionais ou 13 com `55`), e-mail e senha (≥ 6 caracteres).
- O celular do cadastro alimenta o WhatsApp do prestador (só dígitos); no painel o contato do perfil é editável à parte.
- Cada usuário possui **um** prestador vinculado (`providerId` único).
- Cadastro exige **pelo menos um serviço** (nome obrigatório; descrição, forma e preço opcionais). Conta, prestador e serviço são criados na mesma transação — o perfil público não nasce vazio.
- A categoria do primeiro serviço segue a do negócio; se ainda não existir na taxonomia, é criada.
- Painel (`/painel/*`) exige login; superfície pública não.

Implementação: `backend/src/schemas.ts` (`registerSchema`), `backend/src/users.ts` (`registerUser`), `frontend/src/pages/RegisterPage.tsx`.

## Onboarding de convidado

- Visitante novo passa por `/bem-vindo` → `/onboarding` antes da home.
- Conclusão grava `tempro.guestOnboarded=1` no `localStorage`.
- Rotas de gate: `/bem-vindo`, `/onboarding`. Login/cadastro não dependem desse flag.

Implementação: `frontend/src/lib/guest.ts`, `RequireGuestIntro`.

## Perfil público vs painel

- O **painel é a fonte de verdade** do perfil do prestador logado.
- Home, busca e perfil público leem o catálogo com o perfil editado aplicado por cima (`ProfileProvider` / `useCatalog()`).
- “Ver meu perfil público” mostra os **serviços do painel**, não uma cópia estática do seed — senão a prévia divergiria de “Meus serviços”.
- Descrição curta (`desc`) no perfil: no máximo **90** caracteres.
- Prestador atende em uma ou mais cidades (`city` principal + lista `cities` / `serviceCities`).

Implementação: `frontend/src/context/ProfileProvider.tsx`, `backend/src/schemas.ts` (`profileSchema`).

## Categorias e modos

### Categorias

Taxonomia fixa (ex.: Eletricista, Pintor, Diarista…). Plural oficial alimenta títulos da busca (“Eletricistas”). Lista canônica: `backend/src/data/taxonomy.ts` (espelhada no frontend).

Categorias e cidades dos filtros públicos vêm de `GET /api/meta` — derivadas do que existe no banco, então prestador/cidade novos já entram nos filtros.

### Forma de atendimento

| Nível | Valores |
| --- | --- |
| Prestador | `Atende em domicílio` · `Possui estabelecimento` · `Ambos` |
| Serviço | `Em domicílio` · `Em estabelecimento` · `Ambos` |

Um prestador com modo **Ambos** satisfaz qualquer filtro de forma de atendimento.

## Busca

Implementação canônica: `frontend/src/lib/search.ts` (API replica em `GET /api/providers`).

### Texto (`q`)

- Um único campo cruza nome, categoria, descrição e cidade.
- **Todas** as palavras digitadas precisam aparecer no texto do prestador (AND) — `eletricista joão` restringe, não amplia.
- Matching **case- e accent-insensitive** (`fold`), importante para cidades digitadas de formas diferentes.

### Cidade na consulta

- Se o texto **nomeia uma cidade** do catálogo (ex.: `clima lajeado`), o seletor de cidade é **ignorado**.
- O título do resultado não cita a cidade do seletor nesse caso, para não contradizer a lista.

### Texto × categorias

- Consulta textual e chips de categoria **se substituem** nos dois sentidos: escolher categoria limpa o `q`; buscar texto novo zera categorias.
- Motivo: os dois respondem à mesma pergunta; somados, zeram o resultado quando discordam e rotulam a lista errado.
- Cidade, forma de atendimento e preço são eixos **independentes** e permanecem.

### Categorias (multi)

- Menu soma seleções (`?categoria=Eletricista,Pintor`).
- Nenhuma marcada = todas.
- Título: uma categoria → plural; duas → “A e B”; mais → “A, B e mais N”.

### Cidade sem cobertura

- Empty state distingue “ninguém nesta cidade” de “ninguém bate nos filtros”.
- Sugestões: outras cidades **com** prestadores, priorizando o mesmo UF (sem coordenadas no catálogo — ordenação aproximada, lista limitada).

### URL

Busca mora em `/buscar?...`. Parâmetros no valor padrão são omitidos para o link ficar curto. Na home a busca fica no hero; nas demais páginas, no header — e em `/buscar` é o header que edita o `q` (a barra de filtros só tem categoria, cidade, forma e preço).

## Preço

- Preço **nunca** é persistido só como string de vitrine. Guarda-se `priceType` + `priceAmount`; `displayPrice` / `formatPrice` só renderizam.
- Tipos: `Valor fixo` · `A partir de` · `Por hora` · `Sob consulta`.
- Sem valor (ou tipo “Sob consulta”) → exibe **Sob consulta** — formulário pela metade ainda publica algo verdadeiro.
- Flag `showPrices` em `frontend/src/config.ts` controla se preços aparecem em cards/perfil/painel.

Implementação: `frontend/src/lib/pricing.ts`, `backend/src/pricing.ts`.

## Contato

- Botões de WhatsApp, telefone, Instagram e Facebook saem de `whatsapp` / `phone` / `instagram` / `facebook`.
- Sem dado → toast de confirmação (não quebra a UI). Com dado no painel → abre o destino real.
- WhatsApp normalizado para E.164: nacional 10/11 dígitos ganha `55`. Sem isso o `wa.me` quebra.
- Instagram e Facebook aceitam **nome de usuário** (`@joao` / `joao`) **ou link** da página; o backend normaliza handles simples e preserva URLs complexas (ex.: `profile.php?id=`).

Implementação: `frontend/src/lib/contact.ts`, `backend/src/social.ts`, painel em `MyProfilePage`.

## Mídia e galeria

- Sem logo → monograma tintado.
- Galeria “Trabalhos realizados” só aparece se `showGallery` estiver ligado **e** o prestador tiver `photos`. Molduras vazias em perfil público leem como página quebrada; seção ausente leem como “ainda não postou”.
- Seed: ~2/3 com logo, ~1/3 com portfólio — o layout precisa aguentar os dois extremos.

## Oferta (serviços e produtos)

- O **primeiro serviço é obrigatório no cadastro**; demais serviços e produtos entram pelo painel.
- Serviço publicado exige nome; categoria, modo e preço seguem os enums acima.
- Produtos seguem regra parecida (sem modo de deslocamento; podem ter `photoUrl`).
- Prestador gerencia CRUD no painel; a listagem pública reflete o que está no banco após o bootstrap/refresh.

## Feature flags de produto

| Flag | Efeito |
| --- | --- |
| `showPrices` | Mostra preços na UI pública e no painel |
| `showGallery` | Habilita seção de portfólio quando há fotos |

Arquivo: `frontend/src/config.ts`.
