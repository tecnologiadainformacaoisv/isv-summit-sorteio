import { Link, NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/admin', label: 'Início', end: true },
  { to: '/admin/participantes', label: 'Participantes' },
  { to: '/admin/premios', label: 'Prêmios' },
  { to: '/admin/vencedores', label: 'Vencedores' },
  { to: '/admin/importacao', label: 'Importação Sympla' },
]

/** Sem login — acesso livre pra qualquer pessoa com o link (ver App.tsx). */
export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-summit-gradient flex items-center justify-between px-6 py-4 text-white">
        <p className="font-extrabold">ISV Summit 2026 — Admin</p>
        <Link
          to="/"
          className="rounded-summit-sm border-2 border-white/50 px-3 py-1.5 text-sm font-bold hover:bg-white/10"
        >
          ← Tela inicial (telão)
        </Link>
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
