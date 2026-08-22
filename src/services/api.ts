const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface UsuarioApi {
  id: number
  nome: string
  email: string
}

export interface UsuarioCadastro {
  nome: string
  email: string
  senha: string
}

export interface Viagem {
  id: number
  usuarioId: number
  destino: string
  dataInicio: string
  dataFim: string
  observacoes: string
  roteiro: RoteiroItem[]
}

export interface RoteiroItem {
  id: number
  titulo: string
  data: string
  hora: string
  detalhes: string
  categoria: string
  local: string
  custo: number
}

export interface ViagemCadastro {
  usuarioId: number
  destino: string
  dataInicio: string
  dataFim: string
  observacoes?: string
}

export interface RoteiroCadastro {
  usuarioId: number
  titulo: string
  data: string
  hora?: string
  detalhes?: string
  categoria?: string
  local?: string
  custo?: string
}

export async function listarUsuarios(): Promise<UsuarioApi[]> {
  const resp = await fetch(`${API_URL}/usuarios`)
  if (!resp.ok) {
    throw new Error('Falha ao carregar usuários.')
  }
  return resp.json()
}

export async function cadastrarUsuario(dados: UsuarioCadastro): Promise<UsuarioApi> {
  const resp = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })

  const corpo = await resp.json()
  if (!resp.ok) {
    throw new Error(corpo.erro || 'Erro ao cadastrar.')
  }

  return corpo
}

export async function excluirConta(usuarioId: number): Promise<void> {
  const resp = await fetch(`${API_URL}/usuarios/${usuarioId}`, { method: 'DELETE' })
  if (!resp.ok) {
    const corpo = await resp.json()
    throw new Error(corpo.erro || 'Erro ao excluir conta.')
  }
}

export async function fazerLogin(email: string, senha: string): Promise<UsuarioApi> {
  const resp = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  })

  const corpo = await resp.json()
  if (!resp.ok) {
    throw new Error(corpo.erro || 'Erro ao entrar.')
  }

  return corpo
}

export async function listarViagens(usuarioId: number): Promise<Viagem[]> {
  const resp = await fetch(`${API_URL}/viagens?usuarioId=${usuarioId}`)
  if (!resp.ok) throw new Error('Falha ao carregar viagens.')
  return resp.json()
}

export async function cadastrarViagem(dados: ViagemCadastro): Promise<Viagem> {
  const resp = await fetch(`${API_URL}/viagens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  const corpo = await resp.json()
  if (!resp.ok) throw new Error(corpo.erro || 'Erro ao cadastrar viagem.')
  return corpo
}

export async function atualizarViagem(id: number, dados: ViagemCadastro): Promise<Viagem> {
  const resp = await fetch(`${API_URL}/viagens/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  const corpo = await resp.json()
  if (!resp.ok) throw new Error(corpo.erro || 'Erro ao atualizar viagem.')
  return corpo
}

export async function excluirViagem(id: number, usuarioId: number): Promise<void> {
  const resp = await fetch(`${API_URL}/viagens/${id}?usuarioId=${usuarioId}`, { method: 'DELETE' })
  if (!resp.ok) {
    const corpo = await resp.json()
    throw new Error(corpo.erro || 'Erro ao excluir viagem.')
  }
}

export async function cadastrarRoteiro(viagemId: number, dados: RoteiroCadastro): Promise<RoteiroItem> {
  const resp = await fetch(`${API_URL}/viagens/${viagemId}/roteiro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  const corpo = await resp.json()
  if (!resp.ok) throw new Error(corpo.erro || 'Erro ao adicionar atividade.')
  return corpo
}

export async function excluirRoteiro(viagemId: number, atividadeId: number, usuarioId: number): Promise<void> {
  const resp = await fetch(`${API_URL}/viagens/${viagemId}/roteiro/${atividadeId}?usuarioId=${usuarioId}`, { method: 'DELETE' })
  if (!resp.ok) throw new Error('Erro ao excluir atividade.')
}

export async function atualizarRoteiro(viagemId: number, atividadeId: number, dados: RoteiroCadastro): Promise<RoteiroItem> {
  const resp = await fetch(`${API_URL}/viagens/${viagemId}/roteiro/${atividadeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  const corpo = await resp.json()
  if (!resp.ok) throw new Error(corpo.erro || 'Erro ao atualizar atividade.')
  return corpo
}
