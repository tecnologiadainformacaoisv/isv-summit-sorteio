# ISV Summit 2026 — App de Sorteio

App de sorteio de prêmios para o ISV Summit 2026, com identidade visual própria do evento,
participantes importados da Sympla e revelação de vencedor com efeito slot, confete e som.

Detalhes de arquitetura, regras de negócio e pendências: ver [CLAUDE.md](./CLAUDE.md).

## Setup local

```bash
npm install
cp .env.example .env   # preencher VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

## Banco de dados (Supabase)

```bash
DATABASE_URL="postgres://...conexao-direta-5432" npm run db:migrar
# ou, incluindo dados fictícios de teste:
DATABASE_URL="postgres://...conexao-direta-5432" npm run db:migrar:seed
```

## Estrutura

- `/` — tela pública do telão (sorteio ao vivo)
- `/admin` — gestão (login necessário): participantes, prêmios, histórico de vencedores, importação Sympla
- `db/` — schema SQL numerado (aplicado via `scripts/migrar.mjs`)
- `supabase/functions/importar-sympla` — Edge Function que busca participantes na Sympla (token nunca exposto ao frontend)
