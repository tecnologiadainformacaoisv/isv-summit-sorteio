/**
 * Efeitos sonoros do sorteio — arquivos em src/assets/sons/, baixados do
 * Mixkit (licença "Sound Effects Free License": uso comercial livre, sem
 * exigir atribuição — https://mixkit.co/license/).
 */
import useSound from 'use-sound'
import giroRoleta from '../assets/sons/giro-roleta.mp3'
import aplausosVitoria from '../assets/sons/aplausos-vitoria.mp3'

/** Toca uma vez quando a roleta começa a girar. */
export function useSomGiro() {
  return useSound(giroRoleta, { volume: 0.5 })
}

/** Aplausos, tocados na revelação do vencedor. */
export function useSomVitoria() {
  return useSound(aplausosVitoria, { volume: 0.7 })
}
