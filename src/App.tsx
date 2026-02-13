
import { Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { useAuth } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { TeamsPage } from './pages/TeamsPage';
import { PlayersPage } from './pages/PlayersPage';
import { FormationsPage } from './pages/FormationsPage';
import { MatchesPage } from './pages/MatchesPage';

/** Rota protegida — redireciona para home se não logado */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <div className="h-screen landscape:h-auto landscape:min-h-screen landscape:lg:h-screen max-w-[1440px] mx-auto bg-gray-900 flex flex-col overflow-hidden landscape:overflow-auto landscape:lg:overflow-hidden">
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/equipes" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
        <Route path="/jogadores" element={<ProtectedRoute><PlayersPage /></ProtectedRoute>} />
        <Route path="/formacoes" element={<ProtectedRoute><FormationsPage /></ProtectedRoute>} />
        <Route path="/jogo" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
        <Route path="/partidas" element={<ProtectedRoute><MatchesPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </div>
  )
}

export default App
