const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 8000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// データベース接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// データベース初期化
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // サンプルデータの挿入（テーブルが空の場合のみ）
    const { rows } = await pool.query('SELECT COUNT(*) FROM tasks');
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO tasks (title) VALUES 
        ('Docker Composeの学習'),
        ('ネットワーク設定の確認'),
        ('APIの動作テスト')
      `);
      console.log('サンプルデータを挿入しました');
    }
    
    console.log('データベースの初期化が完了しました');
  } catch (err) {
    console.error('データベース初期化エラー:', err);
  }
}

// ルート
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Task API is running' });
});

// タスク一覧取得
app.get('/tasks', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('タスク取得エラー:', err);
    res.status(500).json({ error: 'データベースエラー' });
  }
});

// タスク追加
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'タスクのタイトルが必要です' });
  }
  
  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      [title.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('タスク追加エラー:', err);
    res.status(500).json({ error: 'データベースエラー' });
  }
});

// サーバー起動
app.listen(port, async () => {
  console.log(`Task API server running on port ${port}`);
  
  // データベース接続待機
  let retries = 5;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('データベースに接続しました');
      await initDatabase();
      break;
    } catch (err) {
      console.log(`データベース接続待機中... (残り${retries}回)`);
      retries--;
      if (retries === 0) {
        console.error('データベース接続に失敗しました:', err);
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
});