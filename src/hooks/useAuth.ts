import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

/** Sessão do Supabase Auth — usado para proteger as rotas /admin/*. */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCarregando(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSession(novaSessao)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return {
    session,
    autenticado: Boolean(session),
    carregando,
    entrar: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    sair: () => supabase.auth.signOut(),
  }
}
