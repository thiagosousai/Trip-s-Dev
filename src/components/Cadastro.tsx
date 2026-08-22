import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cadastrarUsuario } from '../services/api'

function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()
  const senhaValida = senha.length >= 8 && /[a-z]/.test(senha) && /[A-Z]/.test(senha) && /\d/.test(senha)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')

    if (!nome || !email || !senha) {
      setErro('Preencha todos os campos.')
      return
    }

    if (!senhaValida) {
      setErro('A senha precisa ter 8 caracteres, uma letra maiúscula, uma minúscula e um número.')
      return
    }

    setCarregando(true)

    try {
      await cadastrarUsuario({ nome, email, senha })
      navigate('/login', { replace: true })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="card auth-card">
      <p className="eyebrow eyebrow-dark">Nova experiência</p>
      <h2>Crie sua conta</h2>
      <p className="subtitle">Junte-se à comunidade e comece a planejar.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Nome
          <input placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <label>
          E-mail
          <input placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Senha
          <input placeholder="Crie uma senha forte" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        <p className={`password-hint ${senhaValida ? 'valid' : ''}`}>Use 8+ caracteres com maiúscula, minúscula e número.</p>
        {erro && <p className="erro">{erro}</p>}
        <button type="submit" disabled={carregando}>
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      <p className="link-row">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
      </div>
    </main>
  )
}

export default Cadastro
