import { useState } from 'react'
import { resetarSorteios } from '../../lib/sorteio'

interface ResetarSorteiosButtonProps {
  onResetado?: () => void
}

/**
 * Botão discreto (canto inferior direito) pra apagar todos os sorteios de
 * teste e reabrir os prêmios, sem precisar pedir pra rodar SQL na mão.
 * Fica pequeno/translúcido de propósito — é uma ferramenta de ensaio, não
 * uma ação do fluxo principal do evento.
 */
export function ResetarSorteiosButton({ onResetado }: ResetarSorteiosButtonProps) {
  const [resetando, setResetando] = useState(false)

  async function handleClick() {
    const confirmado = window.confirm(
      'Apagar todos os sorteios já feitos e reabrir todos os prêmios?\n\nOs participantes não são afetados. Essa ação não pode ser desfeita — use só durante testes/ensaios.',
    )
    if (!confirmado) return

    setResetando(true)
    try {
      await resetarSorteios()
      onResetado?.()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao resetar sorteios.')
    } finally {
      setResetando(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={resetando}
      title="Apagar sorteios de teste e reabrir prêmios"
      className="fixed bottom-4 right-4 z-20 rounded-full bg-black/20 px-3 py-1.5 text-xs font-semibold text-white/50 backdrop-blur-sm transition hover:bg-black/40 hover:text-white/90 disabled:opacity-50"
    >
      {resetando ? 'Resetando…' : '↺ Reset (teste)'}
    </button>
  )
}
