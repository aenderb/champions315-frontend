# Champions 315 — Frontend

Frontend do **Champions 315**, uma aplicação web para gerenciamento de partidas de futebol com a regra dos 315 — a soma das idades dos jogadores em campo deve totalizar no mínimo **315 anos**.

## Sobre o projeto

O sistema permite que treinadores:

- Cadastrem e gerenciem **equipes** e **jogadores**
- Montem **formações** (esquema tático 4-3-1 com 9 jogadores)
- Acompanhem **partidas em tempo real** com cronômetro e substituições
- Controlem a regra de idade mínima (soma ≥ 315 / média ≥ 35 em caso de expulsão)

## Tech Stack

| Camada       | Tecnologia                    |
| ------------ | ----------------------------- |
| Framework    | React 19 + TypeScript         |
| Build        | Vite 7                        |
| Estilização  | Tailwind CSS 4                |
| Roteamento   | React Router DOM 7            |
| Lint         | ESLint 9 + typescript-eslint  |

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

## Scripts disponíveis

| Comando           | Descrição                                |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Inicia o servidor de desenvolvimento     |
| `npm run build`   | Compila TypeScript e gera build de prod  |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint`    | Executa o ESLint no projeto              |

## Estrutura do projeto

```
src/
├── api/           # Clients HTTP e mappers da API
├── components/    # Componentes reutilizáveis (auth, game, layout, player, team, formation)
├── contexts/      # Context API (Auth, Data)
├── hooks/         # Custom hooks (timer, lineup, matchData)
├── mocks/         # Dados mockados para desenvolvimento
├── pages/         # Páginas da aplicação
├── types/         # Tipagens TypeScript
└── utils/         # Funções utilitárias
```

## Licença

Projeto privado — uso restrito.
