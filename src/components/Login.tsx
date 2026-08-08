import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Usuario } from '../types'

interface LoginProps {
  usuarios: Usuario[]
  onLogin: (usuario: Usuario) => void
}

function Login({ usuarios, onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')

    const usuario = usuarios.find((u) => u.email === email && u.senha === senha)

    if (!usuario) {
      setErro('E-mail ou senha inválidos.')
      return
    }

    onLogin(usuario)
    navigate('/home')
  }

  return (
    <div className="card auth-card">
      <p className="eyebrow eyebrow-dark">Bem-vindo de volta</p>
      <h2>Entre para acessar suas viagens</h2>
      <p className="subtitle">Acesse sua conta para continuar sua jornada.</p>

      <form onSubmit={handleSubmit}>
        <label>
          E-mail
          <input placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Senha
          <input placeholder="••••••••" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button type="submit">Entrar</button>
      </form>
      <p className="link-row">
        Não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
    </div>
  )
}

export default Login
