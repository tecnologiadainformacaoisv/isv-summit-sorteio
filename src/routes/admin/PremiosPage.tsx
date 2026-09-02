import { useState } from 'react'
import type { FormEvent } from 'react'
import { usePremios } from '../../hooks/usePremios'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'

/** CRUD de prêmios: nome + upload de imagem no Supabase Storage (bucket "premios"). */
export function PremiosPage() {
  const { premios, carregando, recarregar } = usePremios()
  const [nome, setNome] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
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
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao cadastrar prêmio.')
    } finally {
      setEnviando(false)
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este prêmio?')) return
    await supabase.from('premios').delete().eq('id', id)
    recarregar()
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">Prêmios</h1>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-3 rounded-summit bg-white p-4 shadow-summit">
        <label className="flex-1 text-sm">
          Nome do prêmio
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1 w-full rounded-summit-sm border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Imagem
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            className="mt-1 block text-xs"
          />
        </label>
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Adicionar prêmio'}
        </Button>
      </form>
      {erro && <p className="mb-4 text-sm font-semibold text-red-600">{erro}</p>}

      {carregando ? (
        <p>Carregando…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {premios.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-summit bg-white shadow-summit">
              <div className="aspect-video bg-slate-100">
                {p.imagem_url && <img src={p.imagem_url} alt={p.nome} className="h-full w-full object-cover" />}
              </div>
              <div className="flex items-center justify-between p-3">
                <div>
                  <p className="font-semibold">{p.nome}</p>
                  <p className="text-xs text-slate-500 capitalize">{p.status}</p>
                </div>
                <button onClick={() => excluir(p.id)} className="text-xs font-semibold text-red-600 hover:underline">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
