import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Cadastro from './components/Cadastro'
import Home from './components/Home'
import Login from './components/Login'
import type { Usuario } from './types'
import './App.css'

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(() => {
    const sessao = localStorage.getItem('trip_usuario_logado')
    return sessao ? JSON.parse(sessao) : null
  })

  const atualizarSessao = (usuario: Usuario | null) => {
    setUsuarioLogado(usuario)
    if (usuario) {
      localStorage.setItem('trip_usuario_logado', JSON.stringify(usuario))
    } else {
      localStorage.removeItem('trip_usuario_logado')
    }
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/cadastro" element={usuarioLogado ? <Navigate to="/home" replace /> : <Cadastro />} />
          <Route path="/login" element={usuarioLogado ? <Navigate to="/home" replace /> : <Login onLogin={atualizarSessao} />} />
          <Route
            path="/home"
            element={
              usuarioLogado ? (
                <Home usuarioLogado={usuarioLogado} onSair={() => atualizarSessao(null)} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
