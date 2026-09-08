-- Sorteio atômico: resolve a condição de corrida entre "ler quem está
-- elegível" e "gravar o resultado" (dois cliques rápidos, ou dois prêmios
-- sorteados quase ao mesmo tempo, não devem sortear a mesma pessoa duas
-- vezes). LOCK TABLE serializa chamadas concorrentes dentro da transação
-- implícita da função — a segunda chamada só executa depois que a primeira
-- já commitou o insert em `sorteios`, então já enxerga o participante excluído.
--
-- SECURITY DEFINER: roda com privilégio do dono (bypassa RLS internamente),
-- por isso a policy de INSERT direto em `sorteios` para authenticated foi
-- removida em 02_rls.sql — toda gravação de sorteio passa por aqui.
create or replace function sortear_premio(p_premio_id uuid, p_operador text default null)
returns table (participante_id uuid, participante_nome text, participante_setor text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participante_id uuid;
begin
  lock table sorteios in share row exclusive mode;

  if exists (select 1 from sorteios where premio_id = p_premio_id) then
    raise exception 'Este prêmio já foi sorteado.';
  end if;

  select p.id into v_participante_id
  from participantes p
  where p.elegivel = true
    and not exists (select 1 from sorteios s where s.participante_id = p.id)
  order by random()
  limit 1;

  if v_participante_id is null then
    raise exception 'Não há participantes elegíveis restantes para sorteio.';
  end if;

  insert into sorteios (premio_id, participante_id, operador)
  values (p_premio_id, v_participante_id, p_operador);

  update premios set status = 'sorteado' where id = p_premio_id;

  return query
    select p.id, p.nome, p.setor_texto from participantes p where p.id = v_participante_id;
end;
$$;

grant execute on function sortear_premio(uuid, text) to authenticated;
revoke execute on function sortear_premio(uuid, text) from anon;
