# 段階3企画書：年齢・楽曲長設定のSUNO最適化モード追加

## 目的
SUNO AIでより精密な楽曲生成を可能にするため、年齢層と楽曲長の設定を追加する

## 実装対象
1. **年齢設定** - ターゲット年齢層に応じたボーカルスタイル最適化
2. **楽曲長設定** - 楽曲の長さに応じた構成最適化
3. **SUNO最適化モード** - 既存のシンプル/カスタムモードに加えた第3のモード

## 技術仕様

### データ構造追加 (sunoVocalElements.ts)
```typescript
export interface SunoOptimizationSettings {
  ageTarget: AgeRange
  songLength: SongLength
  vocalizationStyle: VocalizationStyle
}

export interface AgeRange {
  id: string
  label: string
  description: string
  sunoKeywords: string[]
  vocalizationAdjustments: VocalElement[]
}

export interface SongLength {
  id: string
  label: string
  duration: string
  sunoStructure: string
  vocalizationTips: string[]
}
```

### UI実装 (VocalElementSelector.tsx)
- 新しいモード「SUNO最適化」の追加
- 年齢層選択UI
- 楽曲長選択UI
- 既存の段階1-2機能との統合

### 年齢層カテゴリ
- 10代 (Teen): エネルギッシュ、高音域重視
- 20代 (Young Adult): バランス型、現代的
- 30代 (Adult): 落ち着き、深み重視
- 40代+ (Mature): 渋み、豊かな表現力

### 楽曲長カテゴリ
- Short (30秒-1分): キャッチー、インパクト重視
- Medium (2-3分): バランス型、完全な楽曲
- Long (4分+): 複雑な構成、豊かな展開

## 段階的実装計画
1. データ構造設計・実装
2. UI コンポーネント作成
3. 既存システムとの統合
4. テスト・動作確認
5. Git コミット・PR作成

## 安全性対策
- 段階1-2の機能に一切影響しない実装
- 新機能はオプション扱い
- 既存のシンプル・カスタムモードは完全保持
