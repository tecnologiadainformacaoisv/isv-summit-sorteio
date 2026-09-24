import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
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

// Fator máximo de zoom (tamanho real, não transform). Usado tanto pra
// animar quanto pra decidir a resolução do canvas — desenhando já no
// tamanho final ampliado, o zoom nunca fica borrado (esticar um bitmap
// pequeno via CSS é o que causava o desfoque antes).
const ZOOM_MAXIMO = 2.8

/**
 * Roleta de nomes (estilo Wheel of Names): fatias desenhadas em canvas,
 * giro com desaceleração parando exatamente no vencedor já sorteado (RNG
 * resolvido em lib/sorteio.ts, antes desta animação começar — este
 * componente é puramente decorativo, igual ao antigo SlotReel). Formato
 * meia-lua FIXO (não anima o corte): mostrando só a metade de cima, o
 * mesmo espaço vertical permite um raio bem maior — e raio maior = fonte
 * maior por fatia, essencial pra dar pra ler o nome com muitos
 * participantes. O círculo inteiro é sempre desenhado (mais fácil de
 * girar), só a "janela" visível é que é meia-lua.
 */
export function WheelSpin({ candidatos, vencedor, onFinalizar, tamanho = 420 }: WheelSpinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotate = useMotionValue(0)
  // Tamanho REAL da caixa (não um transform:scale) — cresce empurrando o que
  // vem depois na página (ex: o botão "voltar"), em vez de só crescer por
  // cima visualmente sem mexer no espaço reservado no layout.
  const ladoAtual = useMotionValue(tamanho)
  // Altura da "janela" visível (meia-lua) — sempre 58% do lado, derivada
  // automaticamente do zoom em tempo real via useTransform.
  const alturaJanela = useTransform(ladoAtual, (v) => v * 0.58)
  // Centro real do círculo em px (metade do lado) — vinculado direto ao
  // mesmo valor usado pro círculo, não a uma % da janela (que dependia do
  // aspect-ratio resolver a tempo durante a animação e podia dessincronizar).
  const centroPx = useTransform(ladoAtual, (v) => v / 2)
  const [fatias, setFatias] = useState<ParticipantePublico[]>([])

  // Desenha a roda sempre que a lista de fatias mudar. Desenha já na
  // resolução do zoom MÁXIMO (não no tamanho base) — o elemento visual
  // começa menor e cresce via CSS até esse tamanho real, nunca ultrapassando
  // a resolução nativa do bitmap, então não borra em nenhum momento do zoom.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || fatias.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resolucao = tamanho * ZOOM_MAXIMO
    const dpr = window.devicePixelRatio || 1
    canvas.width = resolucao * dpr
    canvas.height = resolucao * dpr
    ctx.scale(dpr, dpr)

    const raio = resolucao / 2
    const anguloFatia = (2 * Math.PI) / fatias.length
    const inicioTexto = raio - 14
    const larguraDisponivel = inicioTexto - 18
    // Fonte MÁXIMA como ponto de partida (ângulo × raio na borda externa) —
    // só o chute inicial; o loop abaixo confere caso a caso.
    const fonteMaximaAngular = anguloFatia * inicioTexto * 0.86

    ctx.clearRect(0, 0, resolucao, resolucao)

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
        // possível que ainda cabe, pra preencher o espaço em vez de deixar
        // fatia vazia. Confere DOIS limites, não só a largura: a fatia é um
        // leque, mais estreita perto do centro — um nome comprido termina
        // perto do centro, onde cabe MENOS altura de fonte do que na borda
        // externa. Sem checar isso, o nome "vaza" pra fatia vizinha (era
        // exatamente esse bug: só a borda externa era considerada).
        const texto = pessoa.nome
        let tamanhoFonte = fonteMaximaAngular
        ctx.font = `700 ${tamanhoFonte}px 'Segoe UI', system-ui, sans-serif`
        for (let tentativas = 0; tentativas < 60; tentativas++) {
          const largura = ctx.measureText(texto).width
          const raioInterno = Math.max(4, inicioTexto - largura)
          const alturaMaximaNoPontoMaisEstreito = anguloFatia * raioInterno * 0.86
          const cabeNaLargura = largura <= larguraDisponivel
          const cabeNaAltura = tamanhoFonte <= alturaMaximaNoPontoMaisEstreito
          if ((cabeNaLargura && cabeNaAltura) || tamanhoFonte <= 6) break
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
    const controlsLado = animate(ladoAtual, tamanho * ZOOM_MAXIMO, {
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
    <motion.div className="relative mx-auto" style={{ width: ladoAtual, height: alturaJanela }}>
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
        overflow: hidden aqui essencial em dois sentidos: 1) girando um
        quadrado (o <canvas>), a caixa visual dele em 45°/135° fica maior
        que o lado original — sem cortar isso, o scroll "pula" a cada 1/4 de
        volta; 2) é o que corta a metade de baixo do círculo, formando a
        meia-lua (a "janela" externa é mais baixa que larga, o círculo
        interno continua um quadrado perfeito, nunca vira elipse/serrilhado).
      */}
      <div className="relative h-full w-full overflow-hidden">
        <motion.div
          className="absolute inset-x-0 top-0 overflow-hidden rounded-full shadow-summit"
          style={{ width: ladoAtual, height: ladoAtual }}
        >
          <motion.canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', rotate }}
          />
        </motion.div>
      </div>
      <motion.div
        className="absolute left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-summit-ciano bg-white"
        style={{ top: centroPx }}
        aria-hidden
      />
    </motion.div>
  )
}
