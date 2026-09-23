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
    audio.playbackRate = 1
    audio.currentTime = 0
    audio.play().catch(() => {
      // Autoplay bloqueado pelo navegador ou outro erro — não deve travar o
      // sorteio por causa disso, só fica mudo silenciosamente.
    })
  }
}

/**
 * Som de "catraca girando", com aceleração/desaceleração natural do próprio
 * áudio (~7s de gravação original). Ajusta `playbackRate` pra caber
 * exatamente na duração real do giro da roleta (`duracaoMs`) — se o giro
 * durar mais que os 7s naturais, toca mais devagar (mais grave); se durar
 * menos, mais rápido. Mantém a sensação de "acompanhar a velocidade" da
 * roda mesmo sem gerar tique-taque sintetizado por ângulo percorrido.
 */
const audioGiro = new Audio(giroUrl)
audioGiro.preload = 'auto'
audioGiro.volume = 0.55

export function tocarSomGiro(duracaoMs: number) {
  const duracaoNatural = audioGiro.duration
  audioGiro.playbackRate =
    Number.isFinite(duracaoNatural) && duracaoNatural > 0 ? duracaoNatural / (duracaoMs / 1000) : 1
  audioGiro.currentTime = 0
  audioGiro.play().catch(() => {})
}

export function pararSomGiro() {
  audioGiro.pause()
}

export const tocarSomVitoria = criarTocador(aplausosUrl, 0.7)
