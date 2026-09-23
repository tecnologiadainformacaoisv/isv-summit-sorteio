/**
 * Efeitos sonoros do sorteio — arquivos em src/assets/sons/, baixados do
 * Mixkit (licença "Sound Effects Free License": uso comercial livre, sem
 * exigir atribuição — https://mixkit.co/license/).
 *
 * Usa <audio> nativo em vez de uma lib (Howler/use-sound): mais simples e
 * mais previsível pra um efeito de "toca uma vez" — sem depender de fila de
 * carregamento de biblioteca nenhuma. O elemento é criado uma única vez (no
 * carregamento do módulo) para cada som, então quando o botão de sortear é
 * clicado o arquivo já teve chance de começar a baixar bem antes de tocar.
 */
import giroUrl from '../assets/sons/giro-roleta.mp3'
import aplausosUrl from '../assets/sons/aplausos-vitoria.mp3'

function criarTocador(url: string, volume: number) {
  const audio = new Audio(url)
  audio.volume = volume
  audio.preload = 'auto'

  return () => {
    // Reinicia do começo mesmo se já tiver tocado antes (permite sortear
    // vários prêmios em sequência sem o som ficar "preso" no fim do anterior).
    audio.currentTime = 0
    audio.play().catch(() => {
      // Autoplay bloqueado pelo navegador ou outro erro — não deve travar o
      // sorteio por causa disso, só fica mudo silenciosamente.
    })
  }
}

export const tocarSomGiro = criarTocador(giroUrl, 0.5)
export const tocarSomVitoria = criarTocador(aplausosUrl, 0.7)
