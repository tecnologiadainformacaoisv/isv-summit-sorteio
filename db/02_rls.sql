-- Row Level Security: leitura pública para a tela do telão funcionar sem
-- login; escrita restrita a usuários autenticados (equipe em /admin).

alter table setores enable row level security;
alter table participantes enable row level security;
alter table categorias_premio enable row level security;
alter table premios enable row level security;
alter table sorteios enable row level security;

-- View pública de participantes: nunca expõe e-mail nem o ID da Sympla.
-- Nota: por padrão (security_invoker=false), uma view roda com os privilégios
-- do seu owner sobre as tabelas base — como a migration é aplicada pelo role
-- administrador do Supabase (dono da view, isento das próprias policies de
-- `participantes`), a view enxerga todas as linhas e apenas filtra COLUNAS,
-- que é o que queremos (esconder email/sympla_participant_id do anon).
create view participantes_publico as
  select id, nome, setor_id, setor_texto, tipo, elegivel, criado_em
  from participantes;

-- Leitura pública (anon) — necessária para a tela "/" (sem login).
create policy "leitura publica setores" on setores for select using (true);
create policy "leitura publica categorias" on categorias_premio for select using (true);
create policy "leitura publica premios" on premios for select using (true);
create policy "leitura publica sorteios" on sorteios for select using (true);
-- `participantes` (tabela base) NÃO tem policy de select para anon: a tela
-- pública deve consultar sempre `participantes_publico`, que já é uma view
-- sem RLS própria (herda da query, mas não expõe e-mail/sympla_id na saída).

-- Escrita — somente usuários autenticados (login em /admin).
create policy "escrita autenticada setores" on setores for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "escrita autenticada participantes" on participantes for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "escrita autenticada categorias" on categorias_premio for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "escrita autenticada premios" on premios for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
-- `sorteios` NÃO tem policy de escrita para authenticated (de propósito): a
-- única forma de gravar um sorteio é pela função sortear_premio() (ver
-- db/04_funcoes.sql), que é SECURITY DEFINER e faz a leitura+exclusão+insert
-- de forma atômica. Se a API tivesse insert/update/delete diretos aqui,
-- (a) reabriria a condição de corrida que a função resolve, e (b) qualquer
-- usuário autenticado poderia DELETE um sorteio já feito e devolver o
-- "ganhador" ao pool de elegíveis, violando a regra de negócio.

-- Leitura pública da view (participantes_publico não tem RLS própria, mas
-- precisa que o usuário anon tenha permissão de SELECT no objeto).
grant select on participantes_publico to anon, authenticated;
