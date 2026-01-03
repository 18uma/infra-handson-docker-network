# Step0: 環境確認・基本動作

## 🎯 学習目標

- Docker Composeの基本操作を確認する
- タスク管理アプリの動作を体験する
- 各コンテナの役割を理解する
- 正常な通信状態を確認する

**所要時間: 約20分**

---

## 📋 このステップで学ぶこと

### 1. システム構成の理解
```
Frontend (React)  ←→  Backend (Node.js)  ←→  Database (PostgreSQL)
     :3000              :8000                   :5432
```

### 2. Docker Composeの基本操作
- コンテナの起動・停止
- ログの確認方法
- 基本的なトラブルシューティング

---

## 🚀 実習手順

### 1. 環境の掃除（重要）
```bash
# 既存のコンテナ・ネットワーク・ボリュームを削除
docker compose down -v --remove-orphans

# 未使用リソースの削除
docker system prune -f
```

### 2. アプリケーションの起動
```bash
# バックグラウンドで起動
docker compose up -d

# 起動状況の確認
docker compose ps
```

**期待する結果:**
```
NAME                     IMAGE                        COMMAND                  SERVICE    CREATED         STATUS         PORTS
infra-handson-backend    infra-handson-backend        "docker-entrypoint.s…"  backend    2 minutes ago   Up 2 minutes   0.0.0.0:8000->8000/tcp
infra-handson-database   postgres:15                  "docker-entrypoint.s…"  database   2 minutes ago   Up 2 minutes   5432/tcp
infra-handson-frontend   infra-handson-frontend       "docker-entrypoint.s…"  frontend   2 minutes ago   Up 2 minutes   0.0.0.0:3000->3000/tcp
```

### 3. 動作確認

#### 3-1. バックエンドAPI確認
```bash
# ヘルスチェック
curl http://localhost:8000/health

# タスク一覧取得
curl http://localhost:8000/tasks
```

**期待する結果:**
```json
{"status":"OK","message":"Task API is running"}

[
  {"id":1,"title":"Docker Composeの学習","created_at":"2024-01-01T00:00:00.000Z"},
  {"id":2,"title":"ネットワーク設定の確認","created_at":"2024-01-01T00:00:00.000Z"},
  {"id":3,"title":"APIの動作テスト","created_at":"2024-01-01T00:00:00.000Z"}
]
```

#### 3-2. フロントエンド確認
```bash
# ブラウザでアクセス
open http://localhost:3000
```

**期待する動作:**
- タスク一覧が表示される
- 新しいタスクを追加できる
- エラーが表示されない

### 4. ログの確認方法
```bash
# 全サービスのログ
docker compose logs

# 特定サービスのログ
docker compose logs backend
docker compose logs frontend
docker compose logs database

# リアルタイムでログを監視
docker compose logs -f backend
```

---

## 🔍 確認ポイント

### ✅ チェックリスト

- [ ] 3つのコンテナが全て起動している
- [ ] `curl http://localhost:8000/health` が成功する
- [ ] `curl http://localhost:8000/tasks` でタスク一覧が取得できる
- [ ] ブラウザで http://localhost:3000 にアクセスできる
- [ ] フロントエンドでタスク一覧が表示される
- [ ] 新しいタスクを追加できる

### 🤔 理解度チェック

以下の質問に答えられるか確認してください：

1. **各コンテナの役割は何ですか？**
   - Frontend: 
   - Backend: 
   - Database: 

2. **外部からアクセスできるポートはどれですか？**
   - Frontend: 
   - Backend: 
   - Database: 

3. **コンテナ同士はどのように通信していますか？**

---

## 🛠️ トラブルシューティング

### よくある問題と解決方法

#### 問題1: ポートが使用中
```
Error: bind: address already in use
```
**解決方法:**
```bash
# 使用中のプロセスを確認
lsof -i :3000
lsof -i :8000

# 既存のコンテナを停止
docker compose down
```

#### 問題2: イメージビルドエラー
```bash
# キャッシュを使わずに再ビルド
docker compose build --no-cache

# 個別にビルド
docker compose build frontend
docker compose build backend
```

#### 問題3: データベース接続エラー
```bash
# バックエンドのログを確認
docker compose logs backend

# データベースの起動を待つ
docker compose up database
# 別ターミナルで
docker compose up backend frontend
```

---

## 🎓 Step0で身につけたこと

- Docker Composeの基本操作
- 正常な状態でのアプリケーション動作
- 各コンテナの役割と責任
- 基本的なトラブルシューティング手法

---

## 📚 次のステップへ

Step0が完了したら、次のステップに進みましょう：

```bash
# 環境の掃除
docker compose down -v --remove-orphans

# 次のステップへ
git checkout step1-port
```

**Step1では「ポート公開」について学習します。**
外部アクセスとコンテナ間通信の違いを理解していきましょう！

---

## 💡 実務への応用

Step0で学んだことは実務でこのように活用できます：

- **開発環境の構築**: Docker Composeで一貫した環境を提供
- **動作確認の手順化**: ヘルスチェックとログ確認の標準化
- **トラブルシューティング**: 問題の切り分けと解決手順の確立