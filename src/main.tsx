import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// HashRouter (não BrowserRouter): GitHub Pages não sabe rotear /admin nativamente
// (é um host de arquivos estáticos, sem rewrite de servidor). Com hash (#/admin)
// o navegador nunca pede essa rota ao servidor, então não há 404 a contornar —
// e continua funcionando sem mudança quando migrarmos pra um domínio próprio.
import { HashRouter } from 'react-router-dom'
import './styles/global.css'
import App from './App.tsx'

// Versão no título da aba do navegador — dá pra confirmar visualmente se o
// GitHub Pages já está servindo o deploy mais recente sem precisar entrar
// na página (só olhar a aba já mostra, ex: "Sorteio ISV Summit 2026 — v0.3.0").
document.title = `${document.title} — v${__APP_VERSION__}`

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
