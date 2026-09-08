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
  const { autenticado, carregando, erro } = useAuth()
  const location = useLocation()

  if (carregando) return null

  if (erro) {
    return (
      <div className="bg-summit-gradient flex min-h-screen items-center justify-center px-4 text-center text-white">
        <div>
          <p className="mb-1 text-lg font-bold">Não foi possível verificar o login.</p>
          <p className="text-sm text-white/70">{erro} — recarregue a página pra tentar de novo.</p>
        </div>
      </div>
    )
  }

  if (!autenticado) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
