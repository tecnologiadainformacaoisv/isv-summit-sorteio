import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Helper padrão do shadcn/ui: mescla classes Tailwind sem conflito (ex: duas larguras diferentes). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
