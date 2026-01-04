# Step4: 名前解決の仕組み

## 🎯 学習目標

**このステップを通じて、あなたはこう説明できるようになります：**

> 「**同一Dockerネットワーク内では、Dockerエンジンが内蔵DNSサーバーとして機能し、サービス名をIPアドレスに自動変換するため、サービス名で通信できます。**」

**所要時間: 約30分**

---

## 📋 今回のテーマ：「なぜサービス名で通信できるのか」を理解する

### 🏢 「名前解決」のアナロジー

**Name Resolution（名前解決）** = **名前をアドレスに変換する仕組み**

電話帳システムで考えてみましょう：

```
オフィスビルの内線システム                Dockerネットワークの名前解決
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏢 同じ建物（app-network）               🌐 app-network                      │
│                                                                             │
│ 📞 内線システム（PBX）                   🐳 Docker内蔵DNS                    │
│ ┌─────────────────────────────────┐     ┌─────────────────────────────────┐ │
│ │ 📋 内線番号帳                   │     │ 🗂️ サービス名→IP変換テーブル    │ │
│ │                                 │     │                                 │ │
│ │ 営業部     → 内線101            │     │ frontend  → 172.20.0.2          │ │
│ │ 開発部     → 内線102            │     │ backend   → 172.20.0.3          │ │
│ │ 総務部     → 内線103            │     │ database  → 172.20.0.4          │ │
│ └─────────────────────────────────┘     └─────────────────────────────────┘ │
│                                                                             │
│ 👥 営業部（frontend）                   🖥️ Frontend Container               │
│ 「開発部につないで」                     curl http://backend:8000            │
│      ↓                                       ↓                             │
│ 📞 PBXが内線102に接続                   🐳 DockerがIPアドレスに変換          │
│      ↓                                       ↓                             │
│ 💼 開発部（backend）                    ⚙️ Backend Container                │
└─────────────────────────────────────────────────────────────────────────────┘
```

**重要な気づき：**
- **内線番号を覚える必要がない** → **IPアドレスを覚える必要がない**
- **PBXが自動で番号変換** → **Dockerが自動でIP変換**
- **同じ建物内でのみ有効** → **同じネットワーク内でのみ有効**

### 🔍 中心となる問い

> **なぜ `backend` という名前だけで通信できるのか？**

### 💡 実務での価値

- **設定の簡素化**（IPアドレスの管理が不要）
- **動的環境への対応**（コンテナ再起動でIPが変わっても問題なし）
- **可読性の向上**（設定ファイルが理解しやすい）

---

## 🤔 なぜこの学習が重要なのか

### 実務でよくある混乱

**場面1: 「IPアドレスで指定したら動かない」**
```
「データベースのIPアドレスを直接指定したら、
 コンテナを再起動した後に接続できなくなりました」
「なぜサービス名だと安定するんですか？」
```

**場面2: 「外部からサービス名でアクセスできない」**
```
「ホストから `backend` でアクセスしようとしたら、
 名前解決できませんでした」
「なぜコンテナ内からは可能なんですか？」
```

**場面3: 「Kubernetesでも同じ仕組み？」**
```
「DockerとKubernetesで名前解決の仕組みは同じですか？」
「Service名やPod名での通信原理を知りたいです」
```

### 多くのエンジニアが誤解すること

❌ **「サービス名は設定ファイルの便利機能」**
- 実際はDNSによる本格的な名前解決システム

❌ **「IPアドレスの方が確実」**
- コンテナのIPは動的に変わるため、サービス名の方が安定

❌ **「外部からもサービス名でアクセスできる」**
- サービス名はネットワーク内でのみ有効

✅ **正しい理解**
- **Docker内蔵DNSが名前解決を担当**
- **サービス名→IPアドレスの自動変換**
- **ネットワーク境界内でのみ有効**

---

## 🏗️ 今回の構成を理解する

### 現在の状態：同一ネットワークで名前解決が機能

