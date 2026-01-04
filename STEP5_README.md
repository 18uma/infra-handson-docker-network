# Step5: 総合演習（切り分けとトラブルシューティング）

## 🎯 学習目標

**このステップを通じて、あなたはこう説明できるようになります：**

> 「**ログを分析し、ネットワーク構成を調査して、複数の問題を段階的に特定・解決できます。実務でのトラブルシューティング手法を身につけました。**」

**所要時間: 約60分**

---

## 📋 今回のテーマ：「実務レベルの問題解決」に挑戦

### 🔍 「トラブルシューティング」のアナロジー

**Troubleshooting（問題解決）** = **探偵の事件解決**

複雑な事件捜査で考えてみましょう：

```
複雑な事件の捜査                        複合的なシステム障害
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🕵️ 探偵の捜査手順                      👨‍💻 エンジニアの障害対応               │
│                                                                             │
│ 1️⃣ 現場検証                           1️⃣ 症状の確認                        │
│    「何が起きているか？」                  「どんなエラーが出ているか？」        │
│                                                                             │
│ 2️⃣ 証拠収集                           2️⃣ ログ分析                          │
│    「手がかりを集める」                    「エラーログを読み解く」              │
│                                                                             │
│ 3️⃣ 仮説立案                           3️⃣ 原因仮説                          │
│    「犯人は誰か？動機は？」                「ネットワーク？設定？依存関係？」    │
│                                                                             │
│ 4️⃣ 検証実験                           4️⃣ 仮説検証                          │
│    「アリバイ確認、証拠照合」              「設定確認、接続テスト」              │
│                                                                             │
│ 5️⃣ 解決実行                           5️⃣ 修正適用                          │
│    「犯人逮捕、事件解決」                  「設定修正、動作確認」                │
└─────────────────────────────────────────────────────────────────────────────┘
```

**重要な気づき：**
- **複数の手がかりを組み合わせる** → **複数のログやエラーを総合判断**
- **仮説を立てて検証する** → **原因を推測して確認テスト**
- **段階的に解決する** → **1つずつ問題を解決して進める**

### 🔍 中心となる問い

> **複数の問題が絡み合っているとき、どうやって効率的に解決するか？**

### 💡 実務での価値

- **障害対応スキル**（本番環境でのトラブル解決）
- **論理的思考力**（仮説検証による問題解決）
- **優先順位判断**（どの問題から解決すべきか）

---

## 🚨 今回の状況：「システムが全く動かない」

### 現在の症状
- フロントエンドは表示されるが、APIエラーが発生
- バックエンドAPIに直接アクセスもできない
- データベース接続も不安定

### あなたのミッション
**段階的に問題を特定し、1つずつ解決してシステムを復旧させてください。**

---

## 🚀 実習手順：探偵になって事件を解決しよう

> **重要**: このステップでは「答えを教える」のではなく、「調査方法を学ぶ」ことが目的です。

### Phase 1: 現場検証（症状の確認）

#### 1-1. システムを起動して症状を確認
```bash
# 環境をクリーンアップ
docker compose down -v --remove-orphans

# システムを起動
docker compose up -d

# 起動状況を確認
docker compose ps
```

**🤔 観察ポイント:**
- 全てのコンテナが起動しているか？
- ポートの公開状況はどうか？

#### 1-2. 基本的な動作確認
```bash
# フロントエンドにアクセス
open http://localhost:3000

# バックエンドAPIに直接アクセス
curl http://localhost:8000/health
```

**期待する症状:**
- ✅ フロントエンド画面は表示される
- ❌ タスク一覧でAPIエラーが表示される
- ❌ バックエンドAPIに直接アクセスできない

### Phase 2: 証拠収集（ログ分析）

#### 2-1. 各コンテナのログを確認
```bash
# 全体のログを確認
docker compose logs

# 個別のログを確認
docker compose logs frontend
docker compose logs backend
docker compose logs database
```

**🕵️ ログ分析のヒント:**
<details>
<summary>ヒント1: エラーメッセージの読み方</summary>

- **Connection refused**: ポートが開いていない、またはサービスが起動していない
- **Name resolution failed**: DNS名前解決ができない（サービス名が間違っている）
- **Network unreachable**: ネットワーク分離により通信できない

</details>

#### 2-2. ネットワーク構成を調査
```bash
# ネットワーク一覧を確認
docker network ls

# 各ネットワークの詳細を確認
docker network inspect infra-handson-docker-network_frontend-network
docker network inspect infra-handson-docker-network_backend-network
docker network inspect infra-handson-docker-network_database-network
```

**🤔 調査ポイント:**
- 各コンテナがどのネットワークに属しているか？
- 通信が必要なコンテナ同士が同じネットワークにいるか？

