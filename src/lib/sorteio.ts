import { supabase } from './supabase'
import type { ParticipantePublico } from '../types/database'

/**
 * Regra de exclusão do sorteio: um participante SEMPRE sai do pool pelo seu `id`
 * (UUID), nunca por comparação de nome — a lista pode ter homônimos reais
 * (duas pessoas diferentes com o mesmo nome cadastrado na Sympla).
 */
export async function buscarParticipantesElegiveis(): Promise<ParticipantePublico[]> {
  const { data: sorteados, error: erroSorteios } = await supabase
    .from('sorteios')
    .select('participante_id')

  if (erroSorteios) throw erroSorteios

  const idsJaSorteados = (sorteados ?? []).map((s) => s.participante_id)

  let query = supabase
    .from('participantes_publico')
    .select('id, nome, setor_id, setor_texto, tipo, elegivel, criado_em')
    .eq('elegivel', true)

  if (idsJaSorteados.length > 0) {
    query = query.not('id', 'in', `(${idsJaSorteados.join(',')})`)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

/** Escolhe um vencedor aleatório dentre os elegíveis usando o RNG do navegador. */
export function sortearVencedor(elegiveis: ParticipantePublico[]): ParticipantePublico {
  if (elegiveis.length === 0) {
    throw new Error('Não há participantes elegíveis restantes para sorteio.')
  }
  const indice = Math.floor(Math.random() * elegiveis.length)
  return elegiveis[indice]
}

/**
 * Grava o resultado do sorteio no banco ANTES de qualquer animação.
 * A UI (SlotReel) é só visual: recebe o vencedor já definido e anima até parar nele.
 * `sorteios.premio_id` é UNIQUE — um clique duplo/retry falha aqui em vez de
 * gravar dois vencedores para o mesmo prêmio.
 */
export async function registrarSorteio(premioId: string, participanteId: string, operador?: string) {
  const { data, error } = await supabase
    .from('sorteios')
    .insert({ premio_id: premioId, participante_id: participanteId, operador: operador ?? null })
    .select()
    .single()

  if (error) throw error

  await supabase.from('premios').update({ status: 'sorteado' }).eq('id', premioId)

  return data
}

/** Fluxo completo: busca elegíveis, sorteia e persiste — usado pelo clique "Sortear" do operador. */
export async function realizarSorteio(premioId: string, operador?: string) {
  const elegiveis = await buscarParticipantesElegiveis()
  const vencedor = sortearVencedor(elegiveis)
  await registrarSorteio(premioId, vencedor.id, operador)
  return vencedor
}
