import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { atualizarRoteiro, atualizarViagem, cadastrarRoteiro, cadastrarViagem, excluirConta, excluirRoteiro, excluirViagem, listarViagens, type RoteiroItem, type Viagem } from '../services/api'
import type { Usuario } from '../types'

interface HomeProps {
  usuarioLogado: Usuario | null
  onSair: () => void
}

function Home({ usuarioLogado, onSair }: HomeProps) {
  const [viagens, setViagens] = useState<Viagem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [roteiroAberto, setRoteiroAberto] = useState<Viagem | null>(null)
  const [atividadeEditando, setAtividadeEditando] = useState<RoteiroItem | null>(null)
  const [viagemEditando, setViagemEditando] = useState<Viagem | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [novaViagem, setNovaViagem] = useState({ destino: '', dataInicio: '', dataFim: '', observacoes: '' })
  const [novaAtividade, setNovaAtividade] = useState({ titulo: '', data: '', hora: '', categoria: 'Passeio', local: '', custo: '', detalhes: '' })
  const [busca, setBusca] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuarioLogado) {
      navigate('/login', { replace: true })
      return
    }

    listarViagens(usuarioLogado.id || 0)
      .then(setViagens)
      .catch((err) => setErro(err instanceof Error ? err.message : 'Erro ao carregar viagens.'))
      .finally(() => setCarregando(false))
  }, [navigate, usuarioLogado])

  if (!usuarioLogado) {
    return null
  }

  const formatarData = (data: string) => {
    const partes = data?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!partes) return 'Data não definida'
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(
      new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]), 12),
    )
  }

  const salvarViagem = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      const dados = { usuarioId: usuarioLogado.id || 0, ...novaViagem }
      const viagem = viagemEditando ? await atualizarViagem(viagemEditando.id, dados) : await cadastrarViagem(dados)
      setViagens((atuais) => viagemEditando ? atuais.map((atual) => atual.id === viagem.id ? viagem : atual) : [...atuais, viagem])
      setNovaViagem({ destino: '', dataInicio: '', dataFim: '', observacoes: '' })
      setViagemEditando(null)
      setModalAberto(false)
      setMensagem(viagemEditando ? 'Viagem atualizada com sucesso.' : 'Viagem adicionada com sucesso.')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar viagem.')
    } finally {
      setSalvando(false)
    }
  }

  const removerViagem = async (viagem: Viagem) => {
    try {
      await excluirViagem(viagem.id, usuarioLogado.id || 0)
      setViagens((atuais) => atuais.filter((atual) => atual.id !== viagem.id))
      setMensagem('Viagem removida.')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao excluir viagem.')
    }
  }

  const removerConta = async () => {
    const confirmou = window.confirm('Excluir sua conta removerá também todas as suas viagens. Deseja continuar?')
    if (!confirmou) return

    try {
      await excluirConta(usuarioLogado.id || 0)
      onSair()
      navigate('/login', { replace: true })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao excluir conta.')
    }
  }

  const salvarAtividade = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (!roteiroAberto) return
    setSalvando(true)
    setErro('')
    try {
      const dados = { usuarioId: usuarioLogado.id || 0, ...novaAtividade }
      const atividade = atividadeEditando
        ? await atualizarRoteiro(roteiroAberto.id, atividadeEditando.id, dados)
        : await cadastrarRoteiro(roteiroAberto.id, dados)
      const viagemAtualizada = { ...roteiroAberto, roteiro: atividadeEditando ? roteiroAberto.roteiro.map((item) => item.id === atividade.id ? atividade : item) : [...roteiroAberto.roteiro, atividade] }
      setViagens((atuais) => atuais.map((viagem) => viagem.id === roteiroAberto.id ? viagemAtualizada : viagem))
      setRoteiroAberto(viagemAtualizada)
      setNovaAtividade({ titulo: '', data: '', hora: '', categoria: 'Passeio', local: '', custo: '', detalhes: '' })
      setAtividadeEditando(null)
      setMensagem(atividadeEditando ? 'Atividade atualizada.' : 'Atividade adicionada ao roteiro.')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao adicionar atividade.')
    } finally {
      setSalvando(false)
    }
  }

  const removerAtividade = async (viagem: Viagem, atividade: RoteiroItem) => {
    try {
      await excluirRoteiro(viagem.id, atividade.id, usuarioLogado.id || 0)
      const viagemAtualizada = { ...viagem, roteiro: viagem.roteiro.filter((atual) => atual.id !== atividade.id) }
      setViagens((atuais) => atuais.map((item) => item.id === viagem.id ? viagemAtualizada : item))
      setRoteiroAberto(viagemAtualizada)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao excluir atividade.')
    }
  }

  const editarAtividade = (atividade: RoteiroItem) => {
    setAtividadeEditando(atividade)
    setNovaAtividade({ titulo: atividade.titulo || '', data: /^\d{4}-\d{2}-\d{2}$/.test(atividade.data) ? atividade.data : '', hora: atividade.hora || '', categoria: atividade.categoria || 'Passeio', local: atividade.local || '', custo: atividade.custo ? String(atividade.custo) : '', detalhes: atividade.detalhes || '' })
  }

  const abrirEdicao = (viagem: Viagem) => {
    setViagemEditando(viagem)
    setNovaViagem({ destino: viagem.destino, dataInicio: viagem.dataInicio, dataFim: viagem.dataFim, observacoes: viagem.observacoes })
    setModalAberto(true)
  }

  const viagensFiltradas = viagens.filter((viagem) => viagem.destino.toLowerCase().includes(busca.toLowerCase()))
  const hoje = new Date().toISOString().slice(0, 10)
  const viagensOrdenadas = [...viagens].sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))
  const proximaViagem = viagensOrdenadas.find((viagem) => viagem.dataFim >= hoje) || viagensOrdenadas[0]
  const totalAtividades = viagens.reduce((total, viagem) => total + viagem.roteiro.length, 0)
  const custoEstimado = viagens.reduce((total, viagem) => total + viagem.roteiro.reduce((subtotal, atividade) => subtotal + (atividade.custo || 0), 0), 0)

  return (
    <div className="home-page">
      <aside className="sidebar-panel">
        <div className="brand-block">
          <span className="brand-logo">T</span>
          <div>
            <p className="brand-name">Trip's Dev</p>
            <small>Travel planner</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a className="active" href="#">Dashboard</a>
          <button type="button" onClick={() => setModalAberto(true)}>Adicionar viagem</button>
          <a href="#itinerario">Minhas viagens</a>
        </nav>

        <div className="quick-card">
          <p className="quick-label">Resumo da conta</p>
          <h3>{viagens.length}</h3>
          <span>{viagens.length === 1 ? 'viagem cadastrada' : 'viagens cadastradas'}</span>
        </div>

        <button
          className="logout-button"
          onClick={() => {
            onSair()
            navigate('/login', { replace: true })
          }}
        >
          Sair da conta
        </button>
      </aside>

      <main className="content-panel">
        <header className="topbar">
          <div>
            <p className="mini-label">Bem-vindo de volta</p>
            <h1>Olá, {usuarioLogado.nome}</h1>
          </div>
          <div className="user-actions">
            <button className="ghost-button" onClick={() => setModalAberto(true)}>Nova viagem</button>
            <div className="avatar-badge">{usuarioLogado.nome.slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        <section className="hero-banner">
          <div className="hero-copy">
            <p className="eyebrow">Planeje sua próxima aventura</p>
            <h2>Organize suas viagens em um só lugar.</h2>
            <p className="empty-copy">{viagens.length ? `Você tem ${viagens.length} ${viagens.length === 1 ? 'viagem planejada' : 'viagens planejadas'} e ${totalAtividades} ${totalAtividades === 1 ? 'atividade organizada' : 'atividades organizadas'}.` : 'Sua agenda começa aqui. Cadastre uma viagem para acompanhar seus planos.'}</p>
            <button className="hero-action" onClick={() => setModalAberto(true)}>{viagens.length ? 'Planejar nova viagem' : 'Cadastrar viagem'}</button>
          </div>

          <div className="summary-card">
            <span>Viagens cadastradas</span>
            <strong>{viagens.length}</strong>
            <small>{totalAtividades} atividades no roteiro</small>
          </div>
        </section>

        <section className="stats-grid">
          <article className="stat-card accent">
            <p>Viagens</p>
            <strong>{totalAtividades}</strong>
            <span>atividades planejadas</span>
          </article>
          <article className="stat-card">
            <p>Próxima viagem</p>
            <strong>{proximaViagem ? formatarData(proximaViagem.dataInicio) : '--'}</strong>
            <span>{proximaViagem ? proximaViagem.destino : 'nenhuma cadastrada'}</span>
          </article>
          <article className="stat-card">
            <p>Perfil</p>
            <strong>R$ {custoEstimado.toFixed(2)}</strong>
            <span>custo estimado do roteiro</span>
          </article>
        </section>

        <section className="travel-layout">
          <div className="destination-panel">
            <div className="section-heading">
              <h3>Minhas viagens</h3>
              <div className="section-actions"><input className="trip-search" value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Buscar destino" /><button className="text-button" onClick={() => setModalAberto(true)}>Adicionar</button></div>
            </div>

            {carregando && <p>Carregando suas viagens...</p>}
            {!carregando && !viagens.length && <div className="empty-state"><strong>Nenhuma viagem cadastrada</strong><span>Use “Adicionar” para criar seu primeiro planejamento.</span></div>}
            {!carregando && viagens.length > 0 && !viagensFiltradas.length && <div className="empty-state"><strong>Nenhum destino encontrado</strong><span>Tente buscar por outro nome.</span></div>}
            {!carregando && viagensFiltradas.length > 0 && <div className="destination-grid">{viagensFiltradas.map((viagem) => <article key={viagem.id} className="destination-card user-trip"><div className="destination-overlay" /><div className="destination-info"><span>{formatarData(viagem.dataInicio)} até {formatarData(viagem.dataFim)}</span><h4>{viagem.destino}</h4><div className="card-meta"><strong>{viagem.roteiro.length} atividades</strong><button onClick={() => setRoteiroAberto(viagem)}>Roteiro</button><button onClick={() => abrirEdicao(viagem)}>Editar</button><button onClick={() => removerViagem(viagem)}>Excluir</button></div></div></article>)}</div>}
          </div>

          <aside className="side-panel">
            <div className="panel-box">
              <div className="section-heading compact">
                  <h3>Próxima viagem</h3>
                  <span>{proximaViagem ? 'Planejada' : 'Sua agenda'}</span>
              </div>
                {proximaViagem ? <><h4>{proximaViagem.destino}</h4><p>{formatarData(proximaViagem.dataInicio)} até {formatarData(proximaViagem.dataFim)}</p><p>{proximaViagem.observacoes || 'Nenhuma observação adicionada.'}</p><button className="text-button" onClick={() => setRoteiroAberto(proximaViagem)}>Gerenciar roteiro</button></> : <div className="empty-state"><strong>Sem próxima viagem</strong><span>Cadastre uma viagem para vê-la aqui.</span></div>}
            </div>

            <div className="panel-box users-box">
              <div className="section-heading compact">
                <h3>Sua conta</h3>
              </div>

              <div className="account-summary"><span className="mini-avatar">{usuarioLogado.nome.charAt(0).toUpperCase()}</span><div><strong>{usuarioLogado.nome}</strong><small>{usuarioLogado.email}</small></div></div>
              <button className="account-delete-button" onClick={removerConta}>Excluir conta</button>
            </div>
          </aside>
        </section>

        <section className="itinerary-box" id="itinerario">
          <div className="section-heading">
            <h3>Itinerário</h3>
            <button className="text-button" onClick={() => setModalAberto(true)}>Nova viagem</button>
          </div>

          <div className="itinerary-list">
            {!carregando && !viagens.length && <div className="empty-state"><strong>Seu itinerário está vazio</strong><span>As viagens cadastradas aparecerão nesta área.</span></div>}
            {viagens.map((viagem) => (
              <div key={viagem.id} className="itinerary-item">
                <div className="date-chip">
                  <strong>{viagem.dataInicio.match(/^\d{4}-\d{2}-(\d{2})$/)?.[1] || '--'}</strong>
                  <span>{formatarData(viagem.dataInicio).split(' ')[1]}</span>
                </div>
                <div className="itinerary-copy">
                  <h4>{viagem.destino}</h4>
                  <p>{formatarData(viagem.dataInicio)} até {formatarData(viagem.dataFim)}</p>
                </div>
                <button className="text-button" onClick={() => setRoteiroAberto(viagem)}>Roteiro ({viagem.roteiro.length})</button>
              </div>
            ))}
          </div>
        </section>

        {mensagem && <p className="success-message">{mensagem}</p>}
      </main>

      {modalAberto && <div className="modal-backdrop" onClick={() => { setModalAberto(false); setViagemEditando(null) }}><section className="trip-modal" onClick={(evento) => evento.stopPropagation()}><div className="section-heading"><h3>{viagemEditando ? 'Editar viagem' : 'Nova viagem'}</h3><button className="close-button" onClick={() => { setModalAberto(false); setViagemEditando(null) }}>Fechar</button></div><form onSubmit={salvarViagem}><label>Destino<input required value={novaViagem.destino} onChange={(evento) => setNovaViagem({ ...novaViagem, destino: evento.target.value })} placeholder="Ex.: Recife, Brasil" /></label><div className="form-row"><label>Data de início<input required type="date" value={novaViagem.dataInicio} onChange={(evento) => setNovaViagem({ ...novaViagem, dataInicio: evento.target.value })} /></label><label>Data de fim<input required type="date" value={novaViagem.dataFim} onChange={(evento) => setNovaViagem({ ...novaViagem, dataFim: evento.target.value })} /></label></div><label>Observações<textarea value={novaViagem.observacoes} onChange={(evento) => setNovaViagem({ ...novaViagem, observacoes: evento.target.value })} placeholder="Hotel, roteiro ou qualquer detalhe" /></label>{erro && <p className="erro">{erro}</p>}<button disabled={salvando}>{salvando ? 'Salvando...' : viagemEditando ? 'Salvar alterações' : 'Salvar viagem'}</button></form></section></div>}
      {roteiroAberto && <div className="modal-backdrop" onClick={() => { setRoteiroAberto(null); setAtividadeEditando(null) }}><section className="trip-modal route-modal" onClick={(evento) => evento.stopPropagation()}><div className="section-heading"><div><p className="mini-label">Planejamento detalhado</p><h3>Roteiro de {roteiroAberto.destino}</h3></div><button type="button" className="close-button" onClick={() => { setRoteiroAberto(null); setAtividadeEditando(null) }}>Fechar</button></div><div className="route-list">{!roteiroAberto.roteiro.length && <div className="empty-state"><strong>Nenhuma atividade</strong><span>Adicione passeio, refeição, transporte ou hospedagem.</span></div>}{roteiroAberto.roteiro.map((atividade) => <div className="route-item" key={atividade.id}><div className="route-icon">{(atividade.categoria || 'P').slice(0, 1)}</div><div className="route-details"><strong>{atividade.titulo}</strong><small>{atividade.categoria || 'Passeio'} · {formatarData(atividade.data)} {atividade.hora && `· ${atividade.hora}`}</small>{atividade.local && <span>Local: {atividade.local}</span>}{atividade.detalhes && <span>{atividade.detalhes}</span>}{atividade.custo > 0 && <span>Custo estimado: R$ {atividade.custo.toFixed(2)}</span>}</div><div className="route-actions"><button type="button" className="text-button" onClick={() => editarAtividade(atividade)}>Editar</button><button type="button" className="delete-button" onClick={() => removerAtividade(roteiroAberto, atividade)}>Excluir</button></div></div>)}</div><form onSubmit={salvarAtividade}><h4 className="form-title">{atividadeEditando ? 'Editar atividade' : 'Adicionar atividade'}</h4><label>Nome da atividade<input required value={novaAtividade.titulo} onChange={(evento) => setNovaAtividade({ ...novaAtividade, titulo: evento.target.value })} placeholder="Ex.: Visitar museu" /></label><div className="form-row"><label>Categoria<select value={novaAtividade.categoria} onChange={(evento) => setNovaAtividade({ ...novaAtividade, categoria: evento.target.value })}><option>Passeio</option><option>Alimentação</option><option>Transporte</option><option>Hospedagem</option><option>Outro</option></select></label><label>Data<input required type="date" value={novaAtividade.data} onChange={(evento) => setNovaAtividade({ ...novaAtividade, data: evento.target.value })} /></label></div><div className="form-row"><label>Horário<input type="time" value={novaAtividade.hora} onChange={(evento) => setNovaAtividade({ ...novaAtividade, hora: evento.target.value })} /></label><label>Custo estimado<input type="number" min="0" step="0.01" value={novaAtividade.custo} onChange={(evento) => setNovaAtividade({ ...novaAtividade, custo: evento.target.value })} placeholder="0,00" /></label></div><label>Local<input value={novaAtividade.local} onChange={(evento) => setNovaAtividade({ ...novaAtividade, local: evento.target.value })} placeholder="Endereço ou ponto de referência" /></label><label>Detalhes<textarea value={novaAtividade.detalhes} onChange={(evento) => setNovaAtividade({ ...novaAtividade, detalhes: evento.target.value })} placeholder="Reservas, lembretes ou informações importantes" /></label>{erro && <p className="erro">{erro}</p>}<button disabled={salvando}>{salvando ? 'Salvando...' : atividadeEditando ? 'Salvar alterações' : 'Adicionar atividade e continuar'}</button></form></section></div>}
    </div>
  )
}

export default Home
