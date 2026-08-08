import { Navigate, useNavigate } from 'react-router-dom'
import type { Usuario } from '../types'

interface HomeProps {
  usuarioLogado: Usuario | null
  usuarios: Usuario[]
  onSair: () => void
}

function Home({ usuarioLogado, usuarios, onSair }: HomeProps) {
  const navigate = useNavigate()

  if (!usuarioLogado) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="card home-card">
      <p className="eyebrow eyebrow-dark">Olá, {usuarioLogado.nome}</p>
      <h2>Pronto para a próxima aventura?</h2>
      <p>
        Conta conectada: <strong>{usuarioLogado.email}</strong>
      </p>
      <div className="user-list">
        <h3>Usuários cadastrados ({usuarios.length})</h3>
        <ul>
          {usuarios.map((u) => (
            <li key={u.id}>
              <span>{u.nome}</span>
              <small>{u.email}</small>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => {
          onSair()
          navigate('/login')
        }}
      >
        Sair
      </button>
    </div>
  )
}

export default Home