### Phase 3: 仮説立案（原因の推測）

**🧠 これまでの情報から、以下の仮説を立ててみましょう:**

<details>
<summary>仮説A: ネットワーク分離問題</summary>

**仮説**: 各サービスが異なるネットワークに分離されているため、相互通信ができない

**検証方法**: 
```bash
# コンテナ間通信をテスト
docker compose exec frontend ping backend
docker compose exec backend ping database
```

</details>

<details>
<summary>仮説B: サービス名設定問題</summary>

**仮説**: 環境変数で指定されているサービス名が実際のサービス名と一致していない

**検証方法**:
```bash
# 設定を確認
docker compose config
# 環境変数を確認
docker compose exec frontend env | grep API_URL
docker compose exec backend env | grep DATABASE_URL
```

</details>

<details>
<summary>仮説C: ポート公開問題</summary>

**仮説**: バックエンドAPIのポートが公開されていないため、外部からアクセスできない

**検証方法**:
```bash
# ポート公開状況を確認
docker compose ps
# コンテナ内からの通信をテスト
docker compose exec backend curl http://localhost:8000/health
```

</details>

### Phase 4: 検証実験（仮説の確認）

#### 4-1. 仮説Aの検証：ネットワーク分離
```bash
# フロントエンドからバックエンドへの通信テスト
docker compose exec frontend sh
# コンテナ内で実行
nslookup backend
ping backend
curl http://backend:8000/health
exit
```

**💡 ヒント**: 名前解決ができない場合、ネットワーク分離が原因の可能性が高いです。

#### 4-2. 仮説Bの検証：サービス名設定
```bash
# 現在の設定を確認
cat docker-compose.yml | grep -A 2 -B 2 "API_URL\|DATABASE_URL"

# 実際のサービス名を確認
docker compose ps --format "table {{.Service}}\t{{.Names}}"
```

**💡 ヒント**: 環境変数で指定している名前と、実際のサービス名が一致しているか確認しましょう。

#### 4-3. 仮説Cの検証：ポート公開
```bash
# ポート公開状況の詳細確認
docker compose ps
netstat -tlnp | grep 8000  # ホストでポート8000が開いているか確認
```

**💡 ヒント**: `0.0.0.0:8000->8000/tcp` の表示があるかどうかがポイントです。

### Phase 5: 解決実行（段階的修正）

**🛠️ ここからは、特定した問題を1つずつ解決していきます。**

#### 5-1. 問題の優先順位を決める

<details>
<summary>💡 解決の順序のヒント</summary>

一般的な優先順位：
1. **ネットワーク接続**: まず通信経路を確保
2. **サービス名解決**: 正しい名前で通信できるように
3. **ポート公開**: 外部からのアクセスを可能に
4. **アプリケーション設定**: 最後に細かい設定を調整

</details>

#### 5-2. 段階的修正と検証

**修正1: ネットワーク統合**

<details>
<summary>修正方法を見る</summary>

```yaml
# docker-compose.ymlを修正
networks:
  app-network:  # 単一ネットワークに統合
    driver: bridge

services:
  frontend:
    networks:
      - app-network  # 全サービスを同じネットワークに
  backend:
    networks:
      - app-network
  database:
    networks:
      - app-network
```

</details>

```bash
# 修正後の動作確認
docker compose down
docker compose up -d
docker compose exec frontend ping backend
```

**修正2: サービス名の訂正**

<details>
<summary>修正方法を見る</summary>

```yaml
# 環境変数を正しいサービス名に修正
services:
  frontend:
    environment:
      - REACT_APP_API_URL=http://backend:8000  # api → backend
  backend:
    environment:
      - DATABASE_URL=postgresql://user:password@database:5432/taskdb  # db → database
```

</details>

```bash
# 修正後の動作確認
docker compose down
docker compose build --no-cache  # 環境変数変更のため再ビルド
docker compose up -d
```

**修正3: ポート公開の有効化**

<details>
<summary>修正方法を見る</summary>

```yaml
# バックエンドのポート公開を有効化
services:
  backend:
    ports:
      - "8000:8000"  # コメントアウトを解除
```

</details>

```bash
# 修正後の動作確認
docker compose down
docker compose up -d
curl http://localhost:8000/health
```

#### 5-3. 最終動作確認
```bash
# 全体の動作確認
open http://localhost:3000
curl http://localhost:8000/health

# ログで正常動作を確認
docker compose logs backend | tail -10
```

---

## 🔍 確認ポイント

### ✅ トラブルシューティング体験チェックリスト

