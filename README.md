# Champions 315 — Frontend

Frontend do **Champions 315**, uma aplicação web para gerenciamento de partidas de futebol com a regra dos 315 — a soma das idades dos jogadores em campo deve totalizar no mínimo **315 anos**.

## Sobre o projeto

O sistema permite que treinadores:

- Cadastrem e gerenciem **equipes** (com escudo, cor, patrocinador e logo)
- Cadastrem e gerenciem **jogadores** (com foto, posição, função tática e data de nascimento)
- Montem **formações** (esquema tático fixo **4-3-1** com 9 jogadores titulares)
- Acompanhem **partidas em tempo real** com cronômetro por período, substituições e cartões
- Controlem a **regra de idade mínima** (soma ≥ 315 / média ≥ 35 em caso de expulsão)
- Recebam **alertas visuais** quando a soma/média de idades está abaixo do limite
- Confirmem substituições que fariam a soma cair abaixo de 315
- Gerenciem **expulsões** com fluxo especial de substituição obrigatória do goleiro
- Registrem **resultados de partidas** com placar, cartões e observações

## Regras de negócio

| Regra | Valor |
| --- | --- |
| Formação | 4-3-1 (1 GK + 4 DEF + 3 MID + 1 FWD = 9 titulares) |
| Soma mínima de idades | 315 anos |
| Média mínima (com expulsão) | 35 anos |
| Cálculo de idade | Ano atual − Ano de nascimento |

## Tech Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | React 19 + TypeScript 5 |
| Build | Vite 7 |
| Estilização | Tailwind CSS 4 |
| Roteamento | React Router DOM 7 |
| Lint | ESLint 9 + typescript-eslint |
| Deploy | Vercel (com proxy reverso para API) |
| Backend | API REST em servidor separado (Render) |

## Autenticação

- Autenticação via **cookies httpOnly** (access token + refresh token)
- Proxy reverso configurado no Vercel (`/api/*` → backend) para manter cookies same-origin
- Refresh automático de token em caso de expiração (401)
- Evento `auth:expired` para reabrir tela de login quando a sessão expira

## Pré-requisitos

- **Node.js** ≥ 18
- **npm** (ou outro gerenciador de pacotes)

## Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd champions315-frontend

# Instale as dependências
npm install
```

## Variáveis de ambiente

| Variável | Descrição | Padrão |
| --- | --- | --- |
| `VITE_API_URL` | URL base da API | `http://localhost:3333/api` |

Crie um arquivo `.env` na raiz:

```env
VITE_API_URL=/api
```

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Compila TypeScript e gera build de produção |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Executa o ESLint no projeto |

## Estrutura do projeto

```
src/
├── api/           # Client HTTP (fetchWithAuth), endpoints e mappers
│   ├── client.ts      # HTTP client com interceptor de 401 e refresh
│   ├── authApi.ts     # Login, registro, refresh, logout
│   ├── teamApi.ts     # CRUD de equipes
│   ├── playerApi.ts   # CRUD de jogadores
│   ├── lineupApi.ts   # CRUD de escalações
│   ├── matchApi.ts    # CRUD de partidas
│   └── mappers.ts     # Conversão ApiTeam/ApiPlayer → tipos internos
├── components/
│   ├── auth/          # LoginPopup, RegisterPopup, SuccessPopup
│   ├── formation/     # FormationBuilder (montagem de escalação)
│   ├── game/          # SoccerLineup, SoccerField, InfoBar, BenchList, GameTimer, PlayerBadge
│   ├── layout/        # Header, Footer
│   ├── player/        # PlayerFormPopup
│   └── team/          # TeamFormPopup
├── contexts/
│   ├── AuthContext.tsx # Estado global de autenticação
│   └── DataContext.tsx # CRUD de equipes, jogadores, escalações e partidas
├── hooks/
│   ├── useGameTimer.ts # Cronômetro com períodos e pausas
│   └── useLineup.ts    # Lógica de substituições, expulsões e cartões
├── pages/             # HomePage, TeamsPage, PlayersPage, FormationsPage, GamePage, MatchesPage
├── types/
│   ├── api.ts         # Tipos da API (snake_case)
│   └── index.ts       # Tipos internos (camelCase)
└── utils/
    ├── age.ts         # Cálculo de idade (ano)
    ├── color.ts       # Utilitários de cor
    └── image.ts       # Conversão de imagem para base64
```

## Deploy

O frontend é implantado no **Vercel** com as seguintes rewrites configuradas em `vercel.json`:

- `/api/*` → proxy para o backend (Render)
- `/*` → SPA fallback para `index.html`

## Licença

Projeto privado — uso restrito.
