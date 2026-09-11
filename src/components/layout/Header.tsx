import { Link } from 'react-router-dom'
import logoInstitucional from '../../assets/logo-isv-institucional.png'
import logoHub from '../../assets/logo-isv-hub.png'

interface HeaderProps {
  titulo?: string
  subtitulo?: string
}

/**
 * Cabeçalho com o gradiente oficial do Summit. As logos importadas já têm
 * o gradiente do banner embutido no PNG (não são transparentes) — por isso
 * este componente só deve ser usado sobre `bg-summit-gradient`, nunca sobre
 * fundo claro (ver telas de /admin, que usam outra composição para a marca).
 */
export function Header({ titulo = 'ISV Summit 2026', subtitulo = 'Sorteio de prêmios' }: HeaderProps) {
  return (
    <header className="bg-summit-gradient flex flex-wrap items-center justify-between gap-4 px-8 py-5 text-white shadow-lg">
      <div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight hover:underline"
            title="Voltar para a tela inicial"
          >
            {titulo}
          </Link>
          <span
            className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold tracking-wide text-white/80"
            title="Versão publicada (confira se bate com a mais recente após um deploy)"
          >
            v{__APP_VERSION__}
          </span>
        </div>
        <p className="text-sm opacity-80">{subtitulo}</p>
      </div>
      <div className="flex items-center gap-4">
        <img src={logoInstitucional} alt="Instituto São Vicente" className="h-10 w-auto rounded-summit-sm" />
        <img src={logoHub} alt="ISV Hub" className="h-10 w-auto rounded-summit-sm" />
      </div>
    </header>
  )
}
