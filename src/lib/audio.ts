/**
 * Efeitos sonoros do sorteio — arquivos em src/assets/sons/, baixados do
 * Mixkit (licença "Sound Effects Free License": uso comercial livre, sem
 * exigir atribuição — https://mixkit.co/license/).
 */
import clickUrl from '../assets/sons/click-roleta.mp3'
import aplausosUrl from '../assets/sons/aplausos-vitoria.mp3'

/**
 * "Clique" da roleta passando por cada fatia — tocado UM POR FATIA CRUZADA
 * de verdade (ver WheelSpin.tsx), não um som só esticado. Isso é o que
 * garante que o som acompanha a velocidade real do giro: rápido/picotado no
 * início, naturalmente mais espaçado conforme a roda desacelera de verdade.
 *
 * Usa um pool de vários <audio> porque no início do giro os cliques podem
 * vir bem próximos um do outro (várias fatias cruzadas quase juntas) — um
 * único elemento reiniciado (`currentTime = 0`) cortaria o clique anterior
 * antes dele terminar de tocar.
 */
const TAMANHO_POOL = 6
const poolClick = Array.from({ length: TAMANHO_POOL }, () => {
  const audio = new Audio(clickUrl)
  audio.volume = 0.45
  audio.preload = 'auto'
  return audio
})
let proximoDoPool = 0

export function tocarClique() {
  const audio = poolClick[proximoDoPool]
  proximoDoPool = (proximoDoPool + 1) % TAMANHO_POOL
  audio.currentTime = 0
  audio.play().catch(() => {})
}

const audioVitoria = new Audio(aplausosUrl)
audioVitoria.volume = 0.7
audioVitoria.preload = 'auto'

export function tocarSomVitoria() {
  audioVitoria.currentTime = 0
  audioVitoria.play().catch(() => {})
}
