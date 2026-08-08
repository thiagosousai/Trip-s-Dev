import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import Cadastro from './components/Cadastro'
import Home from './components/Home'
import Login from './components/Login'
import type { Usuario } from './types'
import './App.css'

const STORAGE_KEY = 'trip-dev-usuarios'

function App() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    if (typeof window === 'undefined') {
      return []
    }

    try {
      const salvo = window.localStorage.getItem(STORAGE_KEY)
      if (!salvo) {
        return []
      }

      const dados = JSON.parse(salvo) as Usuario[]
      return Array.isArray(dados) ? dados : []
    } catch {
      return []
    }
  })
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios))
  }, [usuarios])

  function cadastrar(novo: Omit<Usuario, 'id'>) {
    const proximoId = Math.max(0, ...usuarios.map((u) => u.id)) + 1
    setUsuarios([...usuarios, { id: proximoId, ...novo }])
  }

  return (
    <BrowserRouter>
      <div className="travel-app">
        <section className="travel-hero">
          <header className="hero-topbar">
            <div className="brand-mark">Trip's Dev</div>
            <nav className="hero-nav">
              <Link to="/login">Entrar</Link>
              <Link to="/cadastro" className="nav-pill">Criar conta</Link>
            </nav>
          </header>

          <div className="hero-content">
            <p className="hero-tag">✦ Explore o mundo</p>
            <h1>O mundo é um livro, e quem não viaja lê apenas uma página.</h1>
            <p className="hero-subtitle">
              Planeje suas aventuras, descubra novos destinos e viva experiências inesquecíveis.
            </p>
            <div className="hero-stats">
              <span>🌍 190+ países</span>
              <span>✈️ 50k viajantes</span>
              <span>⭐ 4.9 avaliação</span>
            </div>
          </div>
        </section>

        <section className="travel-form-panel">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/cadastro" element={<Cadastro usuarios={usuarios} onCadastrar={cadastrar} />} />
            <Route path="/login" element={<Login usuarios={usuarios} onLogin={setUsuarioLogado} />} />
            <Route
              path="/home"
              element={
                usuarioLogado ? (
                  <Home usuarioLogado={usuarioLogado} usuarios={usuarios} onSair={() => setUsuarioLogado(null)} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </section>
      </div>
    </BrowserRouter>
  )
}

export default App
