import { Trophy } from 'lucide-react'
import { useVencedores } from '../../hooks/useVencedores'
import { usePremios } from '../../hooks/usePremios'
import { Card } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

export function VencedoresPage() {
  const { vencedores, carregando } = useVencedores()
  const { premios } = usePremios()
  const nomePremio = (id: string) => premios.find((p) => p.id === id)?.nome ?? '—'

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">Histórico de vencedores</h1>

      {carregando ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : vencedores.length === 0 ? (
        <p className="text-muted-foreground">Nenhum sorteio realizado ainda.</p>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prêmio</TableHead>
                <TableHead>Vencedor</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Data/hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vencedores.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-semibold">{nomePremio(v.premio_id)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <Trophy className="size-3.5 text-amber-500" />
                      {v.participante?.nome ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{v.participante?.setor_texto ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(v.realizado_em).toLocaleString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
