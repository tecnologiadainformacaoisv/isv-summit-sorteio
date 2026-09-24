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

// Única fonte da verdade pra duração do giro — usada tanto na transição do
// framer-motion quanto no timeout que libera onFinalizar, pra nunca dessincronizar.
const DURACAO_GIRO_MS = 8000

/**
 * Roleta de nomes (estilo Wheel of Names): fatias desenhadas em canvas,
 * giro com desaceleração parando exatamente no vencedor já sorteado (RNG
 * resolvido em lib/sorteio.ts, antes desta animação começar — este
 * componente é puramente decorativo, igual ao antigo SlotReel). Círculo
 * inteiro sempre, sem meia-lua — só dá um leve zoom crescendo a partir do
 * ponteiro (onde a fatia vencedora sempre para) conforme desacelera.
 */
export function WheelSpin({ candidatos, vencedor, onFinalizar, tamanho = 420 }: WheelSpinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotate = useMotionValue(0)
  // Tamanho REAL da caixa (não um transform:scale) — cresce empurrando o que
  // vem depois na página (ex: o botão "voltar"), em vez de só crescer por
  // cima visualmente sem mexer no espaço reservado no layout.
  const ladoAtual = useMotionValue(tamanho)
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
    const larguraDisponivel = raio - 14 - 18
    // Fonte MÁXIMA que cabe na altura da fatia (ângulo × raio) — ponto de
    // partida pra cada nome tentar preencher o espaço ao máximo, em vez de
    // um tamanho pequeno e conservador que sobra espaço vazio.
    const fonteMaximaAngular = anguloFatia * (raio - 14) * 0.86

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

        // Nome completo (não só o primeiro) — cada fatia usa a maior fonte
        // possível que ainda cabe na largura disponível, pra preencher o
        // espaço em vez de deixar fatia vazia. Só corta com "…" no caso raro
        // de nem no tamanho mínimo legível caber inteiro.
        const texto = pessoa.nome
        let tamanhoFonte = fonteMaximaAngular
        ctx.font = `700 ${tamanhoFonte}px 'Segoe UI', system-ui, sans-serif`
        while (ctx.measureText(texto).width > larguraDisponivel && tamanhoFonte > 6) {
          tamanhoFonte -= 0.5
          ctx.font = `700 ${tamanhoFonte}px 'Segoe UI', system-ui, sans-serif`
        }

        let textoFinal = texto
        if (ctx.measureText(textoFinal).width > larguraDisponivel) {
          while (textoFinal.length > 2 && ctx.measureText(`${textoFinal}…`).width > larguraDisponivel) {
            textoFinal = textoFinal.slice(0, -1)
          }
          textoFinal += '…'
        }
        ctx.fillText(textoFinal, raio - 14, 0)
        ctx.restore()
      }
    })
  }, [fatias, tamanho])

  useEffect(() => {
    if (!vencedor) return
    ladoAtual.set(tamanho)

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

    let ultimoAngulo = 0
    const controls = animate(rotate, destino, {
      duration: DURACAO_GIRO_MS / 1000,
      ease: [0.12, 0.8, 0.15, 1],
      onUpdate: (valorAtual) => {
        // Toca um "clique" a cada fatia cruzada, sincronizado de verdade com
        // a velocidade real do giro (rápido no começo, indo devagar no fim).
        const cruzamentosAntes = Math.floor(ultimoAngulo / anguloFatiaGraus)
        const cruzamentosAgora = Math.floor(valorAtual / anguloFatiaGraus)
        const novos = cruzamentosAgora - cruzamentosAntes
        for (let i = 0; i < Math.min(novos, 4); i++) tocarClique()
        ultimoAngulo = valorAtual
      },
      onComplete: () => onFinalizar?.(),
    })

    // Zoom progressivo crescendo em tamanho real (não transform) — o topo
    // não se move (o giro nunca some do lugar), e o que vem depois na
    // página (o botão de voltar) é empurrado pra baixo conforme cresce,
    // igual um elemento normal de layout.
    const controlsLado = animate(ladoAtual, tamanho * 2.1, {
      duration: DURACAO_GIRO_MS / 1000,
      ease: [0.25, 0.1, 0.5, 1],
    })

    return () => {
      controls.stop()
      controlsLado.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vencedor])

  return (
    <motion.div className="relative mx-auto" style={{ width: ladoAtual, height: ladoAtual }}>
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
        <motion.canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', rotate }}
        />
      </div>
      <div
        className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-summit-ciano bg-white"
        aria-hidden
      />
    </motion.div>
  )
}
