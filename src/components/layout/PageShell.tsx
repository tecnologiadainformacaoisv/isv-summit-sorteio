import type { ReactNode } from 'react'
import { Header } from './Header'

interface PageShellProps {
  children: ReactNode
  titulo?: string
  subtitulo?: string
  fundo?: 'gradiente' | 'claro'
  /**
   * Quando true, o <main> ocupa a largura/altura total disponível (sem o
   * max-w-6xl/padding padrão) e vira um container flex vertical — usado pela
   * tela do sorteio, cuja roda precisa medir o espaço real da tela pra saber
   * até onde crescer (ver WheelSpin.tsx), não um valor fixo arbitrário.
   */
  larguraTotal?: boolean
}

/** Casca de página padrão: header com o gradiente do Summit + área de conteúdo. */
export function PageShell({ children, titulo, subtitulo, fundo = 'gradiente', larguraTotal = false }: PageShellProps) {
  return (
    // overflow-x-hidden: rede de segurança contra scroll horizontal — mesmo
    // que algum cálculo de tamanho (ver WheelSpin.tsx) erre por 1-2px em
    // algum navegador/tela específica, isso vira um corte invisível em vez
    // de uma barra de rolagem lateral aparecendo.
    <div
      className={`flex min-h-dvh flex-col overflow-x-hidden ${fundo === 'gradiente' ? 'bg-summit-gradient' : 'bg-slate-50 text-slate-900'}`}
    >
      <Header titulo={titulo} subtitulo={subtitulo} />
      <main
        className={
          larguraTotal
            ? 'flex flex-1 flex-col px-4 py-4'
            : 'mx-auto max-w-6xl flex-1 px-6 py-8'
        }
      >
        {children}
      </main>
    </div>
  )
}
