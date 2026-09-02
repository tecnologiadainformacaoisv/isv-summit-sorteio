import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

interface ConfeteOverlayProps {
  /** Muda de valor (ex: incrementa) a cada vez que deve disparar uma nova explosão. */
  trigger: number
}

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

    const duracao = 2500
    const fim = Date.now() + duracao

    const disparar = () => {
      confetti({
        particleCount: 60,
        spread: 100,
        startVelocity: 45,
        origin: { x: Math.random() * 0.6 + 0.2, y: 0.3 },
        colors: ['#00ECAA', '#24A66A', '#9FB8B2', '#ffffff'],
      })
      if (Date.now() < fim) requestAnimationFrame(disparar)
    }

    disparar()
  }, [trigger])

  return null
}
