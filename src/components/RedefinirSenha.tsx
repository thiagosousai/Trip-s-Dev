import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { Usuario } from '../types'

interface RedefinirSenhaProps {
  usuarios: Usuario[]
  onRedefinirSenha: (email: string, novaSenha: string) => void
}

function RedefinirSenha({ usuarios, onRedefinirSenha }: RedefinirSenhaProps) {
  const [searchParams] = useSearchParams()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const navigate = useNavigate()

  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''
  const usuario = usuarios.find((u) => u.email === email)
  const tokenValido = Boolean(token && token.startsWith('reset-'))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')

    if (!email || !tokenValido) {
      setErro('Link de recuperação inválido ou expirado.')
      return
    }

    if (!usuario) {
      setErro('Nenhuma conta foi encontrada para este e-mail.')
      return
    }

    if (!novaSenha || novaSenha.length < 6) {
      setErro('A nova senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (novaSenha !== confirmacao) {
      setErro('As senhas não coincidem.')
      return
    }

    onRedefinirSenha(email, novaSenha)
    setSucesso('Senha alterada com sucesso. Você já pode fazer login com a nova senha.')
    setNovaSenha('')
    setConfirmacao('')
  }

  return (
    <div className="card auth-card">
      <p className="eyebrow eyebrow-dark">Recuperação de senha</p>
      <h2>Defina uma nova senha</h2>
      <p className="subtitle">
        {usuario ? `Crie uma nova senha para ${usuario.email}.` : 'Use o link recebido por e-mail para continuar.'}
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          Nova senha
          <input
            type="password"
            placeholder="Digite sua nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
        </label>
        <label>
          Confirmar senha
          <input
            type="password"
            placeholder="Repita a senha"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
          />
        </label>
        {erro && <p className="erro">{erro}</p>}
        {sucesso && <p className="mensagem-recuperacao">{sucesso}</p>}
        <button type="submit">Salvar nova senha</button>
      </form>

      <p className="link-row">
        <Link to="/login">Voltar para o login</Link>
      </p>
    </div>
  )
}

export default RedefinirSenha
