import type { Premio } from '../../types/database'
import { Badge } from '../ui/Badge'

interface PremioCardProps {
  premio: Premio
  selecionado?: boolean
  onSelecionar?: (premio: Premio) => void
}

/** Card de prêmio: imagem própria + nome + status, inspirado na referência visual aprovada com o time. */
export function PremioCard({ premio, selecionado, onSelecionar }: PremioCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelecionar?.(premio)}
      className={`group relative w-full overflow-hidden rounded-summit bg-white/10 text-left shadow-summit transition hover:-translate-y-1 ${
        selecionado ? 'ring-2 ring-summit-ciano' : ''
      }`}
    >
      <div className="aspect-video w-full bg-black/20">
        {premio.imagem_url ? (
          <img src={premio.imagem_url} alt={premio.nome} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-white/40">Sem imagem</div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <p className="font-bold text-white">{premio.nome}</p>
        <Badge tom={premio.status}>{premio.status === 'aberto' ? 'Aberto' : 'Sorteado'}</Badge>
      </div>
    </button>
  )
}
