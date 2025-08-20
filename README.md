# Suno AI 歌詞・スタイル生成ツール

Suno AIで使用する歌詞とスタイル指示を生成するWebアプリケーションです。

## 🎵 プロジェクト概要

- **名前**: Suno AI 歌詞・スタイル生成ツール
- **目標**: AIを活用してSuno AIでの楽曲制作を支援する
- **主な機能**: 
  - 楽曲分析による自動設定（簡単モード）
  - 手動による詳細設定（こだわりモード）
  - Sunoタグ付き歌詞生成
  - 英語スタイル指示生成
  - 楽曲タイトル候補提案

## 🌐 URLs

- **開発環境**: http://localhost:3000
- **テスト環境**: https://3000-iaczn026a38vol24knlsf-6532622b.e2b.dev/
- **本番環境**: （Vercelデプロイ後に更新予定）

## 📊 技術スタック・アーキテクチャ

### フロントエンド
- **Framework**: Next.js 15.5.0 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: React Hooks (useState)

### バックエンド
- **Runtime**: Node.js (Next.js API Routes)
- **AI Integration**: OpenAI API (GPT-4o, GPT-4o-mini)
- **Deployment**: Vercel (本番環境)

### データフロー
1. ユーザー入力 → フロントエンドフォーム
2. 楽曲分析リクエスト → `/api/analyze` → OpenAI API
3. 歌詞生成リクエスト → `/api/generate-lyrics` → OpenAI API
4. 結果表示 → コピー機能でSuno AIに展開

## 🎤 機能詳細

### 簡単モード
- 参考楽曲（アーティスト + 楽曲名）を指定
- AIが楽曲の雰囲気・音楽スタイルを自動分析
- 分析結果を基に歌詞とスタイル指示を生成

### こだわりモード  
- 雰囲気・感情を手動で詳細設定
- 音楽スタイルを手動で詳細設定
- ボーカル設定（性別・年齢・国籍・歌唱技法）
- より細かいカスタマイズが可能

### 生成コンテンツ
1. **楽曲タイトル候補** (3つ)
2. **Sunoタグ付き歌詞** - 直接コピーして使用可能
3. **英語スタイル指示** - Suno AIの「Style of Music」欄用

## 👤 ユーザーガイド

### 基本的な使い方
1. **モード選択**: 簡単モードまたはこだわりモードを選択
2. **設定入力**: 各項目を設定（簡単モードでは楽曲分析を活用）
3. **歌詞生成**: 「歌詞・スタイルを生成する」ボタンをクリック
4. **Suno AIで使用**: 生成結果をコピーしてSuno AIに貼り付け

### Suno AIでの使用手順
1. Suno AI（suno.ai）でCustomモードを選択
2. 「Style of Music」欄に英語スタイル指示をコピー
3. 「Lyrics」欄にSunoタグ付き歌詞をコピー
4. タイトルを設定して楽曲を生成

## 🚀 デプロイ・開発状況

- **プラットフォーム**: Vercel（本番予定）
- **ステータス**: ✅ ローカル開発完了、Vercelデプロイ準備中
- **最終更新**: 2025年8月20日

### ✅ 完了済み機能
- プロジェクト基盤セットアップ（Next.js 15.5.0 + TypeScript + Tailwind）
- 簡単モード・こだわりモードの双方のUI/UX実装
- 楽曲分析API（OpenAI GPT-4o-mini連携）
- 歌詞生成API（OpenAI GPT-4o連携）
- ボーカル設定機能（性別・年齢・国籍・歌唱技法）
- Sunoタグ付き歌詞生成機能
- 英語スタイル指示生成機能  
- コピー&ペースト機能実装
- FAQとガイド機能
- ローカル開発環境での動作確認
- Gitリポジトリ管理

### 🚧 次のステップ（Vercel本番デプロイ）
- OpenAI APIキーの環境変数設定
- Vercelプロジェクトの作成とデプロイ
- 本番環境での動作テスト
- ドメイン設定（必要に応じて）

### 📊 現在のステータス
- **ローカルビルド**: ✅ 成功
- **開発サーバー**: ✅ 動作確認済み
- **API機能**: ✅ 実装完了（要OpenAI API キー）
- **UI/UX**: ✅ フル機能実装済み

## 🛠️ ローカル開発

### 前提条件
- Node.js 18.0.0以上
- npm または yarn

### セットアップ手順
```bash
# リポジトリクローン
git clone [repository-url]
cd webapp

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.localファイルでOPENAI_API_KEYを設定

# ビルドテスト
npm run build

# 開発サーバー起動
npm run dev
# → http://localhost:3000 でアクセス
```

### プロジェクト構造
```
webapp/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts      # 楽曲分析API
│   │   │   └── generate-lyrics/route.ts # 歌詞生成API
│   │   ├── globals.css               # グローバルスタイル
│   │   ├── layout.tsx                # アプリケーションレイアウト
│   │   └── page.tsx                  # メインページ
│   └── components/
│       ├── SongGeneratorForm.tsx     # 歌詞生成フォーム
│       ├── ResultDisplay.tsx         # 結果表示コンポーネント
│       ├── GuideSection.tsx          # 使い方ガイド
│       └── FAQSection.tsx            # よくある質問
├── .env.example                      # 環境変数テンプレート
├── .env.local                        # 環境変数（実際のAPIキー）
├── vercel.json                       # Vercel設定
└── README.md                         # プロジェクト説明
```

### 環境変数
```
OPENAI_API_KEY=your_openai_api_key_here
```

## 📝 注意事項

### APIキー管理
- OpenAI APIキーは適切に管理し、公開リポジトリにコミットしない
- 本番環境ではVercelの環境変数設定を使用

### 利用規約・著作権
- 生成された楽曲の商用利用についてはSuno AIの利用規約を確認
- このツールは楽曲制作の支援を目的としており、最終的な創作はユーザーが行う

### パフォーマンス
- OpenAI API使用により、生成に数十秒かかる場合があります
- 大量のリクエストはAPI制限に注意してください

## 🤝 開発・貢献

このプロジェクトは音楽制作者の創作活動を支援することを目的としています。
バグ報告や機能改善の提案をお待ちしています。