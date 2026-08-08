import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Usuario } from '../types'

interface CadastroProps {
  usuarios: Usuario[]
  onCadastrar: (novo: Omit<Usuario, 'id'>) => void
}

function Cadastro({ usuarios, onCadastrar }: CadastroProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')

    if (!nome || !email || !senha) {
      setErro('Preencha todos os campos.')
      return
    }

    if (usuarios.some((u) => u.email === email)) {
      setErro('Este e-mail já está cadastrado.')
      return
    }

    onCadastrar({ nome, email, senha })
    navigate('/login')
  }

  return (
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
          <input placeholder="Crie uma senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button type="submit">Cadastrar</button>
      </form>
      <p className="link-row">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  )
}

export default Cadastro
