import { useState } from 'react'
import { Ticket, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import type { Premio, ParticipantePublico } from '../../types/database'
import { realizarSorteio } from '../../lib/sorteio'
import { WheelSpin } from './WheelSpin'
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
 * de animar), controla a roleta (WheelSpin), e libera confete + revelação
 * em destaque (overlay de tela cheia) quando ela termina de desacelerar.
 */
export function SorteioStage({ premio, candidatos, onSorteioConcluido }: SorteioStageProps) {
  const [fase, setFase] = useState<Fase>('aguardando')
  const [vencedor, setVencedor] = useState<ParticipantePublico | null>(null)
  const [confeteTrigger, setConfeteTrigger] = useState(0)
  const [mostrarRevelacao, setMostrarRevelacao] = useState(false)
  const [sorteando, setSorteando] = useState(false)

  async function handleSortear() {
    setSorteando(true)
    try {
      const ganhador = await realizarSorteio(premio.id)
      setVencedor(ganhador)
      setFase('sorteando')
    } catch (e) {
      toast.error('Erro ao sortear', { description: e instanceof Error ? e.message : undefined })
    } finally {
      setSorteando(false)
    }
  }

  function handleRoletaFinalizada() {
    setFase('revelado')
    setMostrarRevelacao(true)
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
        <Button
          variant="summit"
          size="lg"
          onClick={handleSortear}
          disabled={sorteando || premio.status === 'sorteado'}
        >
          <Ticket /> {premio.status === 'sorteado' ? 'Prêmio já sorteado' : sorteando ? 'Sorteando…' : 'Sortear'}
        </Button>
      )}

      {fase !== 'aguardando' && (
        <WheelSpin candidatos={candidatos} vencedor={vencedor} onFinalizar={handleRoletaFinalizada} />
      )}

      {/* Overlay em destaque, sobre a roleta — some ao clicar "Continuar", mas o
          resultado continua registrado (fase permanece 'revelado' por baixo). */}
      <VencedorReveal
        vencedor={vencedor}
        premioNome={premio.nome}
        visivel={fase === 'revelado' && mostrarRevelacao}
        onFechar={() => setMostrarRevelacao(false)}
      />
      <ConfeteOverlay trigger={confeteTrigger} />

      {/* Depois de fechar o overlay, deixa um resumo discreto na própria tela
          (útil se quiser reabrir o destaque ou só conferir sem tela cheia). */}
      {fase === 'revelado' && !mostrarRevelacao && vencedor && (
        <Button variant="summit-ghost" onClick={() => setMostrarRevelacao(true)}>
          <Trophy className="text-amber-300" /> {vencedor.nome} — ver revelação de novo
        </Button>
      )}
    </div>
  )
}
