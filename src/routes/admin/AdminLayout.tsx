import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const links = [
  { to: '/admin', label: 'Início', end: true },
  { to: '/admin/participantes', label: 'Participantes' },
  { to: '/admin/premios', label: 'Prêmios' },
  { to: '/admin/vencedores', label: 'Vencedores' },
  { to: '/admin/importacao', label: 'Importação Sympla' },
]

/** Guarda de sessão: redireciona para /admin/login se não autenticado. */
export function AdminLayout() {
  const { autenticado, carregando, sair } = useAuth()

  if (carregando) return null
  if (!autenticado) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-summit-gradient flex items-center justify-between px-6 py-4 text-white">
        <p className="font-extrabold">ISV Summit 2026 — Admin</p>
        <button onClick={() => sair()} className="text-sm font-semibold text-white/80 hover:text-white">
          Sair
        </button>
      </div>
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-6">
        <nav className="w-48 shrink-0 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block rounded-summit-sm px-3 py-2 text-sm font-semibold ${
                  isActive ? 'bg-summit-petroleo-1 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
