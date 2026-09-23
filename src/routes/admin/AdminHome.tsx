import { Gift, CircleCheck, Users } from 'lucide-react'
import { usePremios } from '../../hooks/usePremios'
import { useParticipantesElegiveis } from '../../hooks/useParticipantesElegiveis'
import { Card, CardContent } from '@/components/ui/Card'

export function AdminHome() {
  const { premios } = usePremios()
  const { elegiveis } = useParticipantesElegiveis()
  const sorteados = premios.filter((p) => p.status === 'sorteado').length

  const tiles = [
    { label: 'Prêmios cadastrados', valor: premios.length, icone: Gift },
    { label: 'Prêmios já sorteados', valor: sorteados, icone: CircleCheck },
    { label: 'Participantes elegíveis', valor: elegiveis.length, icone: Users },
  ]

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">Visão geral</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map(({ label, valor, icone: Icone }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <Icone className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-3xl font-extrabold tabular-nums">{valor}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
