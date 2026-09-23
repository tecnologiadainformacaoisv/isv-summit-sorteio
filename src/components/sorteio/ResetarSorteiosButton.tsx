import { useState } from 'react'
import { RotateCcw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { resetarSorteios } from '../../lib/sorteio'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/AlertDialog'

interface ResetarSorteiosButtonProps {
  onResetado?: () => void
}

/**
 * Botão discreto (canto superior esquerdo, abaixo do cabeçalho) pra apagar
 * todos os sorteios de teste e reabrir os prêmios, sem precisar pedir pra
 * rodar SQL na mão. Fica pequeno/translúcido de propósito — é uma
 * ferramenta de ensaio, não uma ação do fluxo principal do evento.
 */
export function ResetarSorteiosButton({ onResetado }: ResetarSorteiosButtonProps) {
  const [resetando, setResetando] = useState(false)

  async function handleConfirmar() {
    setResetando(true)
    try {
      await resetarSorteios()
      toast.success('Sorteios resetados. Todos os prêmios estão abertos de novo.')
      onResetado?.()
    } catch (e) {
      toast.error('Erro ao resetar sorteios', { description: e instanceof Error ? e.message : undefined })
    } finally {
      setResetando(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={resetando}
          title="Apagar sorteios de teste e reabrir prêmios"
          className="fixed left-4 top-48 z-20 flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-xs font-semibold text-white/50 backdrop-blur-sm transition hover:bg-black/40 hover:text-white/90 disabled:opacity-50"
        >
          {resetando ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
          Reset (teste)
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apagar todos os sorteios já feitos?</AlertDialogTitle>
          <AlertDialogDescription>
            Todos os prêmios voltam a ficar "aberto". Os participantes não são afetados. Essa ação
            não pode ser desfeita — use só durante testes/ensaios.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmar}>Resetar sorteios</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