```
app-network（同一ネットワーク）
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🐳 Docker内蔵DNS                                    │
│                   ┌─────────────────────────────────┐                       │
│                   │ 🗂️ 名前解決テーブル              │                       │
│                   │ frontend  → 172.20.0.2         │                       │
│                   │ backend   → 172.20.0.3         │                       │
│                   │ database  → 172.20.0.4         │                       │
│                   └─────────────────────────────────┘                       │
│                                                                             │
│  🖥️ Frontend        ⚙️ Backend         🗃️ Database                        │
│  172.20.0.2         172.20.0.3         172.20.0.4                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │ :3000       │    │ :8000       │    │ :5432       │                     │
│  │             │───▶│             │───▶│             │                     │
│  │             │    │             │    │             │                     │
│  └─────────────┘    └─────────────┘    └─────────────┘                     │
│                                                                             │
│  ✅ サービス名で通信可能                                                      │
│  curl http://backend:8000                                                   │
│  curl http://database:5432                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 名前解決の流れ

```
1. Frontend → Backend への通信要求
   curl http://backend:8000/health

2. Docker内蔵DNSに名前解決を問い合わせ
   「backend」のIPアドレスは？

3. Docker内蔵DNSが応答
   「backend」→ 172.20.0.3

4. 実際の通信
   curl http://172.20.0.3:8000/health

5. 通信成功 ✅
```

**重要な気づき：**
> **サービス名は「見た目」で、実際の通信はIPアドレスで行われている**

---

## 🚀 実習手順

> **目的**: 名前解決の仕組みを理解し、DNSの動作を体験する

### 1. 環境の準備と起動
```bash
# 環境をクリーンアップ
docker compose down -v --remove-orphans

# コンテナを起動
docker compose up -d

# 起動状況の確認
docker compose ps
```

**期待する結果:**
```
NAME                     COMMAND                  PORTS
infra-handson-backend    "docker-entrypoint.s…"  0.0.0.0:8000->8000/tcp
infra-handson-database   "docker-entrypoint.s…"  5432/tcp
infra-handson-frontend   "docker-entrypoint.s…"  0.0.0.0:3000->3000/tcp
```

### 2. ネットワーク構成の確認

#### 2-1. ネットワーク情報の確認
```bash
# ネットワーク一覧
docker network ls

# app-networkの詳細確認
docker network inspect infra-handson-docker-network_app-network
```

**注目ポイント:**
- 全てのコンテナが同一ネットワーク（app-network）に属している
- 各コンテナに動的IPアドレスが割り当てられている

#### 2-2. コンテナのIPアドレス確認
```bash
# 各コンテナのIPアドレスを確認
docker compose exec frontend hostname -i
docker compose exec backend hostname -i
docker compose exec database hostname -i
```

**期待する結果:**
```
172.20.0.2  # frontend（例）
172.20.0.3  # backend（例）
172.20.0.4  # database（例）
```

**💡 注意**: IPアドレスは動的に割り当てられるため、上記は例です。実際の実行時には異なるIPアドレスが表示される可能性があります。

### 3. 名前解決の動作確認

#### 3-1. サービス名での名前解決テスト
```bash
# フロントエンドコンテナに入る
docker compose exec frontend sh

# サービス名の名前解決を確認
nslookup backend
nslookup database

# IPアドレスを直接確認
ping -c 1 backend
ping -c 1 database

# コンテナから出る
exit
```

**期待する結果:**
```
# nslookup backend
Server:    127.0.0.11
Address:   127.0.0.11:53

Name:      backend
Address:   172.20.0.3

# ping backend
PING backend (172.20.0.3): 56 data bytes
64 bytes from 172.20.0.3: seq=0 ttl=64 time=0.123 ms
```

**💡 重要な発見:**
- **127.0.0.11:53**: Docker内蔵DNSサーバーのアドレス
- **backend → 172.20.0.3**: サービス名が自動的にIPアドレスに変換される

#### 3-2. 実際の通信テスト
```bash
# フロントエンドコンテナに入る
docker compose exec frontend sh

# サービス名でAPI通信（成功するはず）
curl http://backend:8000/health

