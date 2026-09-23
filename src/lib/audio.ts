/**
 * Efeitos sonoros do sorteio — arquivos em src/assets/sons/, baixados do
 * Mixkit (licença "Sound Effects Free License": uso comercial livre, sem
 * exigir atribuição — https://mixkit.co/license/).
 */
import clickUrl from '../assets/sons/click-roleta.mp3'
import aplausosUrl from '../assets/sons/aplausos-vitoria.mp3'

/**
 * "Clique" da roleta — tocado via Web Audio API (não <audio>/HTMLMediaElement).
 * O `<audio>.play()` tem uma latência de dezenas a ~150ms pra decodificar e
 * começar a tocar, perceptível quando o som precisa estar exatamente no
 * instante do cruzamento de cada fatia — daí o "áudio atrasado". Com Web
 * Audio, o arquivo já é decodificado em memória (AudioBuffer) UMA vez no
 * carregamento do módulo, e cada clique só agenda esse buffer já pronto pra
 * tocar (`source.start(0)`), o que é quase instantâneo.
 */
const AudioContextCtor = window.AudioContext ?? (window as any).webkitAudioContext
const contexto: AudioContext | null = AudioContextCtor ? new AudioContextCtor() : null

let bufferClique: AudioBuffer | null = null
if (contexto) {
  fetch(clickUrl)
    .then((resp) => resp.arrayBuffer())
    .then((dados) => contexto.decodeAudioData(dados))
    .then((buffer) => {
      bufferClique = buffer
    })
    .catch(() => {
      // Sem áudio de clique se algo falhar ao carregar/decodificar — não deve
      // travar o sorteio por causa disso.
    })
}

export function tocarClique() {
  if (!contexto || !bufferClique) return
  // Navegadores suspendem o AudioContext até haver interação do usuário;
  // como isso só é chamado a partir do clique em "Sortear", já é seguro
  // retomar aqui.
  if (contexto.state === 'suspended') contexto.resume()

  const fonte = contexto.createBufferSource()
  fonte.buffer = bufferClique
  const ganho = contexto.createGain()
  ganho.gain.value = 0.45
  fonte.connect(ganho).connect(contexto.destination)
  fonte.start(0)
}

const audioVitoria = new Audio(aplausosUrl)
audioVitoria.volume = 0.7
audioVitoria.preload = 'auto'

export function tocarSomVitoria() {
  audioVitoria.currentTime = 0
  audioVitoria.play().catch(() => {})
}
