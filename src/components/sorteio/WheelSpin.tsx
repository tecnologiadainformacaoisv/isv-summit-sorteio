import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import type { ParticipantePublico } from '../../types/database'
import { tocarClique } from '../../lib/audio'

interface WheelSpinProps {
  /** Pool de nomes usado para desenhar as fatias da roda — todos participam visualmente. */
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

// Duração total do giro — 8,5s dá tempo de suspense e de o zoom (ver abaixo)
// ficar perceptível sem parecer abrupto.
const DURACAO_GIRO_S = 8.5
// easeOutCirc: acelera rápido no começo e desacelera de forma bem perceptível
// e "de cauda longa" até o fim.
const EASE_DESACELERACAO: [number, number, number, number] = [0.075, 0.82, 0.165, 1]

// Com pools grandes (100+), o nome na fatia vencedora fica pequeno demais
// pra ler à distância (telão). Em vez de reduzir a lista (a roda mostra
// TODOS os participantes, decisão do usuário), a câmera vai dando zoom
// progressivo conforme a roda desacelera, ancorado no topo — onde fica o
// ponteiro e onde a fatia vencedora vai parar — pra ler o nome de perto
// bem na hora da revelação. Zoom bem forte de propósito (praticamente um
// close-up na fatia vencedora no final), pra funcionar de longe num telão.
const ZOOM_MAXIMO = 5

function calcularZoom(progresso: number) {
  // Fica ~1x (sem zoom) por boa parte do giro, e só cresce de verdade perto
  // do fim — progresso^4 mantém a curva "achatada" no começo e acentuada no
  // final, acompanhando a sensação de "chegando perto" enquanto desacelera.
  return 1 + Math.pow(progresso, 4) * (ZOOM_MAXIMO - 1)
}

export function WheelSpin({ candidatos, vencedor, onFinalizar, tamanho = 420 }: WheelSpinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotate = useMotionValue(0)
  const zoom = useMotionValue(1)
  const rodouRef = useRef(false)
  const [fatias, setFatias] = useState<ParticipantePublico[]>([])

  // Desenha a roda sempre que a lista de fatias mudar.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || fatias.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resolução do canvas já leva em conta o ZOOM MÁXIMO, não só o devicePixelRatio —
    // sem isso, ao dar zoom via CSS (transform: scale) num canvas desenhado em
    // resolução "normal", o navegador só estica os pixels já rasterizados e
    // tudo fica borrado. Desenhando na resolução final de antemão, mesmo o
    // zoom máximo continua nítido.
    const dpr = window.devicePixelRatio || 1
    const escalaRender = dpr * ZOOM_MAXIMO
    canvas.width = tamanho * escalaRender
    canvas.height = tamanho * escalaRender
    ctx.scale(escalaRender, escalaRender)

    const raio = tamanho / 2
    const anguloFatia = (2 * Math.PI) / fatias.length
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

      if (anguloFatia > 0.05) {
        ctx.save()
        ctx.translate(raio, raio)
        ctx.rotate(inicio + anguloFatia / 2)
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#ffffff'
        ctx.font = `700 ${fonte}px 'Segoe UI', system-ui, sans-serif`
        // Nome completo, sem cortar — igual ao Wheel of Names: numa roda
        // com muita gente, o texto pode "vazar" visualmente pela fatia
        // vizinha quando não cabe, em vez de truncar com reticências. Com o
        // zoom forte no final, a fatia vencedora fica legível de qualquer forma.
        ctx.fillText(pessoa.nome, raio - 14, 0)
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
    const voltas = 4
    const destino = voltas * 360 + (360 - centroFatia)

    let ultimoAngulo = 0

    const controls = animate(rotate, destino, {
      duration: DURACAO_GIRO_S,
      ease: EASE_DESACELERACAO,
      onUpdate: (valorAtual) => {
        zoom.set(calcularZoom(valorAtual / destino))

        const cruzamentosAntes = Math.floor(ultimoAngulo / anguloFatiaGraus)
        const cruzamentosAgora = Math.floor(valorAtual / anguloFatiaGraus)
        const novos = cruzamentosAgora - cruzamentosAntes
        for (let i = 0; i < Math.min(novos, 4); i++) tocarClique()
        ultimoAngulo = valorAtual
      },
      onComplete: () => onFinalizar?.(),
    })

    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vencedor])

  return (
    // transformOrigin "top center": o zoom cresce a partir do topo (onde
    // fica o ponteiro/vencedor), não do centro — assim a área que importa
    // fica "ancorada" no lugar enquanto o resto da roda cresce por baixo,
    // em vez de tudo se afastar do ponteiro por igual.
    <motion.div
      className="relative mx-auto"
      style={{ width: tamanho, height: tamanho, scale: zoom, transformOrigin: 'top center' }}
    >
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
        ganha e perde altura de rolagem a cada 1/4 de volta.
      */}
      <div className="h-full w-full overflow-hidden rounded-full shadow-summit">
        <motion.canvas ref={canvasRef} style={{ width: tamanho, height: tamanho, rotate }} />
      </div>
      <div
        className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-summit-ciano bg-white"
        aria-hidden
      />
    </motion.div>
  )
}
