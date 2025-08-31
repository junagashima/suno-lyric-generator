// 🎯 新システム用データ構造定義
// Phase 0-1: 楽曲分析からSUNO生成までの全データ型

// ===== 楽曲分析結果（生データ） =====
export interface RawAnalysisResult {
  rawText: string                    // 生の分析結果テキスト
  confidence: 'high' | 'medium' | 'low'  // 分析信頼度
  webSearchSources: string[]         // 情報源URL配列
  analysisTimestamp: string          // 分析実行時刻
}

// ===== SUNO要素への分解結果 =====
export interface DecomposedElements {
  // 不変要素（分析結果反映・ユーザー変更不可）
  instruments: string               // 楽器構成 "acoustic guitar, drums, bass"
  structure: string                // 楽曲構成 "intro → verse → chorus..."  
  rhythm: string                   // リズム "gentle 4/4 beat"
  tempo: string                    // テンポ "medium tempo (100-110 BPM)"
  forbidden: string                // 禁止要素 "No heavy distortion, No EDM"
  mood: string                     // ムード "warm, nostalgic, gentle"
  genre: string                    // ジャンル "acoustic pop ballad"
  
  // 可変要素（ユーザー設定）
  vocal: {
    attribute: VocalAttribute      // 男性ソロ、女性ソロ等
    sunoElements: string[]         // 選択された3要素
  }
}

// ===== ボーカル属性定義 =====
export type VocalAttribute = 
  | '女性（ソロ）'
  | '男性（ソロ）'
  | '中性的（ソロ）'
  | '男女デュエット'
  | '女性デュエット'
  | '男性デュエット'
  | '女性グループ（3人以上）'
  | '男性グループ（3人以上）'
  | '男女混合グループ'
  | 'コーラス重視（複数ボーカル）'

// ===== SUNO最適化要素定義 =====
export const SUNO_ELEMENTS = [
  // トーン系
  { id: 'warm', label: 'Warm（温かい）', category: 'tone', description: '温かみのあるボーカルトーン' },
  { id: 'cool', label: 'Cool（クール）', category: 'tone', description: 'クールで洗練されたトーン' },
  { id: 'bright', label: 'Bright（明るい）', category: 'tone', description: '明るく輝きのあるトーン' },
  { id: 'dark', label: 'Dark（ダーク）', category: 'tone', description: 'ダークで深いトーン' },
  
  // デリバリー系  
  { id: 'smooth', label: 'Smooth（滑らか）', category: 'delivery', description: '滑らかで流れるような歌唱' },
  { id: 'rough', label: 'Rough（ラフ）', category: 'delivery', description: 'ざらつきのある力強い歌唱' },
  { id: 'breathy', label: 'Breathy（息遣い）', category: 'delivery', description: '息遣いが感じられる親密な歌唱' },
  { id: 'clear', label: 'Clear（クリア）', category: 'delivery', description: 'クリアで明瞭な発音' },
  
  // エモーション系
  { id: 'passionate', label: 'Passionate（情熱的）', category: 'emotion', description: '情熱的で力強い感情表現' },
  { id: 'emotional', label: 'Emotional（感情的）', category: 'emotion', description: '感情豊かな表現力' },
  { id: 'melancholic', label: 'Melancholic（憂鬱）', category: 'emotion', description: '憂鬱で切ない感情表現' },
  { id: 'joyful', label: 'Joyful（喜びに満ちた）', category: 'emotion', description: '喜びと明るさに満ちた表現' },
  
  // 発音系
  { id: 'articulated', label: 'Articulated（明瞭）', category: 'pronunciation', description: '明瞭で正確な発音' },
  { id: 'slurred', label: 'Slurred（流れるような）', category: 'pronunciation', description: 'リラックスした流れるような発音' },
  { id: 'whispered', label: 'Whispered（ささやき）', category: 'pronunciation', description: 'ささやくような親密な発音' },
  { id: 'powerful', label: 'Powerful（力強い）', category: 'pronunciation', description: '力強く迫力のある発音' }
] as const

export type SunoElementId = typeof SUNO_ELEMENTS[number]['id']

// ===== ユーザー設定項目 =====
export interface UserSettings {
  songLength: '2-3分' | '3-4分' | '4-5分' | '5分以上'  // 楽曲の長さ
  rapMode: 'none' | 'partial' | 'full'                // ラップ有無
  language: {
    primary: 'japanese' | 'english'                   // 基本言語
    englishMixLevel?: 'none' | 'light' | 'moderate' | 'heavy'  // 英語混在レベル
  }
  // Step 3: 追加された設定項目
  vocalAttribute?: VocalAttribute                      // ボーカル属性（オプショナル - 後方互換性）
  sunoElements?: string[]                              // SUNO最適化要素（オプショナル - 後方互換性）
  lyricsContent: string           // 歌詞に含めたい内容
  theme: string                   // 歌詞用テーマ（楽曲分析のテーマとは別）
  // Phase 2: 内容反映度設定を追加
  contentReflection: 'literal' | 'metaphorical' | 'balanced'  // 内容反映方法
}

// ===== 最終生成物 =====
export interface FinalOutput {
  titles: string[]                // タイトル案3つ
  lyrics: string                  // SUNOタグ付き歌詞
  styleInstruction: string        // 英語スタイル指示
  editableStyle: boolean          // 編集可能フラグ
  regenerationSupported: boolean  // 再生成対応フラグ
  qualityCheck?: {
    hasJapanese: boolean          // 日本語混入チェック
    confidence: 'high' | 'medium' | 'low'
    issues: string[]              // 検出された問題
  }
}

// ===== アプリケーション全体の状態管理 =====
export interface AppFlowState {
  currentStep: 'input' | 'analysis' | 'decompose' | 'settings' | 'output'
  analysisResult: RawAnalysisResult | null
  decomposedElements: DecomposedElements | null
  userSettings: UserSettings
  finalOutput: FinalOutput | null
  isEditing: boolean
  isLoading: boolean
  error: string | null
}

// ===== API レスポンス型定義 =====
export interface AnalyzeApiResponse {
  rawAnalysis: RawAnalysisResult
  confidence: string
  sources: string[]
}

export interface DecomposeApiResponse {
  decomposedElements: DecomposedElements
  success: boolean
  message?: string
}

export interface GenerateLyricsApiResponse {
  titles: string[]
  lyrics: string
  styleInstruction: string
  qualityCheck: FinalOutput['qualityCheck']
}

export interface RegenerateStyleApiResponse {
  newStyleInstruction: string
  regenerationReason: string
  qualityCheck: FinalOutput['qualityCheck']
}

// ===== ユーティリティ型 =====
export type StepTransition = 
  | { from: 'input', to: 'analysis' }
  | { from: 'analysis', to: 'decompose' }  
  | { from: 'decompose', to: 'settings' }
  | { from: 'settings', to: 'output' }

export type ApiEndpoint = 
  | '/api/analyze'
  | '/api/decompose' 
  | '/api/generate-lyrics'
  | '/api/regenerate-style'