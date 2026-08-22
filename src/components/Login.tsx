import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fazerLogin } from '../services/api'
import type { Usuario } from '../types'

interface LoginProps {
  onLogin: (usuario: Usuario) => void
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const usuario = await fazerLogin(email, senha)
      onLogin(usuario)
      navigate('/home', { replace: true })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao entrar.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="login-card">
        <section className="login-visual">
          <div className="login-brand"><span className="brand-logo">T</span><strong>Trip's Dev</strong></div>
          <div className="login-visual-copy">
            <p>Seu próximo destino começa aqui.</p>
            <h1>Viaje com mais intenção.</h1>
            <span>Planeje experiências memoráveis, organize cada detalhe e aproveite o caminho.</span>
          </div>
          <div className="login-quote"><span>“</span><p>Uma boa viagem começa muito antes do embarque.</p></div>
        </section>

        <section className="login-form-panel">
          <div className="login-form-content">
            <div className="mobile-login-brand"><span className="brand-logo">T</span><strong>Trip's Dev</strong></div>
            <p className="eyebrow eyebrow-dark">Bem-vindo de volta</p>
            <h2>Entre na sua conta</h2>
            <p className="subtitle">Continue planejando momentos que ficam para sempre.</p>

            <form onSubmit={handleSubmit}>
              <label>
                E-mail
                <input autoComplete="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label>
                Senha
                <span className="password-field">
                  <input autoComplete="current-password" placeholder="Digite sua senha" type={senhaVisivel ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} />
                  <button type="button" className="password-toggle" onClick={() => setSenhaVisivel((visivel) => !visivel)} aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'} title={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}>
                    👁
                  </button>
                </span>
              </label>
              {erro && <p className="erro login-error">{erro}</p>}
              <button className="login-submit" type="submit" disabled={carregando}>
                {carregando ? 'Entrando...' : 'Entrar na conta'}
                {!carregando && <span aria-hidden="true">→</span>}
              </button>
            </form>
            <p className="link-row login-link-row">Ainda não tem uma conta? <Link to="/cadastro">Criar conta</Link></p>
            <div className="login-security"><span className="security-dot" /> Seus dados ficam protegidos e privados</div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Login
