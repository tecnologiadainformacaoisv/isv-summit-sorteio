import { ImageOff, CircleCheck } from 'lucide-react'
import type { Premio } from '../../types/database'
import { Badge } from '../ui/Badge'
import { cn } from '@/lib/utils'

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
      className={cn(
        'group relative w-full overflow-hidden rounded-summit border border-white/10 bg-white/10 text-left shadow-summit transition-all hover:-translate-y-1 hover:border-summit-ciano/50 hover:shadow-lg',
        selecionado && 'ring-2 ring-summit-ciano',
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black/20">
        {premio.imagem_url ? (
          <img
            src={premio.imagem_url}
            alt={premio.nome}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-white/30">
            <ImageOff className="size-8" />
            <span className="text-xs font-semibold uppercase tracking-wide">Sem imagem</span>
          </div>
        )}
        {premio.status === 'sorteado' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
            <CircleCheck className="size-10 text-summit-ciano" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <p className="font-bold text-white">{premio.nome}</p>
        <Badge variant={premio.status === 'aberto' ? 'summit-aberto' : 'summit-sorteado'}>
          {premio.status === 'aberto' ? 'Aberto' : 'Sorteado'}
        </Badge>
      </div>
    </button>
  )
}
