# ISV Summit 2026 — App de Sorteio

> Arquivo de contexto para Claude Code. Leia este arquivo inteiro antes de qualquer tarefa.

---

## Visão geral do projeto

App de sorteio de prêmios para o evento presencial ISV Summit 2026 (25/09, Fortaleza-CE). Operado
por um membro da equipe de TI numa tela projetada (telão) durante o evento: participantes vêm do
cadastro da Sympla, os prêmios são sorteados um a um com uma roleta de nomes (estilo Wheel of Names),
confete e som na revelação. Quem já ganhou não é sorteado de novo.

**Objetivo:** substituir ferramentas genéricas de sorteio (Wheel of Names etc.) por uma aplicação com
a identidade visual própria do Summit, integrada à lista real de inscritos do evento.

**Stack:** Vite + React + TypeScript, Tailwind CSS v4, Supabase (Postgres + Storage + Auth + Edge
Functions), framer-motion, canvas-confetti, use-sound, react-router-dom.

---

## Ecossistema (ISV / Desenvolvimento)

Este projeto faz parte da pasta `Desenvolvimento/`, que reúne os sistemas do
**Instituto São Vicente (ISV)**. Padrões compartilhados ficam em:

- **Comandos e agentes:** `~/.claude/` — `/atualizar`, `/encerrar`, agente `revisor`
- **Assets/estilos/componentes comuns (padrão genérico do instituto):** `../shared/`
- **Referência de comandos:** `../COMANDOS-CLAUDE.md`

> ⚠️ **NÃO ler nem indexar as pastas dos outros projetos** (`projeto-*`, `pessoal-*`) a menos que
> explicitamente solicitado.

**Importante:** este projeto usa a identidade visual do **evento ISV Summit 2026**
(`src/styles/global.css`, tokens `summit-*`), NÃO a paleta genérica azul-marinho de
`shared/styles/instituto.css`. Não misturar as duas paletas.

---

## Regras de negócio que não devem ser alteradas sem perguntar

- **Exclusão de ganhador é sempre por `participante.id` (UUID), nunca por comparação de nome.** A
  lista de participantes pode ter homônimos reais (duas pessoas diferentes, mesmo nome) — comparar
  por string de nome excluiria a pessoa errada. Ver `src/lib/sorteio.ts`.
- **O RNG do sorteio roda no clique do operador e persiste no banco (`sorteios`) antes de qualquer
  animação.** O `WheelSpin` (roleta) é puramente visual — recebe o vencedor já definido e gira até
  parar nele. Nunca decidir o vencedor dentro do componente de animação.
- **Modelo de sorteio é roleta (`WheelSpin.tsx`), não mais o slot/scroll antigo.** Trocado a pedido do
  usuário para replicar a mecânica do Wheel of Names. Com pools grandes (50+ participantes) as fatias
  ficam finas e o texto pequeno — trade-off conhecido e aceito.
- **O vencedor é exibido com nome + setor/unidade**, para desambiguar homônimos na tela.
- **Nenhum segredo (token da Sympla, `SUPABASE_SERVICE_ROLE_KEY`) pode ir para o bundle do
  frontend/Vite.** Esses valores só existem como Supabase secrets da Edge Function
  `supabase/functions/importar-sympla`.

---

## Pendências conhecidas

- **Token e Event ID da Sympla ainda não foram gerados.** A importação real (`/admin/importacao`)
  não vai funcionar até isso ser configurado via `supabase secrets set SYMPLA_API_TOKEN=... SYMPLA_EVENT_ID=...`.
  Até lá, usar `db/03_seed_dev.sql` para popular dados de teste.
- Nenhum arquivo de áudio de vitória foi adicionado ainda (`src/lib/audio.ts` fica mudo por padrão até
  um arquivo ser colocado em `src/assets/sons/`).
- O nome exato do campo customizado de "setor" no formulário de inscrição da Sympla ainda não foi
  confirmado — ajustar `SETOR_CAMPO_CUSTOMIZADO` em `supabase/functions/importar-sympla/index.ts`
  quando tivermos acesso real à API.

---

## Padrões de desenvolvimento

- Versionamento: **Semantic Versioning** (`MAJOR.MINOR.PATCH`); `MAJOR` = 0 em pré-produção.
- Commits no padrão **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
- Segurança de dados via **RLS do Postgres** (ver `db/02_rls.sql`) — leitura pública restrita a colunas
  não sensíveis (`participantes_publico`), escrita só para usuários autenticados.
- Rotas: `/` = tela do telão; `/admin/*` = gestão. **Ambas exigem login** (`RequireAuth`) — gravar um
  sorteio é escrita no banco, e RLS só permite escrita autenticada, então o telão não pode ficar aberto.

---

## Contexto organizacional

- **Organização:** Instituto São Vicente (ISV)
- **Responsável de TI:** Henrique (TI — ISV)
- **Evento:** ISV Summit 2026, 3ª edição, 25/09/2026, Afago Mareiro Hotel, Fortaleza-CE
- **Repositório:** GitHub, conta `tecnologiadainformacaoisv`, `isv-summit-sorteio`
