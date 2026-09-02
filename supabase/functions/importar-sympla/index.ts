// Supabase Edge Function (Deno) — importação de participantes da Sympla.
//
// Roda no servidor, nunca no bundle do frontend: o token da Sympla e a
// service_role key ficam só aqui, configurados via `supabase secrets set`.
// Chamada a partir de /admin/importacao (usuário já autenticado) via
// `supabase.functions.invoke('importar-sympla')`.
//
// PENDÊNCIA: SYMPLA_API_TOKEN e SYMPLA_EVENT_ID ainda não foram gerados pelo
// ISV. Até lá, esta função responde 500 com uma mensagem clara em vez de
// falhar silenciosamente — use db/03_seed_dev.sql para testar o resto do
// fluxo enquanto isso.

import { createClient } from 'jsr:@supabase/supabase-js@2'

interface SymplaParticipant {
  id: string
  first_name: string
  last_name: string
  email: string
  // Campo customizado do formulário de inscrição do evento — o nome exato da
  // chave depende de como o formulário da Sympla foi configurado; ajustar
  // aqui assim que tivermos acesso real à API para conferir o payload.
  custom_fields?: Array<{ name: string; value: string }>
}

interface SymplaParticipantsResponse {
  data: SymplaParticipant[]
  pagination?: { next?: string | null }
}

const SETOR_CAMPO_CUSTOMIZADO = 'Setor' // ajustar conforme o formulário real da Sympla

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Não autenticado.' }, 401)
    }

    const symplaToken = Deno.env.get('SYMPLA_API_TOKEN')
    const eventId = Deno.env.get('SYMPLA_EVENT_ID')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!symplaToken || !eventId) {
      return jsonResponse(
        {
          error:
            'SYMPLA_API_TOKEN / SYMPLA_EVENT_ID não configurados. Pendência: gerar o token na conta Sympla do ISV e rodar `supabase secrets set`.',
        },
        500,
      )
    }
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: 'Configuração do Supabase ausente no runtime da função.' }, 500)
    }

    // Valida que quem chamou está autenticado (RLS de escrita já cobriria,
    // mas falhar cedo aqui evita bater na API da Sympla sem necessidade).
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser()
    if (userError || !userData.user) {
      return jsonResponse({ error: 'Sessão inválida.' }, 401)
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    const participantes = await buscarTodosParticipantes(eventId, symplaToken)

    let criados = 0
    let atualizados = 0

    for (const p of participantes) {
      const nome = `${p.first_name} ${p.last_name}`.trim()
      const setor_texto =
        p.custom_fields?.find((c) => c.name === SETOR_CAMPO_CUSTOMIZADO)?.value ?? null

      const { data: existente } = await admin
        .from('participantes')
        .select('id')
        .eq('sympla_participant_id', p.id)
        .maybeSingle()

      const { error } = await admin.from('participantes').upsert(
        {
          sympla_participant_id: p.id,
          nome,
          email: p.email,
          setor_texto,
        },
        { onConflict: 'sympla_participant_id' },
      )

      if (error) throw error
      if (existente) atualizados++
      else criados++
    }

    return jsonResponse({ criados, atualizados })
  } catch (erro) {
    console.error(erro)
    return jsonResponse({ error: erro instanceof Error ? erro.message : 'Erro desconhecido.' }, 500)
  }
})

async function buscarTodosParticipantes(eventId: string, token: string): Promise<SymplaParticipant[]> {
  const participantes: SymplaParticipant[] = []
  // Endpoint documentado pela Sympla para listar participantes de um evento.
  // Confirmar paginação exata (cursor vs. page) assim que tivermos o token real.
  let url: string | null = `https://api.sympla.com.br/public/v3/events/${eventId}/participants`

  while (url) {
    const resposta: Response = await fetch(url, { headers: { s_token: token } })
    if (!resposta.ok) {
      throw new Error(`Falha ao consultar a API da Sympla (status ${resposta.status}).`)
    }
    const corpo: SymplaParticipantsResponse = await resposta.json()
    participantes.push(...corpo.data)
    url = corpo.pagination?.next ?? null
  }

  return participantes
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
