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
    <div className="flex flex-1 flex-col items-center gap-4 text-center">
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

      {/* flex-1 + w-full: dá pro WheelSpin todo o espaço restante da tela (até
          a borda de baixo) pra ele medir e decidir seu próprio tamanho —
          ver WheelSpin.tsx. */}
      {fase !== 'aguardando' && (
        <div className="flex w-full flex-1 flex-col items-center">
          <WheelSpin candidatos={candidatos} vencedor={vencedor} onFinalizar={handleRoletaFinalizada} />
        </div>
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

      {/* Depois de fechar o overlay, deixa um resumo discreto e fixo no canto
          superior esquerdo (útil se quiser reabrir o destaque ou só conferir
          sem tela cheia) — acima do botão de reset, mesmo canto. */}
      {fase === 'revelado' && !mostrarRevelacao && vencedor && (
        <Button
          variant="summit-ghost"
          size="sm"
          onClick={() => setMostrarRevelacao(true)}
          className="fixed left-4 top-20 z-20"
        >
          <Trophy className="text-amber-300" /> {vencedor.nome} — ver revelação de novo
        </Button>
      )}
    </div>
  )
}