# IPアドレス直接指定でも通信（成功するはず）
curl http://172.20.0.3:8000/health

# データベースへの接続確認（telnetがない場合はスキップ）
# telnet database 5432
# または、ncコマンドで接続確認
nc -zv database 5432

# コンテナから出る
exit
```

**期待する結果:**
```json
{"status":"OK","message":"Task API is running"}
```

### 4. 名前解決の境界を理解する

#### 4-1. ホストからの名前解決テスト（失敗するはず）
```bash
# ホストから直接サービス名でアクセス（失敗するはず）
curl http://backend:8000/health

# ホストから名前解決を試行（失敗するはず）
nslookup backend
```

**期待する結果:**
```
curl: (6) Could not resolve host: backend
# または
nslookup: can't resolve 'backend': Name does not resolve
```

#### 4-2. ホストからIPアドレス直接指定（失敗するはず）
```bash
# コンテナのIPアドレスを確認（動的に割り当てられるため、実行時に異なる可能性あり）
BACKEND_IP=$(docker compose exec backend hostname -i | tr -d '\r')
echo "Backend IP: $BACKEND_IP"

# ホストからIPアドレス直接指定（失敗するはず）
curl http://$BACKEND_IP:8000/health
```

**💡 重要な注意:**
- **IPアドレスは動的**: コンテナ再起動時にIPアドレスが変わる可能性があります
- **上記のIPアドレスは例**: 実際の実行時には異なるIPアドレスが表示される可能性があります
- **コマンドで動的取得**: 上記の `BACKEND_IP=$(...)` コマンドで現在のIPアドレスを取得してください

**期待する結果:**
```
curl: (7) Failed to connect to 172.20.0.3 port 8000: Connection refused
```

**💡 注意**: 上記のIPアドレスは例です。実際のエラーメッセージでは、現在のコンテナのIPアドレスが表示されます。

**💡 重要な理解:**
- **サービス名**: ネットワーク内でのみ有効
- **コンテナIP**: ホストからは直接アクセス不可（ポート公開が必要）

### 5. DNS設定の詳細確認

#### 5-1. コンテナ内のDNS設定確認
```bash
# フロントエンドコンテナに入る
docker compose exec frontend sh

# DNS設定ファイルを確認
cat /etc/resolv.conf

# hostsファイルを確認
cat /etc/hosts

# コンテナから出る
exit
```

**期待する結果:**
```
# /etc/resolv.conf
nameserver 127.0.0.11
options ndots:0

# /etc/hosts
127.0.0.1       localhost
::1             localhost ip6-localhost ip6-loopback
172.20.0.2      actual-container-hash-id
```

**💡 DNS設定の解説:**
- **nameserver 127.0.0.11**: Docker内蔵DNSサーバー
- **ndots:0**: ドット区切りなしの名前も検索対象
- **hosts**: 自分自身の情報（実際のコンテナIDハッシュが表示される）

#### 5-2. Docker内蔵DNSの動作確認
```bash
# フロントエンドコンテナに入る
docker compose exec frontend sh

# digコマンドでDNS詳細確認（digがある場合）
dig backend

# または、より詳細なnslookup
nslookup -type=A backend

