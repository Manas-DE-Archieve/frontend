import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import LoginModal from './components/LoginModal'
import HomePage from './pages/HomePage'
import PersonPage from './pages/PersonPage'
import ChatPage from './pages/ChatPage'
import DocumentsPage from './pages/DocumentsPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'

function ProtectedRoute({ children, roles, onOpenLogin }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="text-center py-20 text-slate-400">Загрузка...</div>
  if (!user) {
    if (onOpenLogin) { onOpenLogin(); return <Navigate to="/" replace /> }
    return <Navigate to="/login" replace />
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7fafc' }}>
      <Navbar onOpenLogin={() => setLoginOpen(true)} />
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/persons/:id" element={<PersonPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/admin" element={
            <ProtectedRoute roles={['moderator', 'super_admin']} onOpenLogin={() => setLoginOpen(true)}>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}