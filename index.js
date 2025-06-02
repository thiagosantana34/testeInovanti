require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT || 3001;

// Middleware para verificar token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Cadastro de usuário
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hash]);
    res.sendStatus(201);
  } catch (error) {
    if(error.code === '23505') { // unique_violation
      return res.status(409).json({ error: 'Username já existe' });
    }
    console.error(error);
    res.sendStatus(500);
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rowCount === 0) return res.sendStatus(401);
    const valid = await bcrypt.compare(password, result.rows[0].password);
    if (!valid) return res.sendStatus(401);
    const token = jwt.sign({ id: result.rows[0].id, username }, jwtSecret);
    res.json({ token });
  } catch(error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// GET tarefas com filtro, paginação
app.get('/api/tasks', authenticateToken, async (req, res) => {
  const { status, page = 1, limit = 5 } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM tasks WHERE user_id = $1';
  const params = [req.user.id];

  if (status) {
    query += ' AND status = $2';
    params.push(status);
  }

  query += ' ORDER BY due_date LIMIT $3 OFFSET $4';
  params.push(limit, offset);

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch(error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Criar tarefa
app.post('/api/tasks', authenticateToken, async (req, res) => {
  const { title, description, due_date, status } = req.body;
  try {
    await pool.query(
      'INSERT INTO tasks (user_id, title, description, due_date, status) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, title, description, due_date, status]
    );
    res.sendStatus(201);
  } catch(error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Atualizar tarefa
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET title=$1, description=$2, due_date=$3, status=$4 WHERE id=$5 AND user_id=$6',
      [title, description, due_date, status, id, req.user.id]
    );
    if (result.rowCount === 0) return res.sendStatus(404);
    res.sendStatus(204);
  } catch(error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Deletar tarefa
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id=$1 AND user_id=$2', [id, req.user.id]);
    if (result.rowCount === 0) return res.sendStatus(404);
    res.sendStatus(204);
  } catch(error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Notificações - tarefas próximas do vencimento
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tasks 
       WHERE user_id = $1 
       AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 days'`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch(error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(port, () => console.log(`✅ Backend running on port ${port}`));
