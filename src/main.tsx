import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// HashRouter (não BrowserRouter): GitHub Pages não sabe rotear /admin nativamente
// (é um host de arquivos estáticos, sem rewrite de servidor). Com hash (#/admin)
// o navegador nunca pede essa rota ao servidor, então não há 404 a contornar —
// e continua funcionando sem mudança quando migrarmos pra um domínio próprio.
import { HashRouter } from 'react-router-dom'
import './styles/global.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
