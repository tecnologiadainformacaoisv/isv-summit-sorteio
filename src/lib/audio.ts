/**
 * Wrapper fino sobre use-sound para os efeitos sonoros do sorteio.
 *
 * PENDÊNCIA: nenhum arquivo de áudio foi adicionado ao projeto ainda.
 * Quando tiver o efeito sonoro definido (ex: fanfarra de vitória), coloque o
 * arquivo em `src/assets/sons/fanfarra-vitoria.mp3` e troque o `somUrl` padrão
 * abaixo — até lá, o hook fica mudo (retorna um play() no-op) para não quebrar
 * o build por referenciar um asset inexistente.
 */
import useSound from 'use-sound'

export function useSomVitoria(somUrl?: string) {
  const [play, controls] = useSound(somUrl ?? '', { volume: 0.8, soundEnabled: Boolean(somUrl) })
  return [play, controls] as const
}
