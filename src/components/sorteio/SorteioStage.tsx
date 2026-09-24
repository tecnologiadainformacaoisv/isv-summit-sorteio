import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Ticket } from 'lucide-react'
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
 * em destaque quando ela termina de desacelerar.
 *
 * A roleta abre num overlay de tela cheia (em vez de inline na página) — sem
 * isso o operador precisava rolar a tela pra ver o giro, o que trava o ritmo
 * durante a apresentação ao vivo. Fecha só quando o operador confirma, com
 * um botão explícito de voltar pra tela de seleção de prêmios (carrossel).
 */
export function SorteioStage({ premio, candidatos, onSorteioConcluido }: SorteioStageProps) {
  const [fase, setFase] = useState<Fase>('aguardando')
  const [vencedor, setVencedor] = useState<ParticipantePublico | null>(null)
  const [confeteTrigger, setConfeteTrigger] = useState(0)
  const [mostrarRevelacao, setMostrarRevelacao] = useState(false)
  const [overlayAberto, setOverlayAberto] = useState(false)
  const [sorteando, setSorteando] = useState(false)
  const [tamanhoRoleta, setTamanhoRoleta] = useState(420)

  async function handleSortear() {
    setSorteando(true)
    try {
      const ganhador = await realizarSorteio(premio.id)
      setVencedor(ganhador)
      setFase('sorteando')
      setOverlayAberto(true)
      // Calcula o tamanho BASE da roleta (medição única no clique, não fica
      // observando resize — é isso que causava os problemas de scroll
      // "pulando" nas tentativas antigas). Como é meia-lua (só 52% da altura
      // do "lado" fica visível), o mesmo espaço vertical permite um raio bem
      // maior do que um círculo inteiro. ZOOM_MAXIMO baixo (1.8, não mais
      // 2.8) = reserva menos espaço pro crescimento do zoom e permite
      // começar com um raio bem maior já de cara — fatias mais largas em
      // pixels desde o início, não só no fim do giro.
      const ZOOM_MAXIMO = 1.8
      // Precisa bater com o mesmo fator usado em WheelSpin.tsx (alturaJanela).
      const ALTURA_VISIVEL = 0.52
      const larguraDisponivel = (window.innerWidth * 0.95) / ZOOM_MAXIMO
      const alturaDisponivel = (window.innerHeight * 0.92) / (ZOOM_MAXIMO * ALTURA_VISIVEL)
      setTamanhoRoleta(Math.max(320, Math.min(larguraDisponivel, alturaDisponivel, 760)))
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

      <Button
        variant="summit"
        size="lg"
        onClick={handleSortear}
        disabled={sorteando || premio.status === 'sorteado'}
      >
        <Ticket /> {premio.status === 'sorteado' ? 'Prêmio já sorteado' : sorteando ? 'Sorteando…' : 'Sortear'}
      </Button>

      <AnimatePresence>
        {overlayAberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 flex flex-col items-center gap-6 overflow-y-auto overflow-x-hidden bg-summit-gradient px-4 py-8"
          >
            {/* justify-start (não center): com scroll, conteúdo centralizado
                que cresce pode ficar inacessível pela rolagem na borda de
                cima — alinhado ao topo garante que dá sempre pra rolar até
                o fim e ver o botão que a roda empurrou pra baixo. */}
            <div className="flex min-h-full w-full flex-col items-center gap-8 pt-2">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-summit-ciano">Prêmio em disputa</p>
                <h2 className="text-3xl font-extrabold text-white">{premio.nome}</h2>
              </div>

              <WheelSpin
                candidatos={candidatos}
                vencedor={vencedor}
                onFinalizar={handleRoletaFinalizada}
                tamanho={tamanhoRoleta}
              />

              {/* Só aparece depois que a revelação em destaque foi fechada —
                  evita fechar tudo sem o operador ter confirmado o nome. */}
              {fase === 'revelado' && !mostrarRevelacao && (
                <Button variant="summit-outline" onClick={() => setOverlayAberto(false)}>
                  <ArrowLeft /> Voltar para os prêmios
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <VencedorReveal
        vencedor={vencedor}
        premioNome={premio.nome}
        visivel={fase === 'revelado' && mostrarRevelacao}
        onFechar={() => setMostrarRevelacao(false)}
      />
      <ConfeteOverlay trigger={confeteTrigger} />
    </div>
  )
}
