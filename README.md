# Step0: 全体像とゴールの共有

## 🎯 学習目標

**このハンズオンを通じて、あなたはこう説明できるようになります：**

> 「この通信は**どこからどこまで、どのルールの上で成立しているのか**を構造的に説明できる」

**所要時間: 約20分**

---

## 📋 今日のゴール：「なぜ通信できるのか」を説明する

### 🔍 中心となる問い

> **この通信は、どこからどこまで、どのルールの上で成立しているのか？**

### 💡 実務での価値

- 通信トラブル時の**切り分け力**
- 設計レビューでの**説明力**
- 障害対応での**構造的思考**

---

## 🏗️ システム構成を理解する

### 正常系：すべて通信できる状態
```
┌─────────────────────────────────────────────────────────┐
│                    app-network                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │  Frontend   │───▶│   Backend   │───▶│  Database   │ │
│  │   :3000     │    │    :8000    │    │    :5432    │ │
│  │   (React)   │    │  (Node.js)  │    │(PostgreSQL) │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
└─────────────────────────────────────────────────────────┘
        ↑                     ↑
   ブラウザから              APIアクセス
   アクセス可能              可能
```

### 異常系：通信できない状態の例
```
┌─────────────────┐                    ┌─────────────────┐
│   network-a     │                    │   network-b     │
│ ┌─────────────┐ │                    │ ┌─────────────┐ │
│ │  Frontend   │ │ ❌ 通信不可 ❌      │ │   Backend   │ │
│ │   :3000     │ │                    │ │    :8000    │ │
│ └─────────────┘ │                    │ └─────────────┘ │
└─────────────────┘                    └─────────────────┘
```

**なぜ通信できないのでしょうか？**

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

### 3. 正常系の動作確認

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

### ✅ 動作確認チェックリスト

- [ ] 3つのコンテナが全て起動している
- [ ] `curl http://localhost:8000/health` が成功する
- [ ] `curl http://localhost:8000/tasks` でタスク一覧が取得できる
- [ ] ブラウザで http://localhost:3000 にアクセスできる
- [ ] フロントエンドでタスク一覧が表示される
- [ ] 新しいタスクを追加できる

### 🤔 **重要な問いかけ**

正常に動作していることを確認できましたか？

**では、なぜこの通信は成立しているのでしょうか？**

- Frontend → Backend の通信は？
- Backend → Database の通信は？
- ブラウザ → Frontend の通信は？

**次のステップから、この「なぜ」を一つずつ解明していきます。**

### 🤔 理解度チェック

以下の質問に答えられるか確認してください：

1. **各コンテナの役割は何ですか？**

<details>
<summary>解答を見る</summary>

- **Frontend**: ユーザーインターフェース、ブラウザでタスク管理画面を表示
- **Backend**: REST API、タスクのCRUD処理とビジネスロジック
- **Database**: データの永続化、PostgreSQLでタスクデータを保存

</details>

2. **外部からアクセスできるポートはどれですか？**

<details>
<summary>解答を見る</summary>

- **Frontend**: 3000番ポート（ブラウザからアクセス可能）
- **Backend**: 8000番ポート（APIエンドポイント）
- **Database**: 5432番ポート（外部公開されていない）

</details>

3. **コンテナ同士はどのように通信していますか？**

<details>
<summary>解答を見る</summary>

- **同一Dockerネットワーク**（app-network）内で通信
- **サービス名**で名前解決（frontend → backend、backend → database）
- **内部ポート**を使用（外部公開ポートではない）

</details>

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

- **全体像の把握**: 正常系と異常系の構成パターン
- **中心となる問い**: 「なぜその通信は成立するのか」
- **学習ゴール**: 構造的な説明力の習得
- **実務価値**: 切り分け思考とトラブル対応力

---

## 📚 次のステップへ

Step0が完了したら、次のステップに進みましょう：

```bash
# 環境の掃除
 docker compose down -v --remove-orphans

# 次のステップへ
git checkout step1-port
```

**Step1では「ポートの役割再確認」を学習します。**

> 「どこで待ち受けているか」を意識し、待ち受けと接続は別概念であることを理解していきましょう！

---

## 💡 実務への応用

Step0で学んだことは実務でこのように活用できます：

- **設計レビュー**: 構成図を見て通信経路を説明
- **トラブル対応**: 「なぜ通信できないのか」を構造的に分析
- **チーム連携**: 問題の切り分け手法を共有