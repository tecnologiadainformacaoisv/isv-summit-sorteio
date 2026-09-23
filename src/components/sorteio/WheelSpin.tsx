import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import type { ParticipantePublico } from '../../types/database'
import { tocarClique } from '../../lib/audio'

interface WheelSpinProps {
  /** Pool de nomes usado para desenhar as fatias da roda. */
  candidatos: ParticipantePublico[]
  /** Vencedor JÁ definido e persistido no banco — a roda só anima até ele. */
  vencedor: ParticipantePublico | null
  /** Dispara quando a roda termina de desacelerar sobre o vencedor. */
  onFinalizar?: () => void
  tamanho?: number
}

// Paleta do Summit ciclada nas fatias — mantém a identidade visual do evento
// mesmo com dezenas de fatias.
const CORES = ['#00ECAA', '#147556', '#0E696C', '#24A66A', '#018D50', '#015158']

// Duração total do giro — 7s dá tempo de suspense sem cansar.
const DURACAO_GIRO_S = 7
// easeOutQuint (aproximação padrão cubic-bezier, ver easings.net): acelera
// rápido no começo e desacelera de forma CONTÍNUA e bem perceptível até o
// fim — ao contrário de uma curva que termina o grosso do giro cedo e só
// "arrasta" o resto (o que parecia rápido demais até quase parar).
const EASE_DESACELERACAO: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Roleta de nomes (estilo Wheel of Names): fatias desenhadas em canvas,
 * giro com desaceleração real parando exatamente no vencedor já sorteado
 * (RNG resolvido em lib/sorteio.ts, antes desta animação começar — este
 * componente é puramente decorativo).
 *
 * Anima via `animate()` do framer-motion sobre um MotionValue (em vez do
 * `useAnimationControls` declarativo) porque precisamos do `onUpdate`
 * chamado a cada frame — é o que permite detectar cada fatia que a roda
 * cruza e tocar um clique por fatia, sincronizado de verdade com a
 * velocidade real do giro (rápido/picotado no início, naturalmente mais
 * espaçado conforme desacelera — não um áudio pré-gravado só esticado).
 */
export function WheelSpin({ candidatos, vencedor, onFinalizar, tamanho = 420 }: WheelSpinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotate = useMotionValue(0)
  const rodouRef = useRef(false)
  const [fatias, setFatias] = useState<ParticipantePublico[]>([])

  // Desenha a roda sempre que a lista de fatias mudar.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || fatias.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = tamanho * dpr
    canvas.height = tamanho * dpr
    ctx.scale(dpr, dpr)

    const raio = tamanho / 2
    const anguloFatia = (2 * Math.PI) / fatias.length
    // Fonte menor quanto mais fatias, pra caber o nome sem estourar a fatia.
    const fonte = Math.max(8, Math.min(15, 260 / fatias.length))

    ctx.clearRect(0, 0, tamanho, tamanho)

    fatias.forEach((pessoa, i) => {
      const inicio = i * anguloFatia - Math.PI / 2
      const fim = inicio + anguloFatia

      ctx.beginPath()
      ctx.moveTo(raio, raio)
      ctx.arc(raio, raio, raio - 4, inicio, fim)
      ctx.closePath()
      ctx.fillStyle = CORES[i % CORES.length]
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Só escreve o nome se a fatia for larga o suficiente pra não virar ruído visual.
      if (anguloFatia > 0.05) {
        ctx.save()
        ctx.translate(raio, raio)
        ctx.rotate(inicio + anguloFatia / 2)
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#ffffff'
        ctx.font = `700 ${fonte}px 'Segoe UI', system-ui, sans-serif`
        const primeiroNome = pessoa.nome.split(' ')[0]
        const maxChars = Math.max(4, Math.floor(anguloFatia * 14))
        const texto =
          primeiroNome.length > maxChars ? `${primeiroNome.slice(0, maxChars - 1)}…` : primeiroNome
        ctx.fillText(texto, raio - 14, 0)
        ctx.restore()
      }
    })
  }, [fatias, tamanho])

  useEffect(() => {
    if (!vencedor || rodouRef.current) return
    rodouRef.current = true

    const pool = candidatos.length > 0 ? candidatos : [vencedor]
    const lista = pool.some((p) => p.id === vencedor.id) ? pool : [...pool, vencedor]
    setFatias(lista)

    const indice = lista.findIndex((p) => p.id === vencedor.id)
    const anguloFatiaGraus = 360 / lista.length
    const centroFatia = indice * anguloFatiaGraus + anguloFatiaGraus / 2
    // Voltas moderadas — muitas voltas fazem o trecho "lento" da desaceleração
    // ainda cobrir muitos graus, disfarçando a sensação de estar devagar.
    const voltas = 5
    const destino = voltas * 360 + (360 - centroFatia)

    let ultimoAngulo = 0

    const controls = animate(rotate, destino, {
      duration: DURACAO_GIRO_S,
      ease: EASE_DESACELERACAO,
      onUpdate: (valorAtual) => {
        // Quantas fronteiras de fatia foram cruzadas desde o último frame —
        // no início do giro pode ser várias de uma vez (alta velocidade).
        const cruzamentosAntes = Math.floor(ultimoAngulo / anguloFatiaGraus)
        const cruzamentosAgora = Math.floor(valorAtual / anguloFatiaGraus)
        const novos = cruzamentosAgora - cruzamentosAntes
        // Limita quantos cliques disparam no mesmo frame pra não estourar o
        // pool de áudio quando a velocidade inicial cruza muitas fatias de uma vez.
        for (let i = 0; i < Math.min(novos, 4); i++) tocarClique()
        ultimoAngulo = valorAtual
      },
      onComplete: () => onFinalizar?.(),
    })

    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vencedor])

  return (
    <div className="relative mx-auto" style={{ width: tamanho, height: tamanho }}>
      {/* Ponteiro fixo, aponta pra dentro da roda a partir do topo */}
      <div
        className="absolute left-1/2 top-[-6px] z-10 -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: '14px solid transparent',
          borderRight: '14px solid transparent',
          borderTop: '22px solid #ffffff',
        }}
      />
      {/*
        overflow: hidden aqui é essencial, não só estético: girando um
        quadrado (o <canvas>), a caixa visual dele em 45°/135° fica maior
        que o lado original (diagonal > lado) — sem cortar isso, o documento
        ganha e perde altura de rolagem a cada 1/4 de volta, fazendo a
        barra de scroll "pular" repetidamente durante o giro inteiro.
      */}
      <div className="h-full w-full overflow-hidden rounded-full shadow-summit">
        <motion.canvas ref={canvasRef} style={{ width: tamanho, height: tamanho, rotate }} />
      </div>
      <div
        className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-summit-ciano bg-white"
        aria-hidden
      />
    </div>
  )
}
