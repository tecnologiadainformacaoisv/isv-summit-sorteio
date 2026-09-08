import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

/** Sessão do Supabase Auth — usado para proteger as rotas /admin/* e "/". */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session)
      })
      .catch((e) => {
        // Sem isso, uma falha de rede (ex: conexão instável no dia do evento)
        // deixava `carregando` travado em `true` pra sempre, e a tela ficava
        // em branco sem loading nem conteúdo, sem explicação pro operador.
        setErro(e instanceof Error ? e.message : 'Falha ao verificar sessão.')
      })
      .finally(() => setCarregando(false))

    const { data: listener } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSession(novaSessao)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return {
    session,
    autenticado: Boolean(session),
    carregando,
    erro,
    entrar: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    sair: () => supabase.auth.signOut(),
  }
}
