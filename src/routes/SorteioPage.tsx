import { useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { PremioGrid } from '../components/premios/PremioGrid'
import { SorteioStage } from '../components/sorteio/SorteioStage'
import { usePremios } from '../hooks/usePremios'
import { useParticipantesElegiveis } from '../hooks/useParticipantesElegiveis'
import type { Premio } from '../types/database'

/** Tela pública do telão — operada por um membro da equipe, sem exigir login. */
export function SorteioPage() {
  const { premios, carregando: carregandoPremios, recarregar: recarregarPremios } = usePremios()
  const { elegiveis, recarregar: recarregarElegiveis } = useParticipantesElegiveis()
  const [premioAtual, setPremioAtual] = useState<Premio | null>(null)

  async function handleSorteioConcluido() {
    await Promise.all([recarregarPremios(), recarregarElegiveis()])
  }

  return (
    <PageShell titulo="ISV Summit 2026" subtitulo="Sorteio de prêmios">
      {premioAtual ? (
        <div>
          <button
            type="button"
            onClick={() => setPremioAtual(null)}
            className="mb-6 text-sm font-semibold text-white/70 hover:text-white"
          >
            ← Voltar para a lista de prêmios
          </button>
          <SorteioStage
            premio={premioAtual}
            candidatos={elegiveis}
            onSorteioConcluido={handleSorteioConcluido}
          />
        </div>
      ) : (
        <>
          <p className="mb-6 text-white/80">
            {carregandoPremios ? 'Carregando prêmios…' : `${elegiveis.length} participante(s) elegível(is) no pool.`}
          </p>
          <PremioGrid premios={premios} onSelecionar={setPremioAtual} />
        </>
      )}
    </PageShell>
  )
}
