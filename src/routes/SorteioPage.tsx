import { useState } from 'react'
import confetti from 'canvas-confetti'
import { PageShell } from '../components/layout/PageShell'
import { PremioGrid } from '../components/premios/PremioGrid'
import { PremioCarousel } from '../components/premios/PremioCarousel'
import { SorteioStage } from '../components/sorteio/SorteioStage'
import { ResetarSorteiosButton } from '../components/sorteio/ResetarSorteiosButton'
import { Button } from '../components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import { usePremios } from '../hooks/usePremios'
import { useParticipantesElegiveis } from '../hooks/useParticipantesElegiveis'
import { useVencedores } from '../hooks/useVencedores'

/** Tela do telão — sem login, acesso livre pra qualquer pessoa com o link. */
export function SorteioPage() {
  const { premios, carregando: carregandoPremios, recarregar: recarregarPremios } = usePremios()
  const { elegiveis, recarregar: recarregarElegiveis } = useParticipantesElegiveis()
  const { vencedores, recarregar: recarregarVencedores } = useVencedores()
  const [premioAtualId, setPremioAtualId] = useState<string | null>(null)

  // Deriva o prêmio atual da lista viva (em vez de guardar o objeto), assim o
  // status "sorteado" atualiza na hora na faixa horizontal sem precisar sair
  // da tela — essencial pra trocar de prêmio rapidamente durante o evento.
  const premioAtual = premios.find((p) => p.id === premioAtualId) ?? null

  // Troca de prêmio (grid ou carrossel) sempre limpa qualquer confete que
  // ainda esteja caindo de um sorteio anterior — o canvas dele é global,
  // fora do ciclo de vida do React, então sobrevive à troca se não for
  // limpo explicitamente aqui.
  function selecionarPremio(id: string | null) {
    confetti.reset()
    setPremioAtualId(id)
  }

  // Mapa premio_id -> nome do vencedor, pra exibir direto no card do grid
  // sem precisar abrir a revelação de novo.
  const vencedorPorPremio = Object.fromEntries(
    vencedores.map((v) => [v.premio_id, v.participante.nome]),
  )

  async function handleSorteioConcluido() {
    await Promise.all([recarregarPremios(), recarregarElegiveis(), recarregarVencedores()])
  }

  return (
    <PageShell titulo="ISV Summit 2026" subtitulo="Sorteio de prêmios">
      {premioAtual ? (
        <div>
          <Button
            variant="summit-outline"
            onClick={() => selecionarPremio(null)}
            className="mb-6"
          >
            <ArrowLeft /> Voltar para a lista de prêmios
          </Button>

          {/* Faixa horizontal pra trocar de prêmio sem sair da tela — arrasta
              com o mouse pra navegar. Otimiza o tempo durante a apresentação. */}
          <PremioCarousel
            premios={premios}
            premioAtualId={premioAtual.id}
            vencedorPorPremio={vencedorPorPremio}
            onSelecionar={(p) => selecionarPremio(p.id)}
          />

          {/* key={premio.id}: força remontagem ao trocar de prêmio, garantindo que o
              "já girei" interno do WheelSpin reseta para o próximo sorteio. */}
          <div className="mt-6">
            <SorteioStage
              key={premioAtual.id}
              premio={premioAtual}
              candidatos={elegiveis}
              onSorteioConcluido={handleSorteioConcluido}
            />
          </div>
        </div>
      ) : (
        <>
          <p className="mb-6 text-white/80">
            {carregandoPremios ? 'Carregando prêmios…' : `${elegiveis.length} participante(s) elegível(is) no pool.`}
          </p>
          <PremioGrid premios={premios} vencedorPorPremio={vencedorPorPremio} onSelecionar={(p) => selecionarPremio(p.id)} />
        </>
      )}

      <ResetarSorteiosButton
        onResetado={async () => {
          selecionarPremio(null) // evita ficar preso na tela de um prêmio com status desatualizado
          await handleSorteioConcluido()
        }}
      />
    </PageShell>
  )
}
