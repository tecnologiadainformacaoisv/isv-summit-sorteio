import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'

export function LoginPage() {
  const { entrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // Volta pra tela que o operador estava tentando abrir (ex: "/" pra sortear)
  // — RequireAuth guarda esse destino em location.state ao redirecionar aqui.
  const destino = (location.state as { from?: Location })?.from
  const destinoPath = destino ? `${destino.pathname}${destino.search ?? ''}` : '/admin'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    const { error } = await entrar(email, senha)
    setEnviando(false)
    if (error) setErro('E-mail ou senha inválidos.')
    else navigate(destinoPath, { replace: true })
  }

  return (
    <div className="bg-summit-gradient flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-summit bg-white/10 p-8">
        <h1 className="mb-1 text-2xl font-extrabold text-white">Área administrativa</h1>
        <p className="mb-6 text-sm text-white/70">ISV Summit 2026 — Sorteio</p>

        <label className="mb-3 block text-sm text-white/80">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-summit-sm bg-white/90 px-3 py-2 text-slate-900 outline-none"
          />
        </label>

        <label className="mb-6 block text-sm text-white/80">
          Senha
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="mt-1 w-full rounded-summit-sm bg-white/90 px-3 py-2 text-slate-900 outline-none"
          />
        </label>

        {erro && <p className="mb-4 text-sm font-semibold text-red-300">{erro}</p>}

        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </div>
  )
}
