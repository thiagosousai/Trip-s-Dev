const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = Number(process.env.BACKEND_PORT || 3000);
const dataPath = path.join(__dirname, 'data.json');
const databasePath = path.join(__dirname, 'trip.db');
const db = new DatabaseSync(databasePath);

function senhaForte(senha) {
  return typeof senha === 'string' && senha.length >= 8 && /[a-z]/.test(senha) && /[A-Z]/.test(senha) && /\d/.test(senha);
}

function criarHashSenha(senha) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(senha, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function verificarSenha(senha, senhaArmazenada) {
  if (!senhaArmazenada?.startsWith('scrypt$')) return senha === senhaArmazenada;
  const [, saltHex, hashHex] = senhaArmazenada.split('$');
  const hash = crypto.scryptSync(senha, Buffer.from(saltHex, 'hex'), 64);
  return crypto.timingSafeEqual(hash, Buffer.from(hashHex, 'hex'));
}

app.use(cors());
app.use(express.json());

db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE, senha TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS viagens (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, destino TEXT NOT NULL, data_inicio TEXT NOT NULL, data_fim TEXT NOT NULL, observacoes TEXT NOT NULL DEFAULT '', FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS roteiro (id INTEGER PRIMARY KEY AUTOINCREMENT, viagem_id INTEGER NOT NULL, titulo TEXT NOT NULL, data TEXT NOT NULL, hora TEXT NOT NULL DEFAULT '', detalhes TEXT NOT NULL DEFAULT '', categoria TEXT NOT NULL DEFAULT 'Passeio', local TEXT NOT NULL DEFAULT '', custo REAL NOT NULL DEFAULT 0, FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE);
`);

function migrarJsonSeNecessario() {
  const quantidade = db.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total;
  if (quantidade > 0 || !fs.existsSync(dataPath)) return;
  const dados = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const inserirUsuario = db.prepare('INSERT INTO usuarios (id, nome, email, senha) VALUES (?, ?, ?, ?)');
  const inserirViagem = db.prepare('INSERT INTO viagens (id, usuario_id, destino, data_inicio, data_fim, observacoes) VALUES (?, ?, ?, ?, ?, ?)');
  const inserirAtividade = db.prepare('INSERT INTO roteiro (id, viagem_id, titulo, data, hora, detalhes, categoria, local, custo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  db.exec('BEGIN');
  try {
    for (const usuario of dados.usuarios || []) inserirUsuario.run(usuario.id, usuario.nome, usuario.email, criarHashSenha(usuario.senha));
    for (const viagem of dados.viagens || []) {
      inserirViagem.run(viagem.id, viagem.usuarioId, viagem.destino, viagem.dataInicio, viagem.dataFim, viagem.observacoes || '');
      for (const atividade of viagem.roteiro || []) inserirAtividade.run(atividade.id, viagem.id, atividade.titulo, atividade.data, atividade.hora || '', atividade.detalhes || '', atividade.categoria || 'Passeio', atividade.local || '', atividade.custo || 0);
    }
    db.exec('COMMIT');
  } catch (erro) {
    db.exec('ROLLBACK');
    throw erro;
  }
}

migrarJsonSeNecessario();

for (const usuario of db.prepare('SELECT id, senha FROM usuarios').all()) {
  if (!usuario.senha.startsWith('scrypt$')) {
    db.prepare('UPDATE usuarios SET senha = ? WHERE id = ?').run(criarHashSenha(usuario.senha), usuario.id);
  }
}

function obterViagem(viagemId, usuarioId) {
  return db.prepare('SELECT * FROM viagens WHERE id = ? AND usuario_id = ?').get(viagemId, usuarioId);
}

function montarViagem(viagem) {
  const roteiro = db.prepare('SELECT id, titulo, data, hora, detalhes, categoria, local, custo FROM roteiro WHERE viagem_id = ? ORDER BY data, hora, id').all(viagem.id);
  return { id: viagem.id, usuarioId: viagem.usuario_id, destino: viagem.destino, dataInicio: viagem.data_inicio, dataFim: viagem.data_fim, observacoes: viagem.observacoes, roteiro };
}

app.get('/usuarios', (req, res) => res.json(db.prepare('SELECT id, nome, email FROM usuarios ORDER BY id').all()));

app.post('/usuarios', (req, res) => {
  const { nome, email, senha } = req.body || {};
  if (!nome || !email || !senha) return res.status(400).json({ erro: 'Preencha nome, e-mail e senha.' });
  if (!senhaForte(senha)) return res.status(400).json({ erro: 'A senha deve ter 8 caracteres, uma letra maiúscula, uma minúscula e um número.' });
  try {
    const resultado = db.prepare('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)').run(nome.trim(), email.trim(), criarHashSenha(senha));
    res.status(201).json({ id: Number(resultado.lastInsertRowid), nome: nome.trim(), email: email.trim() });
  } catch (erro) {
    if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
  }
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  const usuario = db.prepare('SELECT id, nome, email, senha FROM usuarios WHERE email = ?').get(email.trim());
  if (!usuario || !verificarSenha(senha, usuario.senha)) return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email });
});

app.delete('/usuarios/:id', (req, res) => {
  const resultado = db.prepare('DELETE FROM usuarios WHERE id = ?').run(Number(req.params.id));
  if (!resultado.changes) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  res.status(204).send();
});

app.get('/viagens', (req, res) => {
  const usuarioId = Number(req.query.usuarioId);
  if (!usuarioId) return res.status(400).json({ erro: 'O usuário é obrigatório.' });
  res.json(db.prepare('SELECT * FROM viagens WHERE usuario_id = ? ORDER BY data_inicio, id').all(usuarioId).map(montarViagem));
});

app.post('/viagens', (req, res) => {
  const { usuarioId, destino, dataInicio, dataFim, observacoes } = req.body || {};
  if (!usuarioId || !destino || !dataInicio || !dataFim) return res.status(400).json({ erro: 'Preencha destino, data de início e data de fim.' });
  if (new Date(dataFim) < new Date(dataInicio)) return res.status(400).json({ erro: 'A data de fim deve ser posterior à data de início.' });
  if (!db.prepare('SELECT id FROM usuarios WHERE id = ?').get(Number(usuarioId))) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  const resultado = db.prepare('INSERT INTO viagens (usuario_id, destino, data_inicio, data_fim, observacoes) VALUES (?, ?, ?, ?, ?)').run(Number(usuarioId), destino.trim(), dataInicio, dataFim, observacoes?.trim() || '');
  res.status(201).json(montarViagem(db.prepare('SELECT * FROM viagens WHERE id = ?').get(Number(resultado.lastInsertRowid))));
});

app.patch('/viagens/:id', (req, res) => {
  const { usuarioId, destino, dataInicio, dataFim, observacoes } = req.body || {};
  const viagem = obterViagem(Number(req.params.id), Number(usuarioId));
  if (!viagem) return res.status(404).json({ erro: 'Viagem não encontrada.' });
  if (!destino || !dataInicio || !dataFim) return res.status(400).json({ erro: 'Preencha destino, data de início e data de fim.' });
  if (new Date(dataFim) < new Date(dataInicio)) return res.status(400).json({ erro: 'A data de fim deve ser posterior à data de início.' });
  db.prepare('UPDATE viagens SET destino = ?, data_inicio = ?, data_fim = ?, observacoes = ? WHERE id = ?').run(destino.trim(), dataInicio, dataFim, observacoes?.trim() || '', viagem.id);
  res.json(montarViagem(db.prepare('SELECT * FROM viagens WHERE id = ?').get(viagem.id)));
});

app.delete('/viagens/:id', (req, res) => {
  const resultado = db.prepare('DELETE FROM viagens WHERE id = ? AND usuario_id = ?').run(Number(req.params.id), Number(req.query.usuarioId));
  if (!resultado.changes) return res.status(404).json({ erro: 'Viagem não encontrada.' });
  res.status(204).send();
});

app.post('/viagens/:id/roteiro', (req, res) => {
  const { usuarioId, titulo, data, hora, detalhes, categoria, local, custo } = req.body || {};
  const viagem = obterViagem(Number(req.params.id), Number(usuarioId));
  if (!viagem) return res.status(404).json({ erro: 'Viagem não encontrada.' });
  if (!titulo || !data) return res.status(400).json({ erro: 'Informe o título e a data da atividade.' });
  const resultado = db.prepare('INSERT INTO roteiro (viagem_id, titulo, data, hora, detalhes, categoria, local, custo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(viagem.id, titulo.trim(), data, hora || '', detalhes?.trim() || '', categoria || 'Passeio', local?.trim() || '', custo ? Number(custo) : 0);
  res.status(201).json(db.prepare('SELECT id, titulo, data, hora, detalhes, categoria, local, custo FROM roteiro WHERE id = ?').get(Number(resultado.lastInsertRowid)));
});

app.patch('/viagens/:viagemId/roteiro/:atividadeId', (req, res) => {
  const { usuarioId, titulo, data, hora, detalhes, categoria, local, custo } = req.body || {};
  const viagem = obterViagem(Number(req.params.viagemId), Number(usuarioId));
  if (!viagem) return res.status(404).json({ erro: 'Viagem não encontrada.' });
  if (!titulo || !data) return res.status(400).json({ erro: 'Informe o título e a data da atividade.' });
  const resultado = db.prepare('UPDATE roteiro SET titulo = ?, data = ?, hora = ?, detalhes = ?, categoria = ?, local = ?, custo = ? WHERE id = ? AND viagem_id = ?').run(titulo.trim(), data, hora || '', detalhes?.trim() || '', categoria || 'Passeio', local?.trim() || '', custo ? Number(custo) : 0, Number(req.params.atividadeId), viagem.id);
  if (!resultado.changes) return res.status(404).json({ erro: 'Atividade não encontrada.' });
  res.json(db.prepare('SELECT id, titulo, data, hora, detalhes, categoria, local, custo FROM roteiro WHERE id = ?').get(Number(req.params.atividadeId)));
});

app.delete('/viagens/:viagemId/roteiro/:atividadeId', (req, res) => {
  const viagem = obterViagem(Number(req.params.viagemId), Number(req.query.usuarioId));
  if (!viagem) return res.status(404).json({ erro: 'Viagem não encontrada.' });
  const resultado = db.prepare('DELETE FROM roteiro WHERE id = ? AND viagem_id = ?').run(Number(req.params.atividadeId), viagem.id);
  if (!resultado.changes) return res.status(404).json({ erro: 'Atividade não encontrada.' });
  res.status(204).send();
});

app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
