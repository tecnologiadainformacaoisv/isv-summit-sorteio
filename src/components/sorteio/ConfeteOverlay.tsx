import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

interface ConfeteOverlayProps {
  /** Muda de valor (ex: incrementa) a cada vez que deve disparar uma nova explosão. */
  trigger: number
}

// Rajadas espaçadas (não uma a cada frame) — muito mais leve, mesmo efeito visual.
const RAJADAS = 4
const INTERVALO_MS = 220
const PARTICULAS_POR_RAJADA = 35

/**
 * Overlay de confete usando canvas-confetti direto (não o wrapper React) para
 * controlar com precisão o instante do disparo, sincronizado com o áudio de
 * vitória em VencedorReveal.
 */
export function ConfeteOverlay({ trigger }: ConfeteOverlayProps) {
  const primeiraRenderizacao = useRef(true)

  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false
      return
    }

    // Respeita quem prefere menos animação na tela (acessibilidade).
    const reduzMovimento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduzMovimento) return

    const timeouts: ReturnType<typeof setTimeout>[] = []

    for (let i = 0; i < RAJADAS; i++) {
      const timeout = setTimeout(() => {
        confetti({
          particleCount: PARTICULAS_POR_RAJADA,
          spread: 100,
          startVelocity: 45,
          ticks: 130,
          origin: { x: Math.random() * 0.6 + 0.2, y: 0.3 },
          colors: ['#00ECAA', '#24A66A', '#9FB8B2', '#ffffff'],
        })
      }, i * INTERVALO_MS)
      timeouts.push(timeout)
    }

    return () => timeouts.forEach(clearTimeout)
  }, [trigger])

  return null
}
