import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * Guarda de sessão reutilizável — usada tanto em /admin/* quanto na tela do
 * telão ("/"). A escrita no banco (gravar o resultado do sorteio, editar
 * prêmios/participantes) exige usuário autenticado por RLS (ver db/02_rls.sql),
 * então quem opera QUALQUER uma dessas telas precisa estar logado — não só o
 * admin. Guarda o destino original para voltar pra lá depois do login.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { autenticado, carregando } = useAuth()
  const location = useLocation()

  if (carregando) return null
  if (!autenticado) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
