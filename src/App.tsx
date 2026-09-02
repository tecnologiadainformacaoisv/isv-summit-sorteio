import { Route, Routes } from 'react-router-dom'
import { SorteioPage } from './routes/SorteioPage'
import { AdminLayout } from './routes/admin/AdminLayout'
import { LoginPage } from './routes/admin/LoginPage'
import { AdminHome } from './routes/admin/AdminHome'
import { ParticipantesPage } from './routes/admin/ParticipantesPage'
import { PremiosPage } from './routes/admin/PremiosPage'
import { VencedoresPage } from './routes/admin/VencedoresPage'
import { ImportacaoSymplaPage } from './routes/admin/ImportacaoSymplaPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<SorteioPage />} />

      <Route path="/admin/login" element={<LoginPage />} />
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
