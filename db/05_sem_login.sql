-- Remove a exigência de login (decisão de negócio: acesso mais simples pra
-- diretoria, sem fricção de autenticação). ATENÇÃO: isso significa que
-- QUALQUER PESSOA com o link do site pode sortear prêmios, editar/excluir
-- participantes e prêmios, e resetar sorteios — não só quem organiza o
-- evento. Reverter (restaurar exigência de login) significa desfazer este
-- arquivo e trazer de volta as telas de auth removidas no frontend
-- (ver histórico do git antes deste commit).

-- Funções de sorteio: liberadas pra anon também (antes só authenticated)
grant execute on function sortear_premio(uuid, text) to anon;
grant execute on function resetar_sorteios() to anon;

-- Tabelas: escrita liberada pra qualquer um (antes exigia authenticated)
drop policy if exists "escrita autenticada setores" on setores;
create policy "escrita livre setores" on setores for all using (true) with check (true);

drop policy if exists "escrita autenticada participantes" on participantes;
create policy "escrita livre participantes" on participantes for all using (true) with check (true);

drop policy if exists "escrita autenticada categorias" on categorias_premio;
create policy "escrita livre categorias" on categorias_premio for all using (true) with check (true);

drop policy if exists "escrita autenticada premios" on premios;
create policy "escrita livre premios" on premios for all using (true) with check (true);

-- Storage (upload de imagem de prêmio): liberado pra qualquer um
drop policy if exists "escrita autenticada bucket premios" on storage.objects;
create policy "escrita livre bucket premios" on storage.objects for all
  using (bucket_id = 'premios') with check (bucket_id = 'premios');
