import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Premio } from '../types/database'

export function usePremios() {
  const [premios, setPremios] = useState<Premio[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const recarregar = useCallback(async () => {
    setCarregando(true)
    const { data, error } = await supabase
      .from('premios')
      .select('*')
      .order('ordem', { ascending: true, nullsFirst: false })
      .order('criado_em', { ascending: true })

    if (error) setErro(error.message)
    else setPremios(data ?? [])
    setCarregando(false)
  }, [])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  return { premios, carregando, erro, recarregar }
}
