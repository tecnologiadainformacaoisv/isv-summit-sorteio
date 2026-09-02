/**
 * Tipos que espelham o schema do Supabase (ver db/01_schema.sql).
 * Mantenha em sincronia manualmente até adotarmos `supabase gen types typescript`.
 */

export type TipoParticipante = 'colaborador' | 'convidado'
export type StatusPremio = 'aberto' | 'sorteado'

export interface Setor {
  id: string
  nome: string
}

export interface Participante {
  id: string
  sympla_participant_id: string | null
  nome: string
  email: string | null
  setor_id: string | null
  setor_texto: string | null
  tipo: TipoParticipante
  elegivel: boolean
  criado_em: string
}

/** Formato retornado pela view pública `participantes_publico` (sem e-mail). */
export type ParticipantePublico = Omit<Participante, 'email' | 'sympla_participant_id'>

export interface CategoriaPremio {
  id: string
  nome: string
}

export interface Premio {
  id: string
  nome: string
  categoria_id: string | null
  imagem_url: string | null
  status: StatusPremio
  ordem: number | null
  criado_em: string
}

export interface Sorteio {
  id: string
  premio_id: string
  participante_id: string
  realizado_em: string
  operador: string | null
}

/** Sorteio com dados do vencedor já resolvidos via join, usado nas telas de histórico/revelação. */
export interface SorteioComVencedor extends Sorteio {
  participante: Pick<Participante, 'id' | 'nome' | 'setor_texto'>
}
