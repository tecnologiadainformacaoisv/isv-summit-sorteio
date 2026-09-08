import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Caminho relativo: funciona tanto na URL de projeto do GitHub Pages
  // (usuario.github.io/isv-summit-sorteio/) quanto num domínio próprio depois,
  // sem precisar trocar essa config quando isso acontecer.
  base: './',
})
