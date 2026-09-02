import { useCallback, useEffect, useState } from 'react'
import { buscarParticipantesElegiveis } from '../lib/sorteio'
import type { ParticipantePublico } from '../types/database'

/** Pool de participantes que ainda podem ser sorteados (já exclui quem já ganhou, por ID). */
export function useParticipantesElegiveis() {
  const [elegiveis, setElegiveis] = useState<ParticipantePublico[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const recarregar = useCallback(async () => {
    setCarregando(true)
    try {
      setElegiveis(await buscarParticipantesElegiveis())
      setErro(null)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar participantes elegíveis.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  return { elegiveis, carregando, erro, recarregar }
}
