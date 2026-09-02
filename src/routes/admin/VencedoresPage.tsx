import { useVencedores } from '../../hooks/useVencedores'
import { usePremios } from '../../hooks/usePremios'

export function VencedoresPage() {
  const { vencedores, carregando } = useVencedores()
  const { premios } = usePremios()
  const nomePremio = (id: string) => premios.find((p) => p.id === id)?.nome ?? '—'

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">Histórico de vencedores</h1>

      {carregando ? (
        <p>Carregando…</p>
      ) : vencedores.length === 0 ? (
        <p className="text-slate-500">Nenhum sorteio realizado ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-summit bg-white shadow-summit">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3">Prêmio</th>
                <th className="px-4 py-3">Vencedor</th>
                <th className="px-4 py-3">Setor</th>
                <th className="px-4 py-3">Data/hora</th>
              </tr>
            </thead>
            <tbody>
              {vencedores.map((v) => (
                <tr key={v.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-semibold">{nomePremio(v.premio_id)}</td>
                  <td className="px-4 py-3">{v.participante?.nome ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{v.participante?.setor_texto ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(v.realizado_em).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