# コンテナから出る
exit
```

---

## 🔍 確認ポイント

### ✅ 名前解決体験チェックリスト

- [ ] サービス名での名前解決が成功することを確認
- [ ] Docker内蔵DNS（127.0.0.11）の存在を確認
- [ ] サービス名→IPアドレス変換の動作を確認
- [ ] ホストからはサービス名解決できないことを確認
- [ ] コンテナ内DNS設定（/etc/resolv.conf）を確認

### 🤔 理解度チェック

以下の質問に答えられるか確認してください：

1. **なぜサービス名で通信できるのですか？**

<details>
<summary>解答を見る</summary>

**Docker内蔵DNSによる名前解決**
- Dockerエンジンが各ネットワークに内蔵DNSサーバー（127.0.0.11）を提供
- サービス名を自動的にコンテナのIPアドレスに変換
- 同一ネットワーク内のコンテナ間でのみ有効

**電話帳のアナロジー:**
- PBX（構内交換機）が内線番号を管理するように
- Docker内蔵DNSがサービス名とIPの対応を管理

</details>

2. **ホストからサービス名でアクセスできないのはなぜですか？**

<details>
<summary>解答を見る</summary>

**DNS名前空間の分離**
- Docker内蔵DNSはネットワーク内でのみ有効
- ホストは異なるDNSサーバー（通常は8.8.8.8など）を使用
- サービス名はDockerネットワーク内の「内線番号」のような存在

**解決方法:**
- ホストからは `localhost:8000` でアクセス（ポート公開経由）
- または `docker compose exec` でコンテナ内から実行

</details>

3. **実務でこの知識はどう活用しますか？**

<details>
<summary>解答を見る</summary>

**設定管理の簡素化:**
- 環境変数でサービス名を指定（IPアドレス管理不要）
- コンテナ再起動時のIP変更に自動対応

**マイクロサービス設計:**
- サービス間通信の設定が読みやすい
- 動的スケーリング環境での安定した通信

**Kubernetes応用:**
- Service名、Pod名での通信原理は同じ
- DNS-based service discoveryの理解

</details>

---

## 🛠️ トラブルシューティング

### よくある問題と解決方法

#### 問題1: 名前解決ができない
```bash
# ネットワーク接続を確認
docker compose exec frontend ping backend

# DNS設定を確認
docker compose exec frontend cat /etc/resolv.conf

# 同一ネットワークに属しているか確認
docker network inspect infra-handson-docker-network_app-network
```

#### 問題2: IPアドレスが期待と異なる
```bash
# コンテナを再起動してIPアドレスの動的割り当てを確認
docker compose restart backend
docker compose exec frontend nslookup backend

# 現在のIPアドレスを再取得
docker compose exec backend hostname -i
```

**💡 重要**: DockerコンテナのIPアドレスは動的に割り当てられるため、コンテナ再起動時に変更される可能性があります。これがサービス名での通信が重要な理由です。

#### 問題3: DNS応答が遅い
```bash
# DNS キャッシュをクリア（コンテナ再起動）
docker compose restart frontend

# または、DNSサーバーを直接指定
docker compose exec frontend nslookup backend 127.0.0.11
```

---

## 🎓 Step4で身につけたこと

- **DNS名前解決の仕組み**: Docker内蔵DNSの動作原理
- **サービス名通信の実体**: IPアドレス変換による実際の通信
- **ネットワーク境界の理解**: DNS名前空間の分離
- **実務スキル**: 動的環境での安定した通信設計

---

## 📚 次のステップへ

Step4が完了したら、次のステップに進みましょう：

```bash
# 環境の掃除
docker compose down -v --remove-orphans

# 次のステップへ
git checkout step5-final-exercise
```

**Step5では「総合演習」を行います。**

> 複数の要因が絡み合った問題を、これまでの知識で解決しましょう！

---

## 💡 実務への応用

Step4で学んだことは実務でこのように活用できます：

- **マイクロサービス設計**: サービス名ベースの通信設計
- **設定管理**: 環境変数でのサービス名指定
- **Kubernetes運用**: Service Discovery の理解
- **トラブルシューティング**: 名前解決問題の迅速な特定

---

## 🌐 補足：他の環境での名前解決

### Kubernetesでの名前解決

```bash
# Kubernetes内でのサービス通信例
curl http://backend-service:8000/health
curl http://backend-service.default.svc.cluster.local:8000/health
```

**Kubernetesの名前解決階層:**
- **サービス名**: `backend-service`
- **名前空間付き**: `backend-service.default`
- **完全修飾名**: `backend-service.default.svc.cluster.local`

### AWS ECSでの名前解決

```bash
# ECS Service Discoveryでの通信例
curl http://backend.local:8000/health
```

**共通原理:**
- **DNS-based Service Discovery**
- **動的IPアドレス管理**
- **ネットワーク境界内での名前解決**

> **Step4で学んだ原理は、あらゆるコンテナオーケストレーション環境で応用できます！**