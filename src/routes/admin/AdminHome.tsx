import { usePremios } from '../../hooks/usePremios'
import { useParticipantesElegiveis } from '../../hooks/useParticipantesElegiveis'

export function AdminHome() {
  const { premios } = usePremios()
  const { elegiveis } = useParticipantesElegiveis()
  const sorteados = premios.filter((p) => p.status === 'sorteado').length

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">Visão geral</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-summit bg-white p-5 shadow-summit">
          <p className="text-sm text-slate-500">Prêmios cadastrados</p>
          <p className="text-3xl font-extrabold">{premios.length}</p>
        </div>
        <div className="rounded-summit bg-white p-5 shadow-summit">
          <p className="text-sm text-slate-500">Prêmios já sorteados</p>
          <p className="text-3xl font-extrabold">{sorteados}</p>
        </div>
        <div className="rounded-summit bg-white p-5 shadow-summit">
          <p className="text-sm text-slate-500">Participantes elegíveis</p>
          <p className="text-3xl font-extrabold">{elegiveis.length}</p>
        </div>
      </div>
    </div>
  )
}
