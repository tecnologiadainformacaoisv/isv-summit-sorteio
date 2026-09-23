import { useState } from 'react'
import type { FormEvent } from 'react'
import { ImageOff, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePremios } from '../../hooks/usePremios'
import { supabase } from '../../lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/AlertDialog'

/** CRUD de prêmios: nome + upload de imagem no Supabase Storage (bucket "premios"). */
export function PremiosPage() {
  const { premios, carregando, recarregar } = usePremios()
  const [nome, setNome] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      let imagem_url: string | null = null

      if (arquivo) {
        const caminho = `${crypto.randomUUID()}-${arquivo.name}`
        const { error: erroUpload } = await supabase.storage.from('premios').upload(caminho, arquivo)
        if (erroUpload) throw erroUpload
        imagem_url = supabase.storage.from('premios').getPublicUrl(caminho).data.publicUrl
      }

      const { error: erroInsert } = await supabase.from('premios').insert({ nome, imagem_url })
      if (erroInsert) throw erroInsert

      setNome('')
      setArquivo(null)
      await recarregar()
      toast.success(`"${nome}" adicionado.`)
    } catch (e) {
      toast.error('Erro ao cadastrar prêmio', { description: e instanceof Error ? e.message : undefined })
    } finally {
      setEnviando(false)
    }
  }

  async function excluir(id: string, nomePremio: string) {
    const { error } = await supabase.from('premios').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir prêmio', { description: error.message })
      return
    }
    toast.success(`"${nomePremio}" excluído.`)
    recarregar()
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">Prêmios</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="nome-premio">Nome do prêmio</Label>
              <Input id="nome-premio" required value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="imagem-premio">Imagem</Label>
              <input
                id="imagem-premio"
                type="file"
                accept="image/*"
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                className="block text-xs file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-secondary-foreground"
              />
            </div>
            <Button type="submit" disabled={enviando}>
              {enviando ? <Loader2 className="animate-spin" /> : <Plus />}
              {enviando ? 'Salvando…' : 'Adicionar prêmio'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {carregando ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : premios.length === 0 ? (
        <p className="text-muted-foreground">Nenhum prêmio cadastrado ainda.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {premios.map((p) => (
            <Card key={p.id} className="overflow-hidden py-0">
              <div className="flex aspect-video items-center justify-center bg-muted">
                {p.imagem_url ? (
                  <img src={p.imagem_url} alt={p.nome} className="h-full w-full object-cover" />
                ) : (
                  <ImageOff className="size-6 text-muted-foreground" />
                )}
              </div>
              <CardHeader className="pb-0">
                <CardTitle className="text-base">{p.nome}</CardTitle>
              </CardHeader>
              <CardFooter className="justify-between pt-3">
                <Badge variant={p.status === 'aberto' ? 'success' : 'secondary'} className="capitalize">
                  {p.status}
                </Badge>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                      <Trash2 /> Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir "{p.nome}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Essa ação não pode ser desfeita. Se esse prêmio já tiver sido sorteado, o
                        histórico do vencedor também será perdido.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => excluir(p.id, p.nome)}
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
