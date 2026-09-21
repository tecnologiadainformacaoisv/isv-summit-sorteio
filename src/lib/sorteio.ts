import { supabase } from './supabase'
import type { ParticipantePublico } from '../types/database'

/**
 * O erro que o supabase-js devolve (`PostgrestError`) é um objeto plano, NÃO
 * uma instância de `Error` — `throw error` direto faz qualquer `catch (e) {
 * e instanceof Error ? ... : 'mensagem genérica' }` (padrão usado na UI toda)
 * cair sempre no fallback genérico, escondendo a mensagem real. Sempre
 * relançar como Error de verdade.
 */
function lancar(erro: { message: string } | null): asserts erro is null {
  if (erro) throw new Error(erro.message)
}

/**
 * Regra de exclusão do sorteio: um participante SEMPRE sai do pool pelo seu `id`
 * (UUID), nunca por comparação de nome — a lista pode ter homônimos reais
 * (duas pessoas diferentes com o mesmo nome cadastrado na Sympla).
 *
 * Usada só para EXIBIÇÃO (contador de elegíveis, fatias da roleta) — não é
 * mais a fonte de verdade do sorteio em si. O RNG real acontece dentro da
 * função `sortear_premio` no banco (ver db/04_funcoes.sql), atomicamente,
 * pra não abrir uma condição de corrida entre "ler quem está elegível" e
 * "gravar o resultado" (dois cliques rápidos não podem sortear a mesma
 * pessoa duas vezes).
 */
export async function buscarParticipantesElegiveis(): Promise<ParticipantePublico[]> {
  const { data: sorteados, error: erroSorteios } = await supabase
    .from('sorteios')
    .select('participante_id')

  lancar(erroSorteios)

  const idsJaSorteados = (sorteados ?? []).map((s) => s.participante_id)

  let query = supabase
    .from('participantes_publico')
    .select('id, nome, setor_id, setor_texto, tipo, elegivel, criado_em')
    .eq('elegivel', true)

  if (idsJaSorteados.length > 0) {
    query = query.not('id', 'in', `(${idsJaSorteados.join(',')})`)
  }

  const { data, error } = await query
  lancar(error)
  return data ?? []
}

interface ResultadoSorteioRpc {
  participante_id: string
  participante_nome: string
  participante_setor: string | null
}

/**
 * Sorteia e grava o resultado atomicamente via RPC (`sortear_premio`) —
 * leitura de elegíveis + exclusão + insert acontecem numa única transação
 * no banco, travando `sorteios` durante a operação. Isso é o que garante
 * que a regra "quem já ganhou não é sorteado de novo" vale mesmo sob
 * cliques duplos ou dois sorteios disparados quase ao mesmo tempo.
 */
export async function realizarSorteio(premioId: string, operador?: string): Promise<ParticipantePublico> {
  const { data, error } = await supabase.rpc('sortear_premio', {
    p_premio_id: premioId,
    p_operador: operador ?? null,
  })

  lancar(error)

  const linha = (data as ResultadoSorteioRpc[] | null)?.[0]
  if (!linha) throw new Error('Sorteio não retornou um vencedor.')

  return {
    id: linha.participante_id,
    nome: linha.participante_nome,
    setor_texto: linha.participante_setor,
    setor_id: null,
    tipo: 'convidado',
    elegivel: true,
    criado_em: new Date().toISOString(),
  }
}

/**
 * Apaga TODOS os sorteios feitos e reabre todos os prêmios — usado durante
 * testes/ensaios, para reiniciar o pool sem precisar mexer no banco na mão.
 * Participantes não são afetados. Irreversível: quem chama a UI deve
 * confirmar com o operador antes (ver botão de reset em SorteioPage.tsx).
 */
export async function resetarSorteios(): Promise<void> {
  const { error } = await supabase.rpc('resetar_sorteios')
  lancar(error)
}
