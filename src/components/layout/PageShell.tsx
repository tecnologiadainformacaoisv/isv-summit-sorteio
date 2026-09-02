import type { ReactNode } from 'react'
import { Header } from './Header'

interface PageShellProps {
  children: ReactNode
  titulo?: string
  subtitulo?: string
  fundo?: 'gradiente' | 'claro'
}

/** Casca de página padrão: header com o gradiente do Summit + área de conteúdo. */
export function PageShell({ children, titulo, subtitulo, fundo = 'gradiente' }: PageShellProps) {
  return (
    <div className={fundo === 'gradiente' ? 'bg-summit-gradient min-h-screen' : 'min-h-screen bg-slate-50 text-slate-900'}>
      <Header titulo={titulo} subtitulo={subtitulo} />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
