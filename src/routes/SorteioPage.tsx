import { useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { PremioGrid } from '../components/premios/PremioGrid'
import { SorteioStage } from '../components/sorteio/SorteioStage'
import { Button } from '../components/ui/Button'
import { usePremios } from '../hooks/usePremios'
import { useParticipantesElegiveis } from '../hooks/useParticipantesElegiveis'
import type { Premio } from '../types/database'

/** Tela do telão, operada por um membro da equipe logado (ver RequireAuth em App.tsx). */
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
          <Button variante="outline" onClick={() => setPremioAtual(null)} className="mb-6">
            ← Voltar para a lista de prêmios
          </Button>
          {/* key={premio.id}: força remontagem ao trocar de prêmio, garantindo que o
              "já girei" interno do WheelSpin reseta para o próximo sorteio. */}
          <SorteioStage
            key={premioAtual.id}
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
