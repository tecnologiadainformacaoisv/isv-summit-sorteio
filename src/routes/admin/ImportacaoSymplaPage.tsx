import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

interface ResumoImportacao {
  criados: number
  atualizados: number
}

/**
 * Dispara a Edge Function `importar-sympla`, que faz a chamada autenticada à
 * API da Sympla no servidor (token nunca chega ao frontend) e grava/atualiza
 * os participantes de forma idempotente (por sympla_participant_id).
 */
export function ImportacaoSymplaPage() {
  const [rodando, setRodando] = useState(false)
  const [resumo, setResumo] = useState<ResumoImportacao | null>(null)

  async function importar() {
    setRodando(true)
    setResumo(null)
    try {
      const { data, error } = await supabase.functions.invoke<ResumoImportacao>('importar-sympla')
      if (error) throw error
      setResumo(data)
      toast.success('Importação concluída', {
        description: `${data?.criados ?? 0} participante(s) criado(s), ${data?.atualizados ?? 0} atualizado(s).`,
      })
    } catch (e) {
      toast.error('Erro ao importar participantes da Sympla', {
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setRodando(false)
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">Importação Sympla</h1>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Sincronizar cadastro</CardTitle>
          <CardDescription>
            Importa (ou atualiza) o cadastro de participantes do evento ISV Summit 2026 diretamente
            da Sympla. Pode ser executada quantas vezes forem necessárias — participantes já
            importados são atualizados, nunca duplicados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={importar} disabled={rodando}>
            {rodando ? <Loader2 className="animate-spin" /> : <Download />}
            {rodando ? 'Importando…' : 'Importar participantes agora'}
          </Button>

          {resumo && (
            <p className="mt-4 text-sm font-semibold text-primary">
              {resumo.criados} participante(s) criado(s), {resumo.atualizados} atualizado(s).
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
