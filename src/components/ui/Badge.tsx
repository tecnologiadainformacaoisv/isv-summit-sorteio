import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tom?: 'aberto' | 'sorteado'
}

const tons: Record<NonNullable<BadgeProps['tom']>, string> = {
  aberto: 'bg-summit-ciano/20 text-summit-ciano',
  sorteado: 'bg-white/10 text-white/60',
}

export function Badge({ children, tom = 'aberto' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${tons[tom]}`}>
      {children}
    </span>
  )
}
