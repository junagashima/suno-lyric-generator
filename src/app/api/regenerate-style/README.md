# 🔄 /api/regenerate-style

英語スタイル指示の再生成専用API（Phase 1-4で新規作成）

## 概要

- **目的**: 既存の英語スタイル指示を改善・修正・最適化
- **主な用途**: 日本語混入修正、品質向上、ユーザー要求対応
- **新アーキテクチャ**: DecomposedElementsを活用した精密な再生成

## API仕様

### エンドポイント
```
POST /api/regenerate-style
```

### リクエスト形式
```typescript
interface RegenerateStyleRequest {
  currentStyleInstruction: string           // 現在のスタイル指示
  regenerationReason: 'japanese_detected' | 'quality_improvement' | 'user_request' | 'optimization'
  issueDetails?: string[]                   // 具体的な問題点
  decomposedElements?: DecomposedElements   // 楽曲要素（オプショナル）
  enhancementLevel: 'minor' | 'major' | 'complete'
  preserveOriginalStructure?: boolean       // 元構造の保持
}
```

### レスポンス形式
```typescript
interface RegenerateStyleApiResponse {
  newStyleInstruction: string      // 再生成された英語スタイル指示
  regenerationReason: string       // 再生成理由の説明
  qualityCheck: {                  // 品質チェック結果
    hasJapanese: boolean
    confidence: 'high' | 'medium' | 'low'
    issues: string[]
  }
}
```

## 使用例

### 1. 日本語混入の修正
```json
{
  "currentStyleInstruction": "Purpose: MV track. Mood: エネルギッシュ. Instruments: ギター + ドラム.",
  "regenerationReason": "japanese_detected",
  "issueDetails": ["エネルギッシュ", "ギター", "ドラム"],
  "enhancementLevel": "major"
}
```

### 2. 品質向上
```json
{
  "currentStyleInstruction": "Rock song with guitar and drums",
  "regenerationReason": "quality_improvement", 
  "enhancementLevel": "complete",
  "decomposedElements": {
    "instruments": "electric guitar, bass guitar, drum kit",
    "tempo": "medium-fast (110 BPM)",
    "mood": "energetic, powerful"
  }
}
```

### 3. ユーザー要求対応
```json
{
  "currentStyleInstruction": "Purpose: BGM, slow tempo, piano only",
  "regenerationReason": "user_request",
  "issueDetails": ["テンポを速くしてほしい", "楽器を追加してほしい"],
  "enhancementLevel": "major"
}
```

## 機能詳細

### 🎯 再生成理由別の処理

1. **japanese_detected**: 日本語文字の完全除去と英語化
2. **quality_improvement**: Suno AI最適化と品質向上
3. **user_request**: ユーザー指定要求への対応
4. **optimization**: 一般的な最適化処理

### 🔍 品質チェック機能

- **日本語文字検出**: 完全な英語化確認
- **必須要素確認**: Purpose, Mood, Tempo, Instruments
- **長さ検証**: 50-500文字の適切な範囲
- **禁止表現検出**: 'musical journey'等の除去確認

### 🚀 最適化レベル

- **minor**: 軽微な修正（誤字・表現改善）
- **major**: 大幅な改善（構造再編成）
- **complete**: 完全な再構築（新アーキテクチャ活用）

## 新アーキテクチャとの連携

- `DecomposedElements`を参照した精密な再生成
- 楽器構成・テンポ・ムード等の正確な反映
- ボーカル要素の詳細指定対応

## エラーハンドリング

- 400: スタイル指示未指定
- 500: OpenAI API キー未設定、処理エラー

## セキュリティ

- OpenAI APIキーの環境変数管理
- 入力検証とサニタイゼーション
- エラー情報の適切な処理