import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import type { ParticipantePublico } from '../../types/database'

interface SlotReelProps {
  /** Pool de nomes usado só para preencher a rolagem visual (embaralhado, decorativo). */
  candidatos: ParticipantePublico[]
  /** Vencedor JÁ definido e persistido no banco — o reel só anima até parar nele. */
  vencedor: ParticipantePublico | null
  /** Dispara quando a animação termina de desacelerar sobre o vencedor. */
  onFinalizar?: () => void
  altura?: number
}

const ALTURA_ITEM = 88

/**
 * Efeito "slot/caça-níquel": uma coluna de nomes rola rápido e desacelera até
 * parar exatamente no vencedor já sorteado (RNG resolvido em lib/sorteio.ts,
 * antes desta animação começar — este componente é puramente decorativo).
 */
export function SlotReel({ candidatos, vencedor, onFinalizar, altura = ALTURA_ITEM * 3 }: SlotReelProps) {
  const controls = useAnimationControls()
  const [fita, setFita] = useState<ParticipantePublico[]>([])
  const rodouRef = useRef(false)

  useEffect(() => {
    if (!vencedor || rodouRef.current) return
    rodouRef.current = true

    const pool = candidatos.length > 0 ? candidatos : [vencedor]
    const embaralhados = [...pool].sort(() => Math.random() - 0.5)
    // Repete o pool embaralhado várias vezes para dar sensação de rolagem longa,
    // e garante que o vencedor seja o último item da fita.
    const voltas = 4
    const fitaCompleta: ParticipantePublico[] = []
    for (let i = 0; i < voltas; i++) fitaCompleta.push(...embaralhados)
    fitaCompleta.push(vencedor)
    setFita(fitaCompleta)

    const centroVencedor = (fitaCompleta.length - 1) * ALTURA_ITEM + ALTURA_ITEM / 2
    const distanciaFinal = centroVencedor - altura / 2
    controls.set({ y: 0 })
    controls
      .start({
        y: -distanciaFinal,
        transition: { duration: 4.2, ease: [0.12, 0.8, 0.15, 1] },
      })
      .then(() => onFinalizar?.())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vencedor])

  return (
    <div
      className="relative mx-auto w-full max-w-md overflow-hidden rounded-summit bg-black/30"
      style={{ height: altura }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/3 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px -translate-y-1/2 bg-summit-ciano/60" />

      <motion.div animate={controls}>
        {fita.map((pessoa, i) => (
          <div
            key={`${pessoa.id}-${i}`}
            className="flex flex-col items-center justify-center px-4 text-center"
            style={{ height: ALTURA_ITEM }}
          >
            <span className="text-xl font-extrabold text-white">{pessoa.nome}</span>
            {pessoa.setor_texto && <span className="text-xs text-white/60">{pessoa.setor_texto}</span>}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
