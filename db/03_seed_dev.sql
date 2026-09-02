-- Dados fictícios para teste local — NÃO rodar em produção.
-- Inclui propositalmente 2 participantes homônimos (mesmo nome, id e setor
-- diferentes) para validar que a exclusão do pool acontece por ID, nunca por
-- string de nome (ver src/lib/sorteio.ts).

insert into setores (nome) values
  ('Hospital Regional'), ('UPA Central'), ('CAPS Norte'), ('Gestão ISV');

insert into participantes (nome, email, setor_texto, tipo) values
  ('Maria Silva', 'maria.silva.hospital@example.com', 'Hospital Regional', 'colaborador'),
  ('Maria Silva', 'maria.silva.upa@example.com', 'UPA Central', 'colaborador'), -- homônima proposital
  ('João Pereira', 'joao.pereira@example.com', 'CAPS Norte', 'colaborador'),
  ('Ana Costa', 'ana.costa@example.com', 'Gestão ISV', 'convidado'),
  ('Carlos Souza', 'carlos.souza@example.com', 'Hospital Regional', 'colaborador');

insert into categorias_premio (nome) values ('Eletrônicos'), ('Experiências'), ('Vale-presente');

insert into premios (nome, status) values
  ('Fone de ouvido sem fio', 'aberto'),
  ('Vale-presente R$ 200', 'aberto'),
  ('Final de semana em pousada', 'aberto');
