import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Participante } from '../../types/database'

/** Gestão de participantes: lista o cadastro (normalmente vindo da importação Sympla) e permite desqualificar manualmente (ex: não compareceu). */
export function ParticipantesPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState('')

  async function carregar() {
    setCarregando(true)
    const { data } = await supabase.from('participantes').select('*').order('nome')
    setParticipantes(data ?? [])
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function alternarElegibilidade(p: Participante) {
    await supabase.from('participantes').update({ elegivel: !p.elegivel }).eq('id', p.id)
    carregar()
  }

  const filtrados = participantes.filter((p) => p.nome.toLowerCase().includes(filtro.toLowerCase()))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Participantes</h1>
        <input
          placeholder="Buscar por nome…"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="rounded-summit-sm border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {carregando ? (
        <p>Carregando…</p>
      ) : participantes.length === 0 ? (
        <p className="text-slate-500">
          Nenhum participante importado ainda. Use a página{' '}
          <span className="font-semibold">Importação Sympla</span> para trazer o cadastro do evento.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-summit bg-white shadow-summit">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Setor</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Elegível</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-semibold">{p.nome}</td>
                  <td className="px-4 py-3 text-slate-500">{p.setor_texto ?? '—'}</td>
                  <td className="px-4 py-3 capitalize text-slate-500">{p.tipo}</td>
                  <td className="px-4 py-3">{p.elegivel ? 'Sim' : 'Não'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => alternarElegibilidade(p)}
                      className="text-xs font-semibold text-summit-petroleo-1 hover:underline"
                    >
                      {p.elegivel ? 'Desqualificar' : 'Reabilitar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
