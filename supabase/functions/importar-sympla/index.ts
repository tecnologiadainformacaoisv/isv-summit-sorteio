// Supabase Edge Function (Deno) — importação de participantes da Sympla.
//
// Roda no servidor, nunca no bundle do frontend: o token da Sympla e a
// service_role key ficam só aqui, configurados via `supabase secrets set`.
// Chamada a partir de /admin/importacao (usuário já autenticado) via
// `supabase.functions.invoke('importar-sympla')`.
//
// Formato real da API (v3) confirmado em 2026-09-02 contra o evento ISV
// Summit 2026 (event_id 3538071): ver comentários inline.

import { createClient } from 'jsr:@supabase/supabase-js@2'

interface SymplaCustomFormItem {
  id: number
  name: string
  value: string
}

interface SymplaParticipant {
  id: number
  first_name: string
  last_name: string
  email: string
  custom_form: SymplaCustomFormItem[]
}

interface SymplaPagination {
  has_next: boolean
  has_prev: boolean
  quantity: number
  offset: number
  page: number
  page_size: number
  total_page: number
}

interface SymplaParticipantsResponse {
  data: SymplaParticipant[]
  pagination: SymplaPagination
}

// Nome do campo customizado de "setor" no formulário de inscrição do evento.
// Nenhum participante importado até agora tem custom_form preenchido (o
// formulário ainda não tem esse campo configurado) — ajustar aqui assim que
// o campo existir e checar o `name` real que a Sympla retorna.
const SETOR_CAMPO_CUSTOMIZADO = 'Setor'

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
        { error: 'SYMPLA_API_TOKEN / SYMPLA_EVENT_ID não configurados nos secrets da função.' },
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
        p.custom_form.find((c) => c.name === SETOR_CAMPO_CUSTOMIZADO)?.value ?? null
      const symplaId = String(p.id)

      const { data: existente } = await admin
        .from('participantes')
        .select('id')
        .eq('sympla_participant_id', symplaId)
        .maybeSingle()

      const { error } = await admin.from('participantes').upsert(
        {
          sympla_participant_id: symplaId,
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
  let page = 1

  while (true) {
    const url = `https://api.sympla.com.br/public/v3/events/${eventId}/participants?page=${page}`
    const resposta = await fetch(url, { headers: { s_token: token } })
    if (!resposta.ok) {
      throw new Error(`Falha ao consultar a API da Sympla (status ${resposta.status}).`)
    }
    const corpo: SymplaParticipantsResponse = await resposta.json()
    participantes.push(...corpo.data)

    if (!corpo.pagination?.has_next) break
    page += 1
  }

  return participantes
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
