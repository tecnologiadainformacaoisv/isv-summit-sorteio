import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import type { ParticipantePublico } from '../../types/database'
import { useSomVitoria } from '../../lib/audio'
import { Button } from '../ui/button'

interface VencedorRevealProps {
  vencedor: ParticipantePublico | null
  premioNome: string
  visivel: boolean
  onFechar?: () => void
}

/**
 * Revelação em destaque: overlay de tela cheia sobre a roleta, fundo
 * escurecido, nome grande — pensado pra ser lido de longe num telão, não só
 * um bloco discreto de texto. Nome + setor/unidade desambigua homônimos.
 */
export function VencedorReveal({ vencedor, premioNome, visivel, onFechar }: VencedorRevealProps) {
  const [tocarSom] = useSomVitoria()

  useEffect(() => {
    if (visivel && vencedor) tocarSom()
  }, [visivel, vencedor, tocarSom])

  return (
    <AnimatePresence>
      {visivel && vencedor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-summit-grad-5/85 px-4 backdrop-blur-sm"
          onClick={onFechar}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-summit border border-summit-ciano/40 bg-summit-gradient p-10 text-center shadow-2xl sm:p-14"
          >
            {/* Emblema de destaque */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-summit-ciano/20 ring-4 ring-summit-ciano/30">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-summit-ciano">
                <path
                  d="M12 2l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16l-5.6 3.1 1.4-6.3-4.8-4.3 6.4-.6L12 2z"
                  fill="currentColor"
                />
              </svg>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-summit-ciano">
              {premioNome}
            </p>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.3em] text-white/60">Vencedor</p>

            <p className="mt-3 text-balance text-4xl font-extrabold leading-tight text-white sm:text-6xl">
              {vencedor.nome}
            </p>

            {vencedor.setor_texto && (
              <p className="mt-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-base font-semibold text-white/85">
                {vencedor.setor_texto}
              </p>
            )}

            {onFechar && (
              <Button variant="summit-outline" onClick={onFechar} className="mt-9 w-full sm:mx-auto sm:w-auto sm:px-8">
                Continuar
              </Button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