- [ ] ログを読んでエラーの原因を特定できた
- [ ] ネットワーク構成を調査して問題を発見できた
- [ ] 複数の仮説を立てて検証できた
- [ ] 問題の優先順位を判断して段階的に解決できた
- [ ] 修正後の動作確認を適切に行えた

### 🤔 理解度チェック

以下の質問に答えられるか確認してください：

1. **複数の問題が同時発生した場合、どのような手順で解決しますか？**

<details>
<summary>解答を見る</summary>

**体系的なトラブルシューティング手順:**
1. **症状の確認**: 何が起きているかを正確に把握
2. **ログ分析**: エラーメッセージから手がかりを収集
3. **仮説立案**: 考えられる原因を複数リストアップ
4. **仮説検証**: 1つずつ検証して真の原因を特定
5. **優先順位判断**: 影響度と解決の容易さで順序決定
6. **段階的修正**: 1つずつ解決して都度確認

</details>

2. **ログからどのような情報を読み取れますか？**

<details>
<summary>解答を見る</summary>

**ログから読み取れる重要な情報:**
- **エラーの種類**: Connection refused, Name resolution failed など
- **発生タイミング**: いつエラーが発生したか
- **関連サービス**: どのサービス間の通信で問題が起きたか
- **設定の問題**: 環境変数や設定ファイルの不備
- **依存関係**: サービス起動順序や依存関係の問題

</details>

3. **実務でこのスキルはどう活用しますか？**

<details>
<summary>解答を見る</summary>

**実務での活用場面:**
- **本番障害対応**: 迅速な原因特定と復旧作業
- **開発環境構築**: 環境構築時のトラブル解決
- **CI/CD パイプライン**: デプロイ失敗時の問題解決
- **マイクロサービス運用**: サービス間通信の問題解決
- **クラウド移行**: 環境差異による問題の特定と解決

</details>

---

## 🛠️ トラブルシューティング

### よくある問題と解決方法

#### 問題1: ログが多すぎて読めない
```bash
# 特定のサービスのログのみ表示
docker compose logs backend --tail=20

# エラーのみフィルタ
docker compose logs backend | grep -i error

# リアルタイムでログを監視
docker compose logs -f backend
```

#### 問題2: 修正しても反映されない
```bash
# 設定変更後は必ず再起動
docker compose down
docker compose up -d

# 環境変数変更時は再ビルド
docker compose build --no-cache
docker compose up -d
```

#### 問題3: どこから手をつけていいかわからない
```bash
# まずは全体の状況を把握
docker compose ps
docker compose logs --tail=10

# 1つずつ切り分けて確認
docker compose exec frontend ping backend
docker compose exec backend ping database
```

---

## 🎓 Step5で身につけたこと

- **実務レベルのトラブルシューティング**: 複合的な問題の解決手法
- **ログ分析スキル**: エラーメッセージから原因を特定する能力
- **仮説検証思考**: 論理的な問題解決アプローチ
- **優先順位判断**: 効率的な修正順序の決定能力

---

## 📚 次のステップへ

Step5が完了したら、全ステップの学習が終了です！

```bash
# 環境の掃除
docker compose down -v --remove-orphans

# メインブランチに戻る
git checkout main
```

**🎉 おめでとうございます！**

> あなたは今、実務で通用するDockerネットワークのトラブルシューティングスキルを身につけました！

---

## 💡 実務への応用

Step5で学んだことは実務でこのように活用できます：

- **本番障害対応**: 迅速な原因特定と段階的復旧
- **開発環境トラブル**: 効率的な問題解決とチーム支援
- **CI/CD改善**: パイプライン失敗の原因分析と修正
- **システム設計**: 障害に強いアーキテクチャの設計

---

## 🔥 最終メッセージ

**この教材を通じて、あなたが身につけたスキル:**

1. **ポートの概念**: 待ち受けと接続の違い
2. **視点の分離**: ホスト視点とコンテナ視点
3. **ネットワーク境界**: 見えない境界の存在と影響
4. **名前解決**: DNS による自動的なサービス発見
5. **問題解決**: 実務レベルのトラブルシューティング

> **「なぜその通信は成立する／しないのか」を構造的に説明できる**

**この理解があれば、あなたは実務でのあらゆるネットワーク問題に対応できます！**

---

## 🌟 発展学習への道筋

さらに学習を深めたい方へ：

- **Kubernetes ネットワーク**: Service、Ingress、NetworkPolicy
- **AWS ネットワーク**: VPC、サブネット、セキュリティグループ
- **マイクロサービス**: サービスメッシュ、API Gateway
- **監視・運用**: Prometheus、Grafana、ログ集約

**あなたの学習の旅は、ここから始まります！**