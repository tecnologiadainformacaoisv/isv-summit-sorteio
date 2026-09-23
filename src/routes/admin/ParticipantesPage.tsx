import { useEffect, useState } from 'react'
import { Search, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import type { Participante } from '../../types/database'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

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
    toast.success(p.elegivel ? `${p.nome} desqualificado(a).` : `${p.nome} reabilitado(a).`)
    carregar()
  }

  const filtrados = participantes.filter((p) => p.nome.toLowerCase().includes(filtro.toLowerCase()))
  const elegiveis = participantes.filter((p) => p.elegivel).length

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Participantes</h1>
          <p className="text-sm text-muted-foreground">
            {participantes.length} cadastrados · {elegiveis} elegíveis
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome…"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-64 pl-8"
          />
        </div>
      </div>

      {carregando ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : participantes.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhum participante importado ainda. Use a página{' '}
          <span className="font-semibold text-foreground">Importação Sympla</span> para trazer o
          cadastro do evento.
        </p>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Elegível</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold">{p.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{p.setor_texto ?? '—'}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">{p.tipo}</TableCell>
                  <TableCell>
                    <Badge variant={p.elegivel ? 'success' : 'secondary'}>
                      {p.elegivel ? 'Sim' : 'Não'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => alternarElegibilidade(p)}>
                      {p.elegivel ? <UserX /> : <UserCheck />}
                      {p.elegivel ? 'Desqualificar' : 'Reabilitar'}
                    </Button>
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
