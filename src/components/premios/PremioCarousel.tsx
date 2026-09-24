import { useEffect, useRef } from 'react'
import { CircleCheck, ImageOff } from 'lucide-react'
import type { Premio } from '../../types/database'
import { cn } from '@/lib/utils'

interface PremioCarouselProps {
  premios: Premio[]
  premioAtualId: string
  /** premio_id -> nome do vencedor, pra exibir embaixo do card já sorteado. */
  vencedorPorPremio?: Record<string, string>
  onSelecionar: (premio: Premio) => void
}

const LARGURA_CARD = 176
const GAP = 28
// Zona nas bordas (px) onde o mouse parado faz a faixa rolar sozinha —
// dispensa arrastar, só passar o mouse perto da ponta (pedido do usuário).
const ZONA_HOVER = 160
const VELOCIDADE_MAX = 14
// Espera o mouse "assentar" sobre o card antes de trocar o prêmio ativo —
// sem isso, passar rápido pelos cards ao rolar pula seleções sem querer.
const DELAY_SELECAO_MS = 350

/**
 * Faixa "coverflow" de prêmios (referência: dashboard do Xbox 360) — o card
 * mais perto do centro fica grande e em destaque, os vizinhos encolhem e
 * escurecem conforme se afastam, com reflexo embaixo. Passar o mouse perto
 * das bordas rola a faixa sozinha (sem precisar arrastar), pra trocar de
 * prêmio rápido durante a apresentação ao vivo.
 */
export function PremioCarousel({ premios, premioAtualId, vencedorPorPremio, onSelecionar }: PremioCarouselProps) {
  const trilhaRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const velocidadeRef = useRef(0)
  const rafRef = useRef<number>(0)
  const timeoutSelecaoRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function agendarSelecao(premio: Premio) {
    clearTimeout(timeoutSelecaoRef.current)
    timeoutSelecaoRef.current = setTimeout(() => onSelecionar(premio), DELAY_SELECAO_MS)
  }

  useEffect(() => () => clearTimeout(timeoutSelecaoRef.current), [])

  // Centraliza o card ativo ao trocar de prêmio (ex: via clique na grid anterior).
  useEffect(() => {
    itemRefs.current[premioAtualId]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [premioAtualId])

  useEffect(() => {
    const trilha = trilhaRef.current
    if (!trilha) return

    function aplicarEscala() {
      if (!trilha) return
      const centroTrilha = trilha.scrollLeft + trilha.clientWidth / 2
      for (const premio of premios) {
        const el = itemRefs.current[premio.id]
        if (!el) continue
        const centroItem = el.offsetLeft + el.offsetWidth / 2
        const distancia = Math.abs(centroItem - centroTrilha)
        const t = Math.min(distancia / (LARGURA_CARD * 2.2), 1)
        const escala = 1 - t * 0.42
        const opacidade = 1 - t * 0.75
        el.style.transform = `scale(${escala})`
        el.style.opacity = String(opacidade)
        el.style.zIndex = String(Math.round((1 - t) * 20))
      }
    }

    function loop() {
      if (velocidadeRef.current !== 0 && trilha) {
        trilha.scrollLeft += velocidadeRef.current
      }
      aplicarEscala()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [premios.length])

  function handleMouseMove(e: React.MouseEvent) {
    const trilha = trilhaRef.current
    if (!trilha) return
    const { left, width } = trilha.getBoundingClientRect()
    const x = e.clientX - left

    if (x < ZONA_HOVER) {
      const forca = 1 - x / ZONA_HOVER
      velocidadeRef.current = -forca * VELOCIDADE_MAX
    } else if (x > width - ZONA_HOVER) {
      const forca = 1 - (width - x) / ZONA_HOVER
      velocidadeRef.current = forca * VELOCIDADE_MAX
    } else {
      velocidadeRef.current = 0
    }
  }

  function handleMouseLeave() {
    velocidadeRef.current = 0
  }

  return (
    <div className="relative">
      <div
        ref={trilhaRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex items-center gap-7 overflow-x-auto overflow-y-visible px-[40%] py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {premios.map((premio) => {
          const ativo = premio.id === premioAtualId
          return (
            <button
              key={premio.id}
              type="button"
              ref={(el) => {
                itemRefs.current[premio.id] = el
              }}
              onClick={() => onSelecionar(premio)}
              onMouseEnter={() => agendarSelecao(premio)}
              onMouseLeave={() => clearTimeout(timeoutSelecaoRef.current)}
              style={{ width: LARGURA_CARD, marginRight: -GAP + GAP }}
              className="group relative shrink-0 transition-[transform,opacity] duration-150 ease-out"
            >
              <div
                className={cn(
                  'relative aspect-square w-full overflow-hidden rounded-xl border-2 bg-gradient-to-b from-white to-slate-200 shadow-[0_8px_24px_rgba(0,0,0,0.5)]',
                  ativo
                    ? 'border-summit-ciano shadow-[0_0_28px_rgba(0,236,170,0.65)]'
                    : 'border-white/15',
                )}
              >
                {premio.imagem_url ? (
                  <img
                    src={premio.imagem_url}
                    alt={premio.nome}
                    draggable={false}
                    className="h-full w-full object-contain p-3 mix-blend-multiply"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <ImageOff className="size-8" />
                  </div>
                )}
                {premio.status === 'sorteado' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <CircleCheck className="size-9 text-summit-ciano drop-shadow-[0_0_6px_rgba(0,0,0,0.7)]" />
                  </div>
                )}
              </div>

              {/* Reflexo espelhado, esmaecendo pra baixo — dá o acabamento "coverflow". */}
              <div
                aria-hidden
                className="relative mt-0.5 aspect-[1/0.45] w-full overflow-hidden rounded-b-xl opacity-35"
                style={{
                  maskImage: 'linear-gradient(to bottom, black, transparent)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
                }}
              >
                {premio.imagem_url && (
                  <img
                    src={premio.imagem_url}
                    alt=""
                    draggable={false}
                    className="absolute inset-x-0 top-0 h-full w-full origin-top scale-y-[-1] object-contain object-top mix-blend-multiply"
                  />
                )}
              </div>

              <p
                className={cn(
                  'mt-1 truncate text-center text-xs font-semibold transition-colors',
                  ativo ? 'text-summit-ciano' : 'text-white/60',
                )}
              >
                {premio.nome}
              </p>
              {premio.status === 'sorteado' && vencedorPorPremio?.[premio.id] && (
                <p className="truncate text-center text-[11px] font-bold text-summit-ciano">
                  🏆 {vencedorPorPremio[premio.id]}
                </p>
              )}
            </button>
          )
        })}
      </div>

      {/* Sombras nas laterais indicando que dá pra passar o mouse ali pra rolar. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-summit-grad-5 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-summit-grad-5 to-transparent" />
    </div>
  )
}
