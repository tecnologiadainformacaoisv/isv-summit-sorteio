import { useState } from 'react'
import type { Premio, ParticipantePublico } from '../../types/database'
import { realizarSorteio } from '../../lib/sorteio'
import { SlotReel } from './SlotReel'
import { ConfeteOverlay } from './ConfeteOverlay'
import { VencedorReveal } from './VencedorReveal'
import { Button } from '../ui/Button'

interface SorteioStageProps {
  premio: Premio
  candidatos: ParticipantePublico[]
  onSorteioConcluido?: () => void
}

type Fase = 'aguardando' | 'sorteando' | 'revelado'

/**
 * Orquestra o sorteio de um prêmio: dispara o RNG (persistido no banco antes
 * de animar), controla o SlotReel, e libera confete + revelação quando o
 * reel termina de desacelerar.
 */
export function SorteioStage({ premio, candidatos, onSorteioConcluido }: SorteioStageProps) {
  const [fase, setFase] = useState<Fase>('aguardando')
  const [vencedor, setVencedor] = useState<ParticipantePublico | null>(null)
  const [confeteTrigger, setConfeteTrigger] = useState(0)
  const [erro, setErro] = useState<string | null>(null)
  const [sorteando, setSorteando] = useState(false)

  async function handleSortear() {
    setErro(null)
    setSorteando(true)
    try {
      const ganhador = await realizarSorteio(premio.id)
      setVencedor(ganhador)
      setFase('sorteando')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao sortear.')
    } finally {
      setSorteando(false)
    }
  }

  function handleReelFinalizado() {
    setFase('revelado')
    setConfeteTrigger((v) => v + 1)
    onSorteioConcluido?.()
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-summit-ciano">Prêmio em disputa</p>
        <h2 className="text-3xl font-extrabold text-white">{premio.nome}</h2>
      </div>

      {fase === 'aguardando' && (
        <Button onClick={handleSortear} disabled={sorteando || premio.status === 'sorteado'}>
          {premio.status === 'sorteado' ? 'Prêmio já sorteado' : sorteando ? 'Sorteando…' : 'Sortear'}
        </Button>
      )}

      {fase !== 'aguardando' && (
        <SlotReel candidatos={candidatos} vencedor={vencedor} onFinalizar={handleReelFinalizado} />
      )}

      <VencedorReveal vencedor={vencedor} visivel={fase === 'revelado'} />
      <ConfeteOverlay trigger={confeteTrigger} />

      {erro && <p className="text-sm font-semibold text-red-300">{erro}</p>}
    </div>
  )
}
