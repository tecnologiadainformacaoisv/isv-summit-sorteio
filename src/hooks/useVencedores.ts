import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { SorteioComVencedor } from '../types/database'

/** Histórico de sorteios já realizados, com o vencedor resolvido via join. */
export function useVencedores() {
  const [vencedores, setVencedores] = useState<SorteioComVencedor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const recarregar = useCallback(async () => {
    setCarregando(true)
    const { data, error } = await supabase
      .from('sorteios')
      .select('*, participante:participantes_publico(id, nome, setor_texto)')
      .order('realizado_em', { ascending: false })

    if (error) setErro(error.message)
    else setVencedores((data as unknown as SorteioComVencedor[]) ?? [])
    setCarregando(false)
  }, [])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  return { vencedores, carregando, erro, recarregar }
}
