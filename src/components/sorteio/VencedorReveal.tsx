import { motion, AnimatePresence } from 'framer-motion'
import type { ParticipantePublico } from '../../types/database'
import { useSomVitoria } from '../../lib/audio'
import { useEffect } from 'react'

interface VencedorRevealProps {
  vencedor: ParticipantePublico | null
  visivel: boolean
}

/** Revelação final: nome + setor/unidade (desambigua homônimos), com som de vitória. */
export function VencedorReveal({ vencedor, visivel }: VencedorRevealProps) {
  const [tocarSom] = useSomVitoria()

  useEffect(() => {
    if (visivel && vencedor) tocarSom()
  }, [visivel, vencedor, tocarSom])

  return (
    <AnimatePresence>
      {visivel && vencedor && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="mt-6 rounded-summit bg-white/10 px-8 py-6 text-center"
        >
          <p className="text-sm font-bold uppercase tracking-widest text-summit-ciano">Vencedor</p>
          <p className="mt-1 text-4xl font-extrabold text-white">{vencedor.nome}</p>
          {vencedor.setor_texto && <p className="mt-1 text-white/70">{vencedor.setor_texto}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
