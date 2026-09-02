-- Schema inicial do app de sorteio ISV Summit 2026
create extension if not exists "pgcrypto";

create table setores (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique
);

create table participantes (
  id uuid primary key default gen_random_uuid(),
  sympla_participant_id text unique,   -- ID vindo da Sympla, permite reimportação idempotente
  nome text not null,
  email text,
  setor_id uuid references setores(id),
  setor_texto text,                    -- fallback se a Sympla não trouxer setor estruturado
  tipo text not null default 'convidado' check (tipo in ('colaborador','convidado')),
  elegivel boolean not null default true, -- desqualificação manual (ex: não compareceu ao evento)
  criado_em timestamptz not null default now()
);

create table categorias_premio (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique
);

create table premios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria_id uuid references categorias_premio(id),
  imagem_url text,                     -- URL pública no Supabase Storage (bucket "premios")
  status text not null default 'aberto' check (status in ('aberto','sorteado')),
  ordem integer,
  criado_em timestamptz not null default now()
);

-- Regra de negócio: um prêmio só pode ter UM vencedor definitivo (proteção
-- extra contra clique duplo / retry gravando dois sorteios pro mesmo prêmio).
create table sorteios (
  id uuid primary key default gen_random_uuid(),
  premio_id uuid not null unique references premios(id),
  participante_id uuid not null references participantes(id),
  realizado_em timestamptz not null default now(),
  operador text
);

create index idx_sorteios_participante on sorteios(participante_id);
create index idx_participantes_sympla_id on participantes(sympla_participant_id);
