import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primary' | 'ghost' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
}

const estilos: Record<Variante, string> = {
  primary:
    'bg-summit-ciano text-summit-petroleo-2 hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost: 'bg-white/10 text-white hover:bg-white/20',
  outline: 'border-2 border-white/50 text-white hover:bg-white/10',
}

export function Button({ variante = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-summit-sm px-5 py-2.5 text-sm font-bold transition ${estilos[variante]} ${className}`}
      {...props}
    />
  )
}
