import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import type { ParticipantePublico } from '../../types/database'

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

// Única fonte da verdade pra duração do giro — usada tanto na transição do
// framer-motion quanto no timeout que libera onFinalizar, pra nunca dessincronizar.
const DURACAO_GIRO_MS = 4500

/**
 * Roleta de nomes (estilo Wheel of Names): fatias desenhadas em canvas,
 * giro com desaceleração parando exatamente no vencedor já sorteado (RNG
 * resolvido em lib/sorteio.ts, antes desta animação começar — este
 * componente é puramente decorativo, igual ao antigo SlotReel).
 */
export function WheelSpin({ candidatos, vencedor, onFinalizar, tamanho = 420 }: WheelSpinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controls = useAnimationControls()
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
    // O ponteiro fica fixo no topo (0°). A roda precisa girar até o centro
    // da fatia vencedora parar embaixo do ponteiro, mais várias voltas completas.
    const voltas = 6
    const destino = voltas * 360 + (360 - centroFatia)

    controls.set({ rotate: 0 })
    controls.start({
      rotate: destino,
      transition: { duration: DURACAO_GIRO_MS / 1000, ease: [0.12, 0.8, 0.15, 1] },
    })
    // Usa um timeout (não onComplete do framer-motion) pra não depender do
    // callback disparar exatamente junto do fim visual — mas com a MESMA
    // constante da duração da transição acima, nunca hardcoded duas vezes.
    const timeout = setTimeout(() => onFinalizar?.(), DURACAO_GIRO_MS)
    return () => clearTimeout(timeout)
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
      <motion.canvas
        ref={canvasRef}
        animate={controls}
        style={{ width: tamanho, height: tamanho, borderRadius: '50%' }}
        className="shadow-summit"
      />
      <div
        className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-summit-ciano bg-white"
        aria-hidden
      />
    </div>
  )
}
