import { Route, Routes } from 'react-router-dom'
import { SorteioPage } from './routes/SorteioPage'
import { AdminLayout } from './routes/admin/AdminLayout'
import { AdminHome } from './routes/admin/AdminHome'
import { ParticipantesPage } from './routes/admin/ParticipantesPage'
import { PremiosPage } from './routes/admin/PremiosPage'
import { VencedoresPage } from './routes/admin/VencedoresPage'
import { ImportacaoSymplaPage } from './routes/admin/ImportacaoSymplaPage'

// Sem login (decisão explícita — "vai ser complicado demais" pra diretoria
// acessar). Isso significa que QUALQUER PESSOA com o link pode sortear,
// editar prêmios/participantes e resetar sorteios, não só quem opera o
// evento. Ver db/05_remover_auth.sql para o que isso mudou no banco.
function App() {
  return (
    <Routes>
      <Route path="/" element={<SorteioPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="participantes" element={<ParticipantesPage />} />
        <Route path="premios" element={<PremiosPage />} />
        <Route path="vencedores" element={<VencedoresPage />} />
        <Route path="importacao" element={<ImportacaoSymplaPage />} />
      </Route>
    </Routes>
  )
}

export default App
