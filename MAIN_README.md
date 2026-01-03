# Dockerネットワーク基礎ハンズオン

## 概要

このハンズオンでは、Dockerネットワークの基礎概念を実践的に学習します。
タスク管理アプリを題材に、コンテナ間通信の仕組みを理解していきます。

## 学習目標

- Dockerネットワークの基本概念を理解する
- コンテナ間通信の仕組みを説明できる
- ネットワーク問題の切り分け手法を身につける
- 実務で遭遇するネットワーク問題を解決できる

## 前提条件

- Docker、Docker Composeがインストール済み
- 基本的なLinux/ネットワークの知識
- SIer業務での基礎的なIT知識

## ハンズオンの進め方

### ブランチ構成

```
main                    # 完成形（講師・答え確認用）
├─ step0-base          # 環境確認・基本動作
├─ step1-port          # ポート公開の理解  
├─ step2-viewpoint     # 通信の観点・切り分け
├─ step3-network-isolation # ネットワーク分離（最重要）
├─ step4-dns           # DNS・名前解決
└─ step5-final-exercise # 総合演習
```

### 学習の流れ

1. 各ステップのブランチをcheckout
2. READMEの指示に従って課題に取り組む
3. 問題を解決したら次のステップへ
4. 詰まった場合は次のブランチに進んでもOK

### 開始方法

```bash
# リポジトリをクローン
git clone <repository-url>
cd infra-handson-docker-network

# Step0から開始
git checkout step0-base
```

## アプリケーション構成

### システム構成

```
Frontend (React)  ←→  Backend (Node.js)  ←→  Database (PostgreSQL)
     :3000              :8000                   :5432
```

### 主な機能

- **Frontend**: タスク一覧表示、新規タスク追加
- **Backend**: REST API（GET /tasks, POST /tasks）
- **Database**: タスクデータの永続化

## 完成形の動作確認（mainブランチ）

```bash
# コンテナ起動
docker compose up -d

# 動作確認
curl http://localhost:8000/health
# → {"status":"OK","message":"Task API is running"}

# ブラウザでアクセス
open http://localhost:3000
```

## トラブルシューティング

### よくある問題

1. **ポートが使用中**
   ```bash
   docker compose down
   # または別のポートを使用
   ```

2. **イメージビルドエラー**
   ```bash
   docker compose build --no-cache
   ```

3. **データベース接続エラー**
   ```bash
   docker compose logs backend
   # ログを確認してデータベースの起動を待つ
   ```

## 各ステップの学習時間目安

- Step0: 20分（環境確認）
- Step1: 25分（ポート理解）
- Step2: 30分（切り分け手法）
- Step3: 30分（ネットワーク分離）★最重要
- Step4: 25分（DNS理解）
- Step5: 30分（総合演習）

**合計: 約2.5時間**

## 学習のポイント

### 重要な概念

1. **ネットワーク境界**: コンテナは明示的にネットワークに参加する
2. **名前解決**: サービス名でのコンテナ間通信
3. **ポート公開**: 外部アクセスとコンテナ間通信の違い
4. **切り分け**: 問題の原因を順序立てて特定する

### 実務への応用

- マイクロサービス間の通信設計
- 開発環境でのネットワーク問題解決
- 本番環境でのトラブルシューティング
- セキュリティを考慮したネットワーク設計

---

**🎯 このハンズオンを通じて、Dockerネットワークの「見えない境界」を理解し、実務で自信を持ってネットワーク問題に対処できるようになりましょう！**