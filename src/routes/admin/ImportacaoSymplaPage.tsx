import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'

interface ResumoImportacao {
  criados: number
  atualizados: number
}

/**
 * Dispara a Edge Function `importar-sympla`, que faz a chamada autenticada à
 * API da Sympla no servidor (token nunca chega ao frontend) e grava/atualiza
 * os participantes de forma idempotente (por sympla_participant_id).
 *
 * PENDÊNCIA: token e event ID da Sympla ainda não foram gerados — até lá,
 * esta chamada falha com erro de configuração ausente no lado da função.
 * Use db/03_seed_dev.sql para testar o restante do fluxo enquanto isso.
 */
export function ImportacaoSymplaPage() {
  const [rodando, setRodando] = useState(false)
  const [resumo, setResumo] = useState<ResumoImportacao | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function importar() {
    setRodando(true)
    setErro(null)
    setResumo(null)
    try {
      const { data, error } = await supabase.functions.invoke<ResumoImportacao>('importar-sympla')
      if (error) throw error
      setResumo(data)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao importar participantes da Sympla.')
    } finally {
      setRodando(false)
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">Importação Sympla</h1>
      <p className="mb-6 max-w-xl text-sm text-slate-600">
        Importa (ou atualiza) o cadastro de participantes do evento ISV Summit 2026 diretamente da
        Sympla. Pode ser executada quantas vezes forem necessárias — participantes já importados são
        atualizados, nunca duplicados.
      </p>

      <Button onClick={importar} disabled={rodando} className="!text-summit-petroleo-2">
        {rodando ? 'Importando…' : 'Importar participantes agora'}
      </Button>

      {resumo && (
        <p className="mt-4 text-sm font-semibold text-summit-petroleo-1">
          {resumo.criados} participante(s) criado(s), {resumo.atualizados} atualizado(s).
        </p>
      )}
      {erro && <p className="mt-4 text-sm font-semibold text-red-600">{erro}</p>}
    </div>
  )
}
