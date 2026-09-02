import type { Premio } from '../../types/database'
import { PremioCard } from './PremioCard'

interface PremioGridProps {
  premios: Premio[]
  premioSelecionadoId?: string
  onSelecionar?: (premio: Premio) => void
}

export function PremioGrid({ premios, premioSelecionadoId, onSelecionar }: PremioGridProps) {
  if (premios.length === 0) {
    return <p className="text-white/70">Nenhum prêmio cadastrado ainda.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {premios.map((premio) => (
        <PremioCard
          key={premio.id}
          premio={premio}
          selecionado={premio.id === premioSelecionadoId}
          onSelecionar={onSelecionar}
        />
      ))}
    </div>
  )
}
