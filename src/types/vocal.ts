// SUNOボーカル要素の型定義

export interface VocalElement {
  id: string
  category: 'tone' | 'delivery' | 'emotion' | 'pronunciation'
  label: string
  description: string
  examples: string[]
  sunoKeyword: string
}

export interface VocalConfiguration {
  selectedElements: VocalElement[]
  generatedText: string
}

export interface AnalyzedVocalResult {
  recommendedElements: VocalElement[]
  reasoning: string
  sunoText: string
}

// 既存のVocalSettingsを拡張
export interface ExtendedVocalSettings {
  gender: string
  age: string
  nationality: string
  // 新しい4要素選択方式
  selectedElements?: VocalElement[]
  // 従来の歌唱技法（後方互換性用）
  techniques?: string[]
}

// 段階3: ボーカリスト年齢・楽曲長設定のSUNO最適化モード（修正版）
export interface VocalistAge {
  id: string
  label: string
  description: string
  sunoKeywords: string[]
  vocalCharacteristics: {
    tone: string[]
    delivery: string[]
    voiceQuality: string
  }
}

export interface SunoOptimizationSettings {
  vocalistAge: VocalistAge | null
  songLength: string // 既存のsongLength値を使用（'2-3分', '3-4分', '4-5分', '5分以上'）
  vocalElements: VocalElement[]
}