import { Route, Routes } from 'react-router-dom'
import { SorteioPage } from './routes/SorteioPage'
import { AdminLayout } from './routes/admin/AdminLayout'
import { LoginPage } from './routes/admin/LoginPage'
import { AdminHome } from './routes/admin/AdminHome'
import { ParticipantesPage } from './routes/admin/ParticipantesPage'
import { PremiosPage } from './routes/admin/PremiosPage'
import { VencedoresPage } from './routes/admin/VencedoresPage'
import { ImportacaoSymplaPage } from './routes/admin/ImportacaoSymplaPage'
import { RequireAuth } from './components/auth/RequireAuth'

function App() {
  return (
    <Routes>
      {/* Gravar um sorteio exige usuário autenticado (RLS) — quem opera o
          telão precisa estar logado, mesmo essa não sendo uma tela "de admin". */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <SorteioPage />
          </RequireAuth>
        }
      />

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
