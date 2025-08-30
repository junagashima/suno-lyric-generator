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
  // 段階3: SUNO最適化設定の統合
  optimizationSettings?: SunoOptimizationSettings
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

// 🌟 新機能：分析結果の信頼度情報
export interface SongAnalysisResult {
  mood: string
  style: string
  tempo: string
  rhythm: string
  instruments: string
  forbidden: string
  vocalAnalysis: AnalyzedVocalResult
  // 信頼度情報
  confidence: 'high' | 'medium' | 'low'
  confidenceReason: string
  analysisType: 'database' | 'web_enhanced' | 'ai_estimation'
  webSearchPerformed: boolean
  userFeedbackRequest: string | null
  debug?: any
}