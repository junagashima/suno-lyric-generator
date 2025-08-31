import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { VocalConfiguration, VocalElement } from '../../../types/vocal'
// 🎯 Phase 1-3: 新アーキテクチャ型定義インポート
import { DecomposedElements, UserSettings, FinalOutput } from '../../../types/analysis'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// === Phase 2: 安全なリファクタリング - Step 1 ===
// 翻訳関数群（既存コードから抽出）
function translateToEnglish(text: string): string {
  const translations: Record<string, string> = {
    // 既存の翻訳
    '愛': 'love', '恋': 'romance', '恋愛': 'love', '友情': 'friendship',
    '家族': 'family', '希望': 'hope', '夢': 'dreams', '青春': 'youth',
    '悲しみ': 'sadness', '喜び': 'joy', '怒り': 'anger', '平和': 'peace',
    '戦争': 'war', '自然': 'nature', '音楽': 'music', '人生': 'life',
    '成長': 'growth', '別れ': 'farewell', '再会': 'reunion', '故郷': 'hometown',
    '旅': 'journey', '冒険': 'adventure', '挑戦': 'challenge', '応援': 'encouragement',
    
    // 楽曲長の翻訳
    '2-3分': '2-3 minutes', '3-4分': '3-4 minutes', '4-5分': '4-5 minutes', 
    '5分以上': 'over 5 minutes', '1分程度': 'about 1 minute', '短い': 'short',
    '長い': 'long', '標準': 'standard length',
    
    // 感情・ムードの翻訳
    'エネルギッシュ': 'energetic', 'メランコリック': 'melancholic', 'ノスタルジック': 'nostalgic',
    'アップビート': 'upbeat', 'ダウンテンポ': 'downtempo', 'チル': 'chill',
    'ドラマティック': 'dramatic', 'ロマンチック': 'romantic', 'パワフル': 'powerful',
    'やさしい': 'gentle', '激しい': 'intense', 'ポジティブ': 'positive',
    'ネガティブ': 'negative', 'クール': 'cool', 'ホット': 'hot',
    
    // テンポ・リズム関連
    'スロー': 'slow', 'ミディアム': 'medium', 'ファスト': 'fast',
    'ミディアムテンポ': 'medium tempo', 'グルーヴ重視': 'groove-focused',
    'ビート重視': 'beat-focused', 'リズミカル': 'rhythmic',
    
    // 🎯 Phase 1-A: 高頻出複合句パターンの追加
    'ミディアムテンポ、グルーヴ重視': 'medium tempo, groove-focused',
    'スローテンポ、リラックス': 'slow tempo, relaxed',
    'ファストテンポ、エナジェティック': 'fast tempo, energetic',
    'アップテンポ、ノリの良い': 'uptempo, groove-driven',
    'ドライビング、パワフル': 'driving, powerful',
    
    // ボーカル関連
    '男性ボーカル': 'male vocals', '女性ボーカル': 'female vocals',
    '男女混合': 'mixed male and female', '男女混合グループ': 'mixed gender group',
    'デュエット': 'duet', 'コーラス': 'chorus', 'ハーモニー': 'harmony',
    '女性（ソロ）': 'female solo vocals', '男性（ソロ）': 'male solo vocals',
    '女性ソロ': 'female solo vocals', '男性ソロ': 'male solo vocals',
    
    // 🎯 Phase 1-A: ボーカル関連の頻出パターン追加
    '男性voice': 'male vocals',
    '女性voice': 'female vocals', 
    '男性': 'male',
    '女性': 'female',
    'voice': 'vocals',
    'ボイス': 'voice',
    '歌声': 'vocals',
    
    // 🎯 Phase 1-A: 楽器・音楽要素の翻訳追加
    'ギター': 'guitar', 'ベース': 'bass', 'ドラム': 'drums', 'ピアノ': 'piano',
    'シンセ': 'synthesizer', 'ストリングス': 'strings', 'ブラス': 'brass',
    'アコースティック': 'acoustic', 'エレクトリック': 'electric',
    '生楽器': 'live instruments', '電子楽器': 'electronic instruments',
    
    // ジャンル・スタイル関連
    'ポップス': 'pop', 'ロック': 'rock', 'バラード': 'ballad', 'フォーク': 'folk',
    'ジャズ': 'jazz', 'ブルース': 'blues', 'カントリー': 'country', 'R&B': 'R&B',
    'ヒップホップ': 'hip-hop', 'ラップ': 'rap', 'エレクトロ': 'electro',
    
    // 音質・表現関連  
    'クリア': 'clear', 'ディストーション': 'distorted', 'リバーブ': 'reverb',
    'エコー': 'echo', 'フェード': 'fade', 'ビブラート': 'vibrato'
  };
  
  return translations[text] || text;
}

function translateMoodToEnglish(moodText: string): string {
  const moodTranslations: Record<string, string> = {
    '穏やか': 'calm', '優しい': 'gentle', 'エネルギッシュ': 'energetic',
    '情熱的': 'passionate', '切ない': 'melancholic', '明るい': 'bright',
    '暗い': 'dark', '力強い': 'powerful', '繊細': 'delicate',
    '激しい': 'intense', '静寂': 'serene', '神秘的': 'mysterious',
    '温かい': 'warm', '冷たい': 'cool', 'ドラマチック': 'dramatic'
  };
  
  // 複数の形容詞が含まれている場合の処理
  let translated = moodText;
  Object.entries(moodTranslations).forEach(([jp, en]) => {
    translated = translated.replace(new RegExp(jp, 'g'), en);
  });
  
  return translated;
}

// 巨大プロンプト復旧完了 - すべての重要な機能と連携を保持


// プロ仕様タイトル生成（J-POPヒットノウハウ統合版）
function generateFallbackTitles(theme: string, mood: string, content: string): string[] {
  const titles: string[] = []
  
  // 🎯 戦略1: 短く口にしやすい（2-4語以内）
  const shortTitles = []
  
  // 🎨 戦略2: 視覚的イメージ重視（色・季節・場所）
  const visualTitles = []
  
  // 💫 戦略3: 感情直球ワード
  const emotionalTitles = []
  
  // テーマ別戦略的タイトル生成
  if (theme.includes('恋') || theme.includes('愛')) {
    shortTitles.push('君だけ', 'LOVE', 'キミ', '愛')
    visualTitles.push('桜色の恋', '夜空と君', '赤い糸', '恋の季節')
    emotionalTitles.push('君への想い', '愛をこめて', '恋心', '切ない愛')
  } else if (theme.includes('卒業') || theme.includes('別れ')) {
    shortTitles.push('さよなら', 'Goodbye', '旅立ち', '門出')
    visualTitles.push('桜散る日', '青春の扉', '夕暮れ道', '春の別れ')
    emotionalTitles.push('涙の卒業式', '思い出たち', '新しい明日', 'ありがとう')
  } else if (theme.includes('友情') || theme.includes('仲間')) {
    shortTitles.push('友達', 'Together', '仲間', '絆')
    visualTitles.push('虹の向こう', '青い空と', '街角で', '夏の友達')
    emotionalTitles.push('かけがえのない時間', '友情の歌', 'ずっと一緒', '心の友')
  } else if (theme.includes('家族')) {
    shortTitles.push('家族', 'Family', 'ありがとう', '母')
    visualTitles.push('温かい家', '夕飯の時間', '帰り道', '家族写真')
    emotionalTitles.push('ありがとうの歌', '家族の愛', '温もり', 'おかえり')
  } else if (theme.includes('夢') || theme.includes('希望')) {
    shortTitles.push('夢', 'Dream', '希望', 'Believe')
    visualTitles.push('虹のかなた', '星空の夢', '明日の空', '光の道')
    emotionalTitles.push('諦めない心', '夢を追いかけて', '希望の光', '未来への扉')
  }

  // 雰囲気別タイトル強化
  if (mood.includes('切ない') || mood.includes('悲しい')) {
    shortTitles.push('涙', '想い', '雨', '夜')
    visualTitles.push('雨の日', '夜の街', '灰色の空', '静かな部屋')
    emotionalTitles.push('心の雨', '涙そうそう', '切ない想い', '孤独な夜')
  } else if (mood.includes('希望') || mood.includes('前向き') || mood.includes('エネルギッシュ')) {
    shortTitles.push('光', 'Shine', '今日', '明日')
    visualTitles.push('青い空', '太陽の歌', '新しい朝', '虹色の日')
    emotionalTitles.push('輝く未来', '負けないで', '新しいスタート', '希望の歌')
  } else if (mood.includes('温かい') || mood.includes('優しい')) {
    shortTitles.push('優しさ', 'Heart', '温もり', '笑顔')
    visualTitles.push('春の陽だまり', '夕焼け空', '花畑', '暖かい部屋')
    emotionalTitles.push('やさしい時間', '心の温もり', '愛のうた', '安らぎ')
  }

  // 🎵 戦略4: 音の響き・リズム重視
  const rhythmicTitles = ['ワンダフル', 'キラキラ', 'ドキドキ', 'ワクワク', 'メロディー']
  
  // 🌟 戦略5: 抽象的・余白のあるタイトル
  const abstractTitles = ['物語', 'ココロ', 'カタチ', '軌跡', 'かけら', '瞬間', '記憶']

  // ノウハウ統合: バランス良く選出
  const allTitles = [
    ...shortTitles.slice(0, 2),      // 短さ重視
    ...visualTitles.slice(0, 2),     // 視覚的
    ...emotionalTitles.slice(0, 2),  // 感情的
    ...rhythmicTitles.slice(0, 1),   // 音響的
    ...abstractTitles.slice(0, 1)    // 抽象的
  ].filter(Boolean)

  // 重複排除して返却
  return [...new Set(allTitles)]
}

interface VocalSettings {
  gender: string
  age: string
  nationality: string
  techniques: string[]
}

// 🎯 Phase 2A: SUNO構造タグ修正関数
// ユーザーのラップ設定に応じて正しい構造を生成
function generateCorrectStructure(elements: DecomposedElements, settings: UserSettings): string {
  const baseStructure = elements.structure
  
  // ラップモードに応じた構造修正
  if (settings.rapMode === 'full') {
    // 全面ラップ: 標準構造を完全にラップ構造に変換
    return baseStructure
      .replace(/verse/gi, 'rap verse')
      .replace(/chorus/gi, 'rap hook')
      .replace(/pre-chorus/gi, 'rap bridge')
  } else if (settings.rapMode === 'partial') {
    // 一部ラップ: 一部のverseをrap verseに変換
    return baseStructure
      .replace(/→ verse → chorus/, '→ verse → chorus → rap verse → chorus')
      .replace(/verse → chorus → verse/, 'verse → chorus → rap verse')
  }
  
  // ラップなし: 元の構造をそのまま使用
  return baseStructure
}

// 🎯 Phase 2A: SUNOジャンルタグ生成関数
// SUNOルールに完全準拠したジャンルタグを生成
function generateGenreTags(elements: DecomposedElements, settings: UserSettings): string {
  const tags: string[] = []
  
  // ラップモード対応
  if (settings.rapMode === 'full') {
    tags.push('hiphop', 'rap', 'japanese rap')
  } else if (settings.rapMode === 'partial') {
    tags.push('jpop', 'rap elements', 'hip hop fusion')
  } else {
    // ジャンルベースのタグ生成
    const genre = elements.genre.toLowerCase()
    if (genre.includes('pop')) {
      tags.push('jpop', 'japanese pop')
    } else if (genre.includes('rock')) {
      tags.push('jrock', 'japanese rock')  
    } else if (genre.includes('ballad')) {
      tags.push('jpop', 'ballad', 'emotional')
    } else {
      tags.push('jpop') // デフォルト
    }
  }
  
  // ムードタグ追加
  const mood = elements.mood.toLowerCase()
  if (mood.includes('energetic')) tags.push('energetic')
  if (mood.includes('gentle')) tags.push('gentle')
  if (mood.includes('nostalgic')) tags.push('nostalgic')
  
  // タグを[]形式で結合
  const tagString = tags.map(tag => `[${tag}]`).join('')
  return `${tagString}\n\n`
}

// SUNO 4要素システム用インターフェース（修正版）
interface ApiVocalConfiguration {
  // 基本のVocalConfiguration
  selectedElements?: VocalElement[] // 選択された要素オブジェクト
  generatedText: string // 生成されたSUNOテキスト
  optimizationSettings?: any // SUNO最適化設定
  
  // API固有の追加プロパティ
  useNewSystem: boolean // SUNO最適化システムを使用するかどうか
  selectedElementLabels?: string[] // 選択された要素のラベル（互換性用）
  sunoText?: string // 生成されたSUNOテキスト（別名）
  mode?: 'simple' | 'custom' // 簡単モード（自動選択）またはカスタムモード（手動選択）
  presetId?: string // 使用されたプリセットID（プリセット使用時）
}

interface LanguageSettings {
  englishMixLevel: 'none' | 'light' | 'moderate' | 'heavy'
  languagePreference: 'auto' | 'japanese' | 'english' | 'mixed'
}

interface GenerateRequest {
  mode: 'simple' | 'custom'
  mood: string
  musicStyle: string
  theme: string
  content: string
  contentReflection?: 'literal' | 'metaphorical' | 'balanced' // Step D: 安全に追加（オプショナル）
  songLength: string
  vocal: VocalSettings
  // SUNO最適化ボーカル設定（新機能）
  vocalConfiguration?: ApiVocalConfiguration
  // 混合言語設定（新機能）
  languageSettings?: LanguageSettings
  // ラップモード選択（拡張版）
  rapMode?: 'none' | 'partial' | 'full'
  // 後方互換性のため保持
  includeRap?: boolean
  // Step I: 楽曲構造情報を受け取る
  analyzedStructure?: {
    hasRap: boolean
    vocalStyle: string
    genre: string
    isDragonAshStyle?: boolean
  }
  // 楽曲分析の詳細結果
  analyzedDetails?: {
    tempo?: string | null
    rhythm?: string | null
    instruments?: string | null
    forbidden?: string | null
  }
  // 🎯 Phase 1-3: 新アーキテクチャ対応フィールド（オプショナル - 後方互換性保持）
  decomposedElements?: DecomposedElements
  userSettings?: UserSettings
  useNewArchitecture?: boolean  // 新旧システム切り替えフラグ
}

export async function POST(request: NextRequest) {
  try {
    const {
      mode,
      mood,
      musicStyle,
      theme,
      content,
      contentReflection = 'literal', // Step D: 安全なデフォルト値
      songLength,
      vocal,
      vocalConfiguration, // 新機能：SUNO最適化ボーカル設定
      languageSettings, // 新機能：混合言語設定
      rapMode = 'none', // 新しいラップモード
      includeRap = false, // 後方互換性のため保持
      analyzedStructure, // Step I: 楽曲構造情報
      analyzedDetails, // 楽曲分析の詳細結果
      // 🎯 Phase 1-3: 新アーキテクチャフィールド追加
      decomposedElements,
      userSettings,
      useNewArchitecture = false // デフォルトは従来システム使用
    }: GenerateRequest = await request.json()

    // 後方互換性: includeRapがtrueの場合はpartialに変換
    const finalRapMode = ((): 'none' | 'partial' | 'full' => {
      if (includeRap && rapMode === 'none') {
        return 'partial'
      } else if (rapMode) {
        return rapMode as 'none' | 'partial' | 'full'
      }
      return 'none'
    })()

    // 🎯 Phase 1-3: 新アーキテクチャ対応 - 早期分岐処理
    if (useNewArchitecture && decomposedElements && userSettings) {
      console.log('🚀 新アーキテクチャモードで処理開始')
      console.log('- decomposedElements:', decomposedElements)
      console.log('- userSettings:', userSettings)
      
      // 新アーキテクチャ専用処理（後続で実装）
      return await handleNewArchitectureGeneration(decomposedElements, userSettings, request)
    }

    // 既存システム（従来通りの処理を継続）
    console.log('🔄 従来アーキテクチャモードで処理継続')

    // 不要な楽器を除去する関数（改良版）
    const removeUnwantedInstruments = (styleText: string | undefined): string => {
      // undefined または null の場合はデフォルト楽器構成を返す
      if (!styleText) {
        return 'acoustic guitar, piano'
      }
      
      const unwantedInstruments = [
        'synth pad', 'synthpad', 'シンセパッド',
        'vocals', 'vocal', 'ボーカル', 'song', 'singing', '歌'
      ]
      
      let filteredStyle = styleText
      
      unwantedInstruments.forEach(instrument => {
        // 特殊文字をエスケープ
        const escapedInstrument = instrument.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        
        // より精密なパターンマッチング
        const patterns = [
          // 区切り文字に囲まれた楽器名
          new RegExp(`\\s*[+,&]\\s*${escapedInstrument}\\s*[+,&]\\s*`, 'gi'),
          new RegExp(`\\s*[+,&]\\s*${escapedInstrument}\\s*$`, 'gi'),
          new RegExp(`^\\s*${escapedInstrument}\\s*[+,&]\\s*`, 'gi'),
          // 単独の楽器名
          new RegExp(`\\b${escapedInstrument}\\b`, 'gi'),
          // "and"で接続された楽器名
          new RegExp(`\\s*and\\s*${escapedInstrument}\\b`, 'gi'),
          new RegExp(`\\b${escapedInstrument}\\s*and\\s*`, 'gi')
        ]
        
        patterns.forEach(pattern => {
          filteredStyle = filteredStyle.replace(pattern, ' ')
        })
      })
      
      // クリーンアップ: 連続した区切り文字や余分な空白を削除
      filteredStyle = filteredStyle
        .replace(/\s*[+,&]\s*[+,&]\s*/g, ' + ')  // 複数の区切り文字を単一の+に
        .replace(/\s+/g, ' ')                     // 複数の空白を単一の空白に
        .replace(/^\s*[+,&]\s*|[+,&]\s*$/g, '')  // 先頭や末尾の区切り文字を削除
        .replace(/\s*[+,&]\s*$/g, '')            // 末尾の区切り文字を削除
        .replace(/^\s*[+,&]\s*/g, '')            // 先頭の区切り文字を削除
        .trim()
      
      return filteredStyle
    }

    // 楽器構成の優先度付き取得
    // 1. analyzedDetails.instruments（楽曲分析結果）を最優先
    // 2. フォールバック: musicStyleから抽出
    const getInstrumentsConfiguration = (): string => {
      if (analyzedDetails?.instruments) {
        console.log('🎵 楽器構成: 分析結果を使用 -', analyzedDetails.instruments)
        return removeUnwantedInstruments(analyzedDetails.instruments)
      } else if (musicStyle) {
        console.log('🎵 楽器構成: musicStyleから抽出 -', musicStyle)
        return removeUnwantedInstruments(musicStyle)
      } else {
        console.log('🎵 楽器構成: デフォルト楽器を使用')
        return removeUnwantedInstruments(undefined) // デフォルト値を取得
      }
    }

    const actualInstruments = getInstrumentsConfiguration()
    const cleanMusicStyle = removeUnwantedInstruments(musicStyle)
    
    console.log('🎵 最終楽器構成:', actualInstruments)

    // ボーカル設定の決定（SUNO最適化 vs 従来）
    const determineVocalSettings = () => {
      if (vocalConfiguration?.useNewSystem && vocalConfiguration.sunoText) {
        // SUNO最適化システム使用時
        console.log('✅ SUNO最適化システムを使用')
        console.log('🎯 SUNOテキスト:', vocalConfiguration.sunoText)
        console.log('🎵 選択要素:', vocalConfiguration.selectedElements)
        return {
          vocalDescription: vocalConfiguration.sunoText,
          isNewSystem: true,
          selectedElements: (vocalConfiguration.selectedElements || []).map(el => 
            typeof el === 'string' ? el : el.label
          )
        } as const
      } else {
        // 従来システム使用時
        return {
          vocalDescription: `${vocal.gender}, ${vocal.age}, ${vocal.nationality}`,
          isNewSystem: false,
          techniques: vocal.techniques || [],
          selectedElements: [] // 従来システムでは空配列
        } as const
      }
    }

    const vocalSettings = determineVocalSettings()
    console.log('🎤 ボーカル設定:', vocalSettings)
    console.log('📨 受信したvocalConfiguration:', JSON.stringify(vocalConfiguration, null, 2))
    
    // 段階3: SUNO最適化設定のデバッグ情報
    if (vocalConfiguration?.optimizationSettings) {
      console.log('🚀 SUNO最適化設定受信:', {
        vocalistAge: vocalConfiguration.optimizationSettings.vocalistAge?.label,
        songLength: vocalConfiguration.optimizationSettings.songLength,
        finalSunoText: vocalConfiguration.sunoText
      })
    } else {
      console.log('⚠️  SUNO最適化設定が受信されていません')
      console.log('   - vocalConfiguration?.optimizationSettings:', vocalConfiguration?.optimizationSettings)
      console.log('   - vocalConfiguration?.useNewSystem:', vocalConfiguration?.useNewSystem)
    }

    // 混合言語制御ロジック（新機能）
    const determineLanguageSettings = () => {
      // デフォルト値設定（後方互換性）
      if (!languageSettings) {
        return {
          primaryLanguage: 'japanese',
          englishMixLevel: 'none',
          languageInstructions: ''
        }
      }

      let primaryLanguage = 'japanese'
      let englishMixLevel = languageSettings.englishMixLevel

      // 基本言語設定による決定
      switch (languageSettings.languagePreference) {
        case 'auto':
          // 国籍に基づく自動決定（従来システムのみ）
          if (!vocalSettings.isNewSystem) {
            if (vocal.nationality === 'アメリカ' || vocal.nationality === 'イギリス') {
              primaryLanguage = 'english'
              englishMixLevel = 'heavy' // 英語圏の場合は英語重視
            } else if (vocal.nationality === '韓国') {
              primaryLanguage = 'japanese'
              englishMixLevel = languageSettings.englishMixLevel // 設定に従う
            } else {
              primaryLanguage = 'japanese'
            }
          } else {
            // SUNO最適化の場合は設定に従う
            primaryLanguage = 'japanese'
          }
          break
        case 'english':
          primaryLanguage = 'english'
          englishMixLevel = 'heavy'
          break
        case 'mixed':
          primaryLanguage = 'mixed'
          englishMixLevel = languageSettings.englishMixLevel
          break
        default:
          primaryLanguage = 'japanese'
      }

      // 言語指示文生成
      let languageInstructions = ''
      
      if (primaryLanguage === 'english') {
        languageInstructions = `
## 🌐 言語設定: 英語メイン楽曲
- **基本言語**: 英語で作詞してください
- **歌詞スタイル**: 英語圏のポップス・ロックの自然な表現を使用
- **日本語要素**: ${englishMixLevel === 'heavy' ? '必要最小限に留める' : '効果的なアクセントとして部分使用可'}
- **語彙選択**: 英語ネイティブが自然に感じる表現・韻律・リズム感
- **文化的配慮**: 英語圏の音楽文化に適したテーマ展開とメッセージ性`

      } else if (primaryLanguage === 'mixed') {
        languageInstructions = `
## 🌐 言語設定: バイリンガル楽曲
- **基本構成**: 日本語と英語を自然にミックスした歌詞
- **混在パターン**: セクションごとに言語を使い分け、または1つのセクション内で混在
- **英語使用レベル**: ${
  englishMixLevel === 'light' ? '20-30%程度（決めフレーズやサビで効果的に使用）' :
  englishMixLevel === 'moderate' ? '40-50%程度（コーラス部分を英語、Verseは日本語など）' :
  '60-70%程度（英語メインで日本語をアクセントとして使用）'
}
- **自然な切り替え**: 言語の切り替えが歌詞の流れを損なわないよう配慮
- **文化的配慮**: 両言語の特性を活かした表現選択`

      } else {
        // japanese がデフォルト
        if (englishMixLevel !== 'none') {
          languageInstructions = `
## 🌐 言語設定: 日本語メイン + 英語混在
- **基本言語**: 日本語で作詞
- **英語混在レベル**: ${
  englishMixLevel === 'light' ? '軽度（10-20%程度）\n  * キーフレーズや決め台詞で英語を使用\n  * 「Dream」「Love」「Future」等の感情表現ワード\n  * サビの一部や印象的なフレーズに限定使用' :
  englishMixLevel === 'moderate' ? '中程度（30-50%程度）\n  * コーラス部分やサビで積極的に英語使用\n  * セクション単位での言語切り替え\n  * 「Verse: 日本語 → Chorus: 英語」のような構成' :
  '高度（50-70%程度）\n  * 歌詞の大部分に英語を含める\n  * 日本語は重要なメッセージ部分や情感表現に使用\n  * バイリンガル楽曲として自然な言語ミックス'
}
- **使用方針**: 
  * 英語部分も日本語の歌詞リズムに自然に融合
  * 意味の一貫性を保ちながら言語を切り替え
  * 英語フレーズは発音しやすく覚えやすいものを選択
- **具体例**: 
  ${englishMixLevel === 'light' ? '「今日という日を Dream のように」「君との Love Story」' :
    englishMixLevel === 'moderate' ? '「[Verse: 日本語歌詞] → [Chorus: Flying high to the sky, never gonna cry]」' :
    '「[Mix: 君の Heart に届け my soul, 永遠の Promise we made]」'}
`
        } else {
          languageInstructions = `
## 🌐 言語設定: 純日本語楽曲
- **基本言語**: 完全に日本語のみで作詞
- **語彙選択**: 日本語の美しい表現、情感豊かな言葉選び
- **英語要素**: 一切使用しない（外来語の日本語化された単語は可）
- **表現スタイル**: 日本の伝統的・現代的な歌詞文化に根ざした自然な日本語`
        }
      }

      return {
        primaryLanguage,
        englishMixLevel,
        languageInstructions
      }
    }

    const { primaryLanguage, englishMixLevel: finalEnglishMixLevel, languageInstructions } = determineLanguageSettings()

    if (!theme || !content) {
      return NextResponse.json(
        { error: 'テーマと歌詞の内容は必須です' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' },
        { status: 500 }
      )
    }

    // 楽曲長の統合処理（SUNO最適化設定を優先）
    const determineFinalSongLength = () => {
      // SUNO最適化設定のsongLengthを優先
      if (vocalConfiguration?.optimizationSettings?.songLength) {
        console.log('🎵 SUNO最適化設定のsongLengthを使用:', vocalConfiguration.optimizationSettings.songLength)
        return vocalConfiguration.optimizationSettings.songLength
      }
      // フォールバック：基本のsongLength
      console.log('🎵 基本のsongLengthを使用:', songLength)
      return songLength
    }
    
    const finalSongLength = determineFinalSongLength()

    // 歌詞生成プロンプト
    const lyricsPrompt = `
あなたは日本のヒット曲を数多く手がけたプロの作詞家です。Suno AIで使用するための歌詞とタイトルを作成してください。

## 楽曲設定
- モード: ${mode === 'simple' ? '簡単モード（参考楽曲ベース）' : 'こだわりモード（完全オリジナル）'}
- 楽曲の長さ: ${finalSongLength} ${vocalConfiguration?.optimizationSettings?.songLength ? '（SUNO最適化設定より）' : '（基本設定より）'}

## 楽曲の長さに応じた歌詞量調整（重要）
${finalSongLength === '2-3分' ? 
  '**短い楽曲**：各セクションは短く簡潔に。Verse（4-6行）、Chorus（4-8行）、全体で30-40行程度。' :
  finalSongLength === '3-4分' ? 
  '**標準的な楽曲**：標準的な歌詞量。Verse（6-8行）、Chorus（6-10行）、全体で50-70行程度。' :
  finalSongLength === '4-5分' ? 
  '**長い楽曲**：充実した歌詞内容。Verse（8-12行）、Chorus（8-12行）、Bridge/Cメロを含め全体で70-90行程度。' :
  finalSongLength === '5分以上' ?
  '**非常に長い楽曲**：多層的な歌詞構成。複数のストーリー展開、繰り返しセクション、全体で90行以上。' :
  '**カスタム長さ楽曲**：指定された長さに合わせた適切な歌詞量で構成。'}

## 雰囲気・感情を歌詞に反映（必須）
※ 以下の雰囲気・感情を歌詞の表現スタイル、語彙選択、リズム感に必ず反映させてください：
- 雰囲気・感情: ${mood}

**表現への反映方法**：
- 語彙選択：雰囲気に合った言葉遣い（例：切ない→繊細な言葉、エネルギッシュ→力強い言葉）
- 文体：感情に応じた文の長さと構造（例：静か→長めの文、激しい→短く刻んだ文）
- 韻律：雰囲気に合ったリズム感（例：疾走感→歯切れの良い音、優雅→流れるような音）

## 音楽スタイルを歌詞に反映（必須）
※ 以下の音楽スタイルを歌詞のリズム、語感、構成に必ず反映させてください：
- 音楽スタイル: ${cleanMusicStyle}

**スタイル反映方法**：
- BPM・テンポ：歌詞のリズム感に反映（速い→短いフレーズ、遅い→ゆったりしたフレーズ）
- ジャンル特性：ロック→力強い表現、バラード→情感豊かな表現、ポップ→親しみやすい表現
- 楽器構成：楽器の音色に合う語感・音韻の選択

## 使用シーン・コンテキスト（歌詞には直接使用せず、雰囲気作りの参考のみ）
※ 以下は楽曲が流される場面・用途です。歌詞の内容には含めず、雰囲気や表現スタイルの参考としてのみ使用してください。
- テーマ・使用場面: ${theme}

## ボーカル設定
${vocalSettings.isNewSystem ? `
**🎤 SUNO最適化システム使用**
- ボーカル指示: ${vocalSettings.vocalDescription}
- 選択要素: ${vocalSettings.selectedElements?.join(', ') || 'なし'}
- 特徴: SUNO AIの4要素システム（tone, delivery, emotion, pronunciation）によって最適化された設定

## SUNO最適化ボーカルの特徴
※ この設定では、SUNO AIが認識しやすい具体的なボーカル指示が含まれています。歌詞はこれらの特徴を活かした表現を心がけてください。
※ 特に以下の要素が重要です: ${vocalSettings.selectedElements?.join('、') || 'なし'}

${vocalConfiguration?.optimizationSettings ? `
## 🚀 SUNO最適化設定（高度設定）
**ユーザーが指定したSUNO最適化パラメータ:**
- **楽曲長**: ${vocalConfiguration.optimizationSettings.songLength || finalSongLength}（最優先で適用）
- **ボーカリスト年齢**: ${vocalConfiguration.optimizationSettings.vocalistAge?.label || '未指定'}
- **最適化要素**: ${vocalConfiguration.optimizationSettings.vocalElements?.map((el: any) => el.label).join('、') || 'なし'}

**⚠️ 重要**: この楽曲はSUNO最適化設定に基づいて作成されています。指定された楽曲長「${vocalConfiguration.optimizationSettings.songLength || finalSongLength}」に厳密に合わせて歌詞量を調整してください。
` : ''}` : `
**🎵 従来システム使用**
- 構成: ${vocal.gender}
- 年齢: ${vocal.age}
- 国籍: ${vocal.nationality}
- 歌唱技法: ${vocal.techniques.join(', ')}

## ボーカル構成の特徴
${vocal.gender.includes('グループ') || vocal.gender.includes('デュエット') || vocal.gender.includes('コーラス') ? 
  '※ このボーカル構成では、ハーモニー・コーラスワーク・対話的歌唱を効果的に活用した歌詞構成を心がけてください' : 
  '※ ソロボーカルの表現力を活かした歌詞構成を心がけてください'}`}

${languageInstructions}

## 歌詞に必ず盛り込む具体的な内容・メッセージ
※ 以下の内容は歌詞の中核として必ず反映させてください：
※ 重要：これ以外の内容（過去の例や他の楽曲の要素）は一切含めないでください：
${content}

## Step E: 内容反映方法（${contentReflection}）
${contentReflection === 'literal' ? 
  '- **専門用語・固有名詞・数字をそのまま歌詞に使用**してください\n- **具体的な内容を抽象化せず**、リズムに合わせて自然に歌詞化\n- **「スプデブ」「1-2ヶ月」等のキーワードを必ず含める**' :
contentReflection === 'metaphorical' ?
  '- **内容を詩的・象徴的に表現**し、直接的な専門用語は避ける\n- **比喩やメタファーを活用**して内容の本質を美しく表現\n- **抽象的な言葉で核心メッセージを伝達**' :
  '- **重要なキーワードは忠実に保持**、説明部分は詩的に表現\n- **専門用語の一部は残し**、周辺内容は美化して表現\n- **技術性と詩的表現のバランス**を取る'
}

## ラップセクション対応
${finalRapMode === 'full' ? `
   **🔥 全面ラップ楽曲モード 🔥**
   **この楽曲は完全なヒップホップ・ラップ楽曲として作成してください**

   **CRITICAL: 歌メロディーは一切使用せず、全セクションをラップで構成**
   - **禁止事項**: [Chorus]での歌メロディー、サビでの歌唱、メロディアスなパート
   - **必須構成**: [Intro] → [Rap Verse] → [Rap Hook/Chorus] → [Rap Verse] → [Rap Hook/Chorus] → [Outro]
   - **ラップのみ**: 全てのボーカルパートはラップ・フロー・韻踏みで構成

   **日本語フリースタイルラップ技法（全面適用）:**
   - **連続フロー**: 途切れない韻とリズムの流れ
   - **多層韻**: 内韻・脚韻・頭韻の組み合わせ
   - **ストーリーテリング**: テーマ「${theme}」に沿った物語性のある歌詞
   - **パンチライン**: セクションごとに印象的な決め台詞
   - **ビート合わせ**: ヒップホップビートに完全に同調したシラブル調整

   **全面ラップ構成要件:**
   - 各[Rap Verse]は8-16行の充実したフロー
   - [Rap Hook/Chorus]はキャッチーで反復可能なラップフレーズ
   - 楽曲全体を通してメロディーではなくリズムと韻で構成
   - テーマ「${theme}」を中心とした一貫したメッセージ
` : finalRapMode === 'partial' || analyzedStructure?.hasRap ? `
   **この楽曲にはRAP要素を含める指定です（一部ラップモード）**
   ${finalRapMode === 'partial' ? '- **ユーザー選択**: 一部ラップモード（Dragon Ash風）' : ''}
   ${analyzedStructure?.hasRap ? `- **楽曲分析検出**: ${analyzedStructure.genre} / ${analyzedStructure.vocalStyle}` : ''}

   **MANDATORY: [Rap Verse]タグを必ず歌詞に含めてください**
   - **[Rap Verse]セクションをメロディーセクションとは別に作成**
   - **推奨構成**: Intro → Verse → Pre-Chorus → Chorus → [Rap Verse] → Chorus → Outro

   **日本語ラップ基本技法:**
   - **母音合わせ**: 行末の母音を統一（例：「未来/誓い/走りたい」でa-i音）
   - **脚韻**: 行の終わりの音を揃える（最も効果的）
   - **パンチライン**: キャッチーな決め台詞を1-2箇所に配置
   - **リズム調整**: ビートに合わせた語感重視の歌詞構成

   **[Rap Verse]作成要件（4-8行）:**
   - 内容テーマに沿った自己表現・主張を含める
   - 韻踏みパターンを必ず使用
   - パワフルで印象的な語彙選択
   - 絵文字や装飾記号は使用せず、純粋な歌詞のみを出力
` : ''}

${finalRapMode === 'full' ? `
## 🔥 全面ラップ楽曲作詞要件 🔥
**この楽曲は完全なヒップホップ・ラップ楽曲として作詞してください**

1. **ヒップホップ・ラップ作詞戦略**
   - **フロー重視**: ビートに合わせたリズミカルな言葉選び
   - **韻踏み必須**: 内韻・脚韻・頭韻を効果的に使用
   - **ストーリーテリング**: テーマに沿った一貫したメッセージ
   - **パンチライン**: 印象的で記憶に残るフレーズを各セクションに配置
   - **リアルな表現**: 具体的で直球な言葉遣い

2. **全面ラップ専用Sunoタグ**
   - **楽曲構成タグ**: [Intro], [Rap Verse], [Rap Hook/Chorus], [Outro] ※[Verse], [Pre-Chorus], [Chorus]は使用禁止
   - **演出タグ**: [Beat drop], [Instrumental Break], [Scratch sounds]
   - **ボーカル指示タグ**: [Aggressive delivery], [Smooth flow], [Rapid fire], [Whispered rap]
   - **楽器指示タグ**: [Heavy bass], [Drum pattern], [Scratch effects]

3. **全面ラップ楽曲構成（MANDATORY）**
   - **短め(2-3分)**: [Intro] → [Rap Verse] → [Rap Hook/Chorus] → [Rap Verse] → [Rap Hook/Chorus] → [Outro]
   - **標準(3-4分)**: [Intro] → [Rap Verse] → [Rap Hook/Chorus] → [Rap Verse] → [Rap Hook/Chorus] → [Rap Bridge] → [Rap Hook/Chorus] → [Outro]
   - **長め(4-5分+)**: [Intro] → [Rap Verse] → [Rap Hook/Chorus] → [Rap Verse] → [Rap Hook/Chorus] → [Rap Bridge] → [Rap Verse] → [Rap Hook/Chorus] → [Outro]

**CRITICAL: メロディックな[Verse], [Pre-Chorus], [Chorus]タグは絶対に使用しないでください**
` : `
## 作詞要件
以下の要素を考慮してJ-POPヒット曲として成功する歌詞を作成してください：

1. **J-POPヒット曲の作詞戦略**
   - リスナーの記憶に残りやすい表現
   - 感情に訴えかける言葉選び
   - 共感を呼ぶ普遍的テーマの表現
   - シンプルでキャッチーな言葉の使用
   - 現代のJ-POPトレンドを反映した語彙選択

2. **Suno AIタグの効果的活用**
   - 楽曲構成タグ: [Intro], [Verse], [Pre-Chorus], [Chorus], [Bridge], [Outro]${finalRapMode === 'partial' || analyzedStructure?.hasRap ? ', [Rap Verse]' : ''}
   - 演出タグ: [Fade in], [Fade out], [Instrumental Break]
   - ボーカル指示タグ: [Vocal harmony], [Ad libs], [Whispered], [Belted]
   - 楽器指示タグ: [Piano solo], [Guitar riff], [String section]

3. **楽曲構成**
   以下の多様な構成パターンから、楽曲の雰囲気とテーマに最適な構成を選択してください：
   
   **クラシック構成**: Intro → Verse → Chorus → Verse → Chorus → Bridge → Chorus → Outro
   **シンプル構成**: Intro → Verse → Chorus → Verse → Chorus → Outro
   **プリコーラス構成**: Intro → Verse → Pre-Chorus → Chorus → Verse → Pre-Chorus → Chorus → Bridge → Chorus → Outro
   **ダブルコーラス構成**: Intro → Verse → Chorus → Verse → Chorus → Chorus → Outro
   **Cメロ構成**: Intro → Verse → Chorus → Verse → Chorus → Cメロ → Chorus → Outro
   **インスト構成**: Intro → Verse → Chorus → Instrumental Break → Verse → Chorus → Outro
   **モーダル構成**: Intro → Verse → Chorus → Interlude → Verse → Bridge → Chorus → Outro
   **アーティスティック構成**: Intro → Verse → Verse → Chorus → Verse → Bridge → Outro
   
   楽曲の長さ：${finalSongLength}
`}

${finalRapMode === 'full' ? `
## 🔥 全面ラップ楽曲出力形式 🔥
必ず以下の形式で回答してください：

**タイトル候補:**
1. タイトル1（ヒップホップらしいタイトル）
2. タイトル2（パンチのあるタイトル）
3. タイトル3（ストリート感のあるタイトル）

**歌詞（全面ラップSunoタグ付き）:**
[Intro]
[Beat starts] [Heavy bass]

[Rap Verse]
8-16行のフリースタイルラップ歌詞
（韻踏み・フロー・パンチライン必須）

[Rap Hook/Chorus]
4-8行のキャッチーなラップフック
（繰り返し可能な印象的フレーズ）

[Rap Verse]
8-16行のフリースタイルラップ歌詞
（テーマ展開・ストーリー継続）

[Rap Hook/Chorus]
4-8行のキャッチーなラップフック

[Outro]
[Beat fade] [Bass out]

**CRITICAL: [Verse], [Pre-Chorus], [Chorus]タグは絶対に使用禁止**
` : `
## 🚨 CRITICAL: SUNO AI必須タグルール（厳格遵守）

**絶対に使用してはいけないタグ形式:**
❌ [Verse 1 (Rap)] - 括弧内の説明は使用禁止
❌ [Chorus (Melody)] - 括弧内の説明は使用禁止
❌ [ラップバース] - 日本語タグは使用禁止
❌ [コーラス] - 日本語タグは使用禁止

**SUNO AIが認識する正しいタグ形式のみ使用:**
✅ [Rap Verse] - ラップセクション
✅ [Rap Hook] - ラップ用コーラス
✅ [Chorus] - 通常のコーラス
✅ [Verse] - 通常のバース
✅ [Bridge] - ブリッジ
✅ [Intro] / [Outro] - 導入・終了

${finalRapMode === ('full' as typeof finalRapMode) ? `
## 🔥 全面ラップ楽曲専用タグ構成（必須遵守）
**使用可能タグ（ラップ専用）:**
- [Intro] - 導入部分
- [Rap Verse] - メインラップセクション（[Verse]は使用禁止）
- [Rap Hook] - ラップ用コーラス（[Chorus]は使用禁止）
- [Rap Bridge] - ラップブリッジ（[Pre-Chorus]は使用禁止）
- [Outro] - 終了部分

**絶対禁止タグ（全面ラップ時）:**
❌ [Verse] - 歌メロディー用なので使用禁止
❌ [Chorus] - 歌メロディー用なので使用禁止
❌ [Pre-Chorus] - 歌メロディー用なので使用禁止
` : (finalRapMode === 'partial' || analyzedStructure?.hasRap) ? `
## 🎤 一部ラップ楽曲用タグ構成
**通常セクション用:**
- [Intro] - 導入部分
- [Verse] - 歌メロディーセクション
- [Pre-Chorus] - プリコーラス（任意）
- [Chorus] - メインコーラス
- [Bridge] - ブリッジ（任意）
- [Outro] - 終了部分

**ラップセクション用（必須1箇所以上）:**
- [Rap Verse] - ラップセクション

**重要**: [Rap Verse]は[Verse]とは別物です。両方を適切に使い分けてください。
` : `
## 🎵 通常楽曲用タグ構成
**使用可能タグ:**
- [Intro] - 導入部分
- [Verse] - バースセクション
- [Pre-Chorus] - プリコーラス（任意）
- [Chorus] - メインコーラス
- [Bridge] - ブリッジ（任意）
- [Outro] - 終了部分
`}}

## 出力形式
必ず以下の形式で回答してください：

**タイトル候補:**
1. タイトル1
2. タイトル2
3. タイトル3

**歌詞（Sunoタグ付き）:**
⚠️ **タグ使用時の絶対ルール:**
- 構造タグ（セクション）は必ず英語のみ
- 括弧内説明は絶対に使用しない
- 上記の正しいタグ形式のみ使用

[Intro]
[楽器演奏部分の指示がある場合は英語で]

${finalRapMode === ('full' as typeof finalRapMode) ? `[Rap Verse]
ラップ歌詞内容...

[Rap Hook]
ラップフック歌詞...

[Rap Verse]
ラップ歌詞内容...

[Rap Hook]
ラップフック歌詞...
` : (finalRapMode === 'partial' || analyzedStructure?.hasRap) ? `[Verse]
歌詞内容...

[Chorus]
歌詞内容...

[Rap Verse]
ラップセクション歌詞（韻踏み必須）...

[Chorus]
歌詞内容...
` : `[Verse]
歌詞内容...

[Pre-Chorus]
歌詞内容...

[Chorus]
歌詞内容...

[続きのセクション...]
`}}
[Outro]
[Fade out]
`}

## J-POPヒット楽曲タイトル生成ガイドライン
タイトルは「聞く前の第一印象」かつ「聞いた後に記憶を固定するフック」として以下を参考に：

### 🎯 効果的タイトルの要素（自然に活用）
1. **長さとリズム**: 2-4語以内を目安に、口にしやすい響き
2. **イメージ喚起**: 色・季節・場所などの視覚的要素で映像化
3. **感情トリガー**: 「愛」「涙」「夢」「希望」等の感情直球ワード
4. **楽曲連動**: サビや印象的歌詞フレーズからの自然な抽出
5. **音の美しさ**: オノマトペや韻、日英ミックスの新鮮さ
6. **適度な抽象性**: リスナーが想像を膨らませられる余白

**重要**: 上記は参考であり、楽曲の本質とテーマ「${theme}」を最優先してください

${finalRapMode === 'full' ? `
## 🔥 全面ラップ楽曲重要出力要件 🔥
※ **必ずタイトル候補を3つ**最初に出力（ヒップホップらしいタイトル）
※ **「**歌詞（全面ラップSunoタグ付き）:**」以降は純粋なラップ歌詞とタグのみ**
※ **絶対禁止**: [Verse], [Pre-Chorus], [Chorus]タグの使用
※ **必須タグ**: [Rap Verse], [Rap Hook/Chorus]のみ使用
※ **絵文字や装飾記号は歌詞部分で一切使用禁止**
※ **韻踏み・フロー・パンチラインを必須で含める**
※ **各[Rap Verse]は8-16行、[Rap Hook/Chorus]は4-8行**
※ **メロディックな歌詞は一切書かず、全てラップフローで作詞**
※ **ビートに合わせたリズミカルな言葉選びを重視**
` : `
## 重要な出力要件
※ **必ずタイトル候補を3つ**最初に出力してください：印象的で創造的な3-8文字のタイトル
※ **タイトルの質**: 単純な1-2文字は避け、具体的イメージが浮かぶ独創的なタイトルに
※ **雰囲気・感情の完全反映**: 語彙選択、文体、韻律すべてに雰囲気・感情を反映
※ **音楽スタイルの完全反映**: BPM、ジャンル、楽器構成を歌詞のリズムと語感に反映
※ **楽曲長さの完全反映**: 指定された長さに応じた適切な歌詞量を厳守
※ **楽曲構成は必ず変化させてください**：単調なパターンは避け、異なる構成を使用
※ **「**歌詞（Sunoタグ付き）:**」セクション以降は純粋な歌詞とタグのみ**を出力してください
※ **絵文字や装飾記号（🔥、📝、🎵等）は歌詞部分で一切使用禁止**
※ Sunoタグは効果的に配置し、楽曲の流れを明確に示してください
※ 日本語の美しい表現と現代的な感覚を両立させてください
※ リスナーが口ずさみたくなるようなキャッチーなフレーズを含めてください
${finalRapMode === 'partial' || analyzedStructure?.hasRap ? '※ **[Rap Verse]セクションでは、タグ以外は純粋な歌詞のみ**を記述してください' : ''}
`}
`

    // 🎯 Phase 0: A/Bテスト機能実装
    // 安全な改善のためのフラグ制御システム
    const ENABLE_IMPROVED_TRANSLATION = process.env.ENABLE_IMPROVED_TRANSLATION === 'true' || false
    const ENABLE_DYNAMIC_STRUCTURE = process.env.ENABLE_DYNAMIC_STRUCTURE === 'true' || false
    
    console.log('🔧 A/Bテストフラグ状態:', {
      improvedTranslation: ENABLE_IMPROVED_TRANSLATION,
      dynamicStructure: ENABLE_DYNAMIC_STRUCTURE
    })

    // 🎯 英語スタイル指示生成プロンプト（Phase 2: 段階的改善中）
    // Step 1完了: 翻訳関数をファイル上部に移動済み
    
    // 🎯 Phase 1-A: 改善版翻訳関数
    function improvedTranslateToEnglish(text: string): string {
      if (!text) return text
      
      // まず複合句の直接翻訳を試行
      const directTranslation = translateToEnglish(text)
      if (directTranslation !== text) {
        return directTranslation
      }
      
      // カンマ区切りの複合句を処理
      if (text.includes('、') || text.includes(',')) {
        const parts = text.split(/[、,]/).map(part => part.trim())
        const translatedParts = parts.map(part => translateToEnglish(part))
        
        // 全て翻訳できた場合のみ結合
        if (translatedParts.every((part, index) => part !== parts[index] || /^[a-zA-Z\s-]+$/.test(part))) {
          return translatedParts.join(', ')
        }
      }
      
      // フォールバック: 元のテキストを返す
      return text
    }

    // 英語変数の準備（SUNO指示用）
    const englishTheme = ENABLE_IMPROVED_TRANSLATION ? 
      improvedTranslateToEnglish(theme) : translateToEnglish(theme)
    const englishMood = ENABLE_IMPROVED_TRANSLATION ? 
      improvedTranslateToEnglish(mood) : translateToEnglish(mood)  
    const englishLength = ENABLE_IMPROVED_TRANSLATION ? 
      improvedTranslateToEnglish(finalSongLength) : translateToEnglish(finalSongLength)
    
    // ボーカル指示の高度な英語化処理
    function advancedTranslateToEnglish(text: string): string {
      if (!text) return 'expressive vocals'
      
      // 段階的翻訳処理
      let result = text
      
      // 1. 複合語パターンの翻訳
      const complexPatterns: Record<string, string> = {
        '男女混合グループ voice': 'mixed gender group vocals',
        '男女混合グループ': 'mixed gender group vocals',
        '男女混合 voice': 'mixed male female vocals',
        '男女混合': 'mixed male female vocals',
        '女性（ソロ）': 'female solo vocals',
        '男性（ソロ）': 'male solo vocals',
        '女性ソロ': 'female solo vocals',
        '男性ソロ': 'male solo vocals',
        'グループ voice': 'group vocals',
        'デュエット voice': 'duet vocals',
        'デュエット': 'duet vocals'
      }
      
      // 2. 複合語パターンマッチング
      for (const [pattern, translation] of Object.entries(complexPatterns)) {
        if (result.includes(pattern)) {
          result = result.replace(pattern, translation)
        }
      }
      
      // 3. 残りの日本語を個別翻訳
      result = translateToEnglish(result)
      
      // 4. 最終的な英語検証と調整
      if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(result)) {
        // まだ日本語が残っている場合の緊急対応
        result = result
          .replace(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, 'vocals')
          .replace(/\s+/g, ' ')
          .trim()
      }
      
      return result || 'expressive vocals'
    }
    
    const englishVocalDescription = advancedTranslateToEnglish(vocalSettings.vocalDescription)
    
    // 巨大プロンプト復旧：重要な連携システムを保持
    const stylePrompt = `Create a concise Suno AI style instruction using this exact format:

${finalRapMode === 'full' ? 
`**Full Rap Mode Format:**
"Style: Hip-hop rap-only track. Purpose: freestyle rap performance, about ${englishLength}, Japanese lyrics. Vocals: continuous rap throughout, no melodic singing, ${englishVocalDescription || 'rhythmic punchy flow'}. Intro: begin with hype ad-libs "Yo!", "Yeah!", "Let's go!" before first verse. Tempo: medium-fast, head-nod groove. Instruments: ${actualInstruments}. Structure: intro → rap verse → rap hook → rap verse → rap hook → outro. Mood: ${englishMood}. Forbidden: sung chorus, autotuned melodies, pop-style singing, melodic sections."` :
finalRapMode === 'partial' ?
`**Partial Rap Mode Format:**
"Purpose: ${englishTheme} track with rap sections, about ${englishLength}, Japanese lyrics. Mood: ${englishMood}. Tempo: ${analyzedDetails?.tempo || 'medium-fast'}. Rhythm: ${analyzedDetails?.rhythm || 'steady beat with rap sections'}. Instruments: ${actualInstruments}. Vocals: ${englishVocalDescription || 'expressive vocals'} with rap verses. Structure: intro → verse → chorus → rap verse → chorus → outro. Rap Style: Japanese rap with rhymes and flow. Forbidden: ${analyzedDetails?.forbidden || 'No EDM drops'}."` :
`**Standard Format:**  
"Purpose: ${englishTheme} themed track, about ${englishLength}, Japanese lyrics. Mood: ${englishMood}. Tempo: ${analyzedDetails?.tempo || 'medium'}. Rhythm: ${analyzedDetails?.rhythm || 'steady beat'}. Instruments: ${actualInstruments}. Vocals: ${englishVocalDescription || 'expressive vocals'}. Forbidden: ${analyzedDetails?.forbidden || 'No EDM drops'}."`}

**Requirements:**
- Use exact format above
- Keep technical and specific
- No poetic language
- Include all key elements
- ${vocalSettings.isNewSystem ? `Use SUNO-optimized vocals: "${vocalSettings.vocalDescription}"` : 'Use standard vocal description'}
- Instruments: "${actualInstruments}" (use exactly as provided)
- Song Length: "${englishLength}" ${vocalConfiguration?.optimizationSettings?.songLength ? '(SUNO optimized)' : '(standard)'}
- Rap Mode: ${finalRapMode}

**Additional Context:**
- Rap Mode: ${finalRapMode}
- Vocal System: ${vocalSettings.isNewSystem ? 'SUNO-optimized' : 'Traditional'}
- Selected Elements: ${vocalSettings.selectedElements?.join(', ') || 'none'}
- Music Style: ${cleanMusicStyle}
- Analyzed Instruments: ${actualInstruments}

Output only the formatted English style instruction as requested above.

${finalRapMode === 'full' ? `
## 🔥 全面ラップ楽曲用 SUNO最適化指示（ChatGPT実証済み）

### 全面ラップ専用テンプレート適用
以下のテンプレートを参考に、SUNOの「歌モード引っ張られ」を回避した完全ラップ指示を生成：

**必須要素:**
- **Style**: "Hip-hop rap-only track" を冒頭に明記
- **Purpose**: "freestyle-style rap performance" でラップ性を強調  
- **Intro**: 必ず掛け声指示を含める - 楽曲の雰囲気に応じて以下から選択：
  * エネルギッシュ系: "Yo!", "Yeah!", "Let's go!", "Uh!", "Check it!"
  * アグレッシブ系: "Bring it!", "Come on!", "What's up!", "Uh-huh!"
  * チル系: "Alright", "Here we go", "Listen up", "Yo, check this"
- **Vocals**: "continuous rap throughout, no melodic singing" で歌禁止徹底
- **Rap Style**: "rhythmic, punchy, conversational flow, clear end rhymes"
- **Forbidden**: "sung chorus, autotuned melodies, pop-style singing" を必須記載

### 全面ラップ最適化ポイント:
- SUNOは歌に寄りやすいため「rap-only」「no singing」を複数回強調
- テンポは90-110BPM程度の中速〜速めが自然
- 楽器はシンプル（ドラム＋ベース中心）、軽くギターやシンセ追加
- 雰囲気: urban/energetic/confident/aggressive/chill等から選択
` : `
## Suno AI最適化指示作成方針

### 1. 核10項目による一筆書き設計図作成`}
- **Purpose指定**: "BGM for meeting", "MV style track", "Opening theme"
- **Length明記**: "about 75 seconds", "30-35 seconds"  
- **Language明記**: "Japanese lyrics", "instrumental only"
- **禁止要素必須**: "No rap", "No EDM drops", "No comedic tones"
- **楽器構成**: "${actualInstruments}" (楽曲分析結果をそのまま使用、勝手に楽器を追加・変更しない)
- **テンポ帯表現**: "medium-fast", "relaxed", "driving beat"

### 2. 音の質感・雰囲気の英語表現
- **ダーク**: dark, ominous, haunting, brooding
- **エネルギッシュ**: energetic, explosive, dynamic, driving
- **切ない**: melancholic, wistful, bittersweet, poignant
- **透明感**: clear, crisp, ethereal, pristine

### 3. 楽器・音響の表現技法
- **ギター**: distorted, fingerpicked, heavy riffs, sharp cutting
- **ドラム**: punchy, driving, sharp snares, powerful kicks
- **ボーカル**: soaring, passionate, restrained-to-explosive, layered harmonies

### 3.1. ボーカル表現技法（${vocalSettings.isNewSystem ? 'SUNO最適化' : '従来システム'}）
${vocalSettings.isNewSystem ? `
**🎤 SUNO最適化ボーカル指示の英語変換:**
${(vocalSettings.selectedElements || []).map(elementLabel => {
  if (elementLabel.includes('Raw') || elementLabel.includes('Rough')) return '- **Raw/Rough**: raw vocals, rough texture, unpolished edge, gritty delivery'
  if (elementLabel.includes('Shouting')) return '- **Shouting**: shouting style, powerful projection, intense vocal delivery'
  if (elementLabel.includes('Energetic')) return '- **Energetic**: energetic performance, dynamic vocals, high-energy delivery'
  if (elementLabel.includes('Smooth')) return '- **Smooth**: smooth vocals, flowing delivery, polished technique'
  if (elementLabel.includes('Whispered')) return '- **Whispered**: whispered vocals, intimate delivery, soft approach'
  if (elementLabel.includes('Emotional')) return '- **Emotional**: deeply emotional, heartfelt delivery, expressive range'
  if (elementLabel.includes('Confident')) return '- **Confident**: confident vocals, assertive delivery, strong presence'
  if (elementLabel.includes('Melancholic')) return '- **Melancholic**: melancholic tone, wistful delivery, bittersweet emotion'
  if (elementLabel.includes('Aggressive')) return '- **Aggressive**: aggressive vocals, fierce delivery, intense energy'
  if (elementLabel.includes('Clear')) return '- **Clear**: clear pronunciation, crisp articulation, precise delivery'
  if (elementLabel.includes('Slurred')) return '- **Slurred**: slightly slurred, relaxed articulation, casual delivery'
  if (elementLabel.includes('Breathy')) return '- **Breathy**: breathy vocals, airy delivery, intimate texture'
  return `- **${elementLabel}**: vocal characteristic to be applied`
}).join('\\n')}

**重要**: 上記の具体的な特徴を "Vocals" セクションで使用し、一般的な "expressive, emotional delivery" は避ける。` : `
${vocal.gender.includes('グループ') || vocal.gender.includes('デュエット') || vocal.gender.includes('コーラス') ? `
- **ハーモニー**: rich harmonies, layered vocals, call-and-response, vocal interplay
- **コーラスワーク**: backing vocals, group chorus, multi-part harmony
- **対話**: conversational vocals, duet exchanges, interwoven melodies
- **音響効果**: vocal layering, harmonic richness, ensemble depth
` : `
- **ソロ表現**: expressive lead vocals, emotional delivery, vocal focus
- **表現力**: dynamic range, vocal technique mastery, emotional connection
`}`}

### 4. 楽曲展開の動的表現
- 「静から動へ」→「building from calm to explosive」
- 「緊張と解放」→「tension and release dynamics」
- 「疾走感」→「driving momentum with urgent energy」

## Suno AI最適化要件（ChatGPT実証済みベストプラクティス）

### 必須「核10項目」チェックリスト:
1. **Purpose（用途）**: BGM/CM/OP/MVなど明記
2. **Length（長さ）**: 30秒/60秒/2分など具体的に
3. **Language（言語）**: 日本語/英語/インスト
4. **Vocals（ボーカル）**: 有無・性別・表情（落ち着き→爆発等）
5. **Tempo（テンポ帯）**: ゆったり/中速/速い（数値避ける）
6. **Rhythm（リズム質感）**: 跳ねる/直進/シャッフル
7. **Instruments（楽器パレット）**: 必須楽器を3-4個明記
8. **Structure（構成）**: A→B→サビ/サビ先行等
9. **Mood（感情3語まで）**: 緊張感・昂揚・ほろ苦さ等
10. **Forbidden（禁止要素）**: ラップ禁止/EDMドロップ禁止等

### 出力ルール:
- **60-90語**の一筆書き設計図
- **比喩は1個まで**（音像が浮かぶもの）
- **禁止要素を必ず明記**（Sunoの勝手な追加を防ぐ）
- 英語指示文のみ出力

## ChatGPT実証済み成功テンプレート：

**赤いワイン系（Red Wine Style）:**
"Purpose: MV style track, about 75 seconds, Japanese lyrics. Mood: bittersweet warmth, quiet build, nocturnal reflection. Tempo: medium, gentle 8-beat. Instruments: delicate banjo phrases + nostalgic enka-style melody + guitar/bass/drums. Structure: intro → verse → pre-chorus → chorus → closing. Vocals: soft male voice, half-sad whisper. Forbidden: comedic tones, heavy EDM, fast bluegrass banjo."

**ダークJ-Rock系（SPECIALZ Style）:**
"Purpose: Opening theme style, 60-70 seconds, Japanese lyrics. Mood: tension, chaos, release. Tempo: medium-fast, driving beat. Instruments: heavy distorted guitar riffs + rumbling bass + sharp snare + dark electric piano. Vocals: male, calm in verse, explosive in chorus. Forbidden: EDM drops, bright brass, comic sound effects, synth pad."

**🔥 全面ラップ系（Hip-hop Rap-only Style）:**
"Purpose: Hip-hop rap-only track, freestyle-style rap performance, about 90 seconds, Japanese lyrics. Intro: begin with short hype ad-libs such as "Yo!", "Yeah!", "Let's go!" before the first verse starts. Mood: urban, energetic, confident. Tempo: medium-fast (90–110 BPM), head-nod groove. Instruments: strong drum beat + deep bassline + optional light guitar or electric piano for texture. Structure: intro → rap verse → rap hook → rap verse → rap hook → outro. Vocals: continuous rap throughout, no melodic singing, rhythmic punchy conversational flow with clear end rhymes. Forbidden: sung chorus, autotuned melodies, EDM drops, pop-style singing, melodic sections, synth pad."

${finalRapMode === 'full' ? `
## 🔥 全面ラップ専用厳守フォーマット：

**全面ラップ楽曲用構造で必ず出力:**
"Style: Hip-hop rap-only track inspired by [参考スタイル]. 
Purpose: [freestyle rap performance/uplifting anthem], about [X seconds]. 
Vocals: [人数] [性別] voice(s), [call-and-response/solo] rap, no singing. 
Intro: begin with short hype ad-libs such as "Yo!", "Yeah!", "Let's go!", "Uh!", "Check it!" before the first verse starts. 
Rap style: [conversational/aggressive/smooth], [punchy lines/flowing], [simple/complex] rhymes. 
Tempo: medium-fast with [groovy/driving] head-nod beat. 
Instruments: [live drums/drum beat] + [bass/bassline] + [light guitar/electric piano]. 
Structure: [intro] → [rap verse] → [rap hook] → [rap verse] → [rap hook] → [outro]. 
Mood: [urban/positive/energetic], [nostalgic/confident/aggressive]. 
Forbidden: melodic chorus, autotuned pop vocals, EDM drops, sung sections."
` : `
## 厳守必須フォーマット（ChatGPT実証済み）：

**必ず以下の構造で出力:**
"Purpose: [MV style track/BGM/Opening theme], about [X seconds], [Japanese lyrics/instrumental]. 
Mood: [感情語3つまで]. 
Tempo: [medium/slow/fast], [具体的リズム記述]. 
Instruments: [楽器名] + [楽器名] + [楽器名]. [追加楽器指定]. 
Structure: [intro] → [verse] → [chorus] → [closing]. 
Vocals: ${vocalSettings.isNewSystem ? `[SUNO最適化テキストをそのまま使用: "${vocalSettings.vocalDescription}"]` : '[性別] voice, [表情], [技法]'}. 
Forbidden: [禁止要素], [禁止要素], [禁止要素]."

${vocalSettings.isNewSystem ? `
**🎯 SUNO最適化重要指示:**
- Vocalsセクションでは "${vocalSettings.vocalDescription}" をそのまま使用すること
- "expressive, emotional delivery" のような一般的表現は使用禁止
- 選択された具体的要素（${vocalSettings.selectedElements?.join('、') || 'なし'}）を反映すること` : ''}
`}

**絶対に使用禁止の表現:**
- "musical journey", "soundscape", "emotional depth"
- "evoke", "infuse", "embrace", "heighten" 
- 長い形容詞句や詩的描写

## 🚫 絶対禁止表現リスト：
- "musical journey", "soundscape", "evoke", "infuse", "embrace"
- "emotional depth", "introspective", "poignant essence"  
- "solitary evening walk", "echoes with memories"
- キー名（F minor等）、BPM数値、音域指定

${finalRapMode === 'full' ? `
## ⚡ 全面ラップ専用出力命令（必須遵守）：
必ず「Style: Hip-hop rap-only track」で始まり、「Forbidden: melodic chorus, autotuned pop vocals, EDM drops, sung sections.」で終わる構造化された指示のみ出力せよ。
詩的表現・比喩・長い修飾句は一切使用するな。
ラップスタイル・楽器名・禁止要素を具体的に明記せよ。
**CRITICAL**: 「singing」「melodic」「chorus」を禁止要素に必ず含めよ。
` : `
## ⚡ 出力命令（必須遵守）：
必ず「Purpose: 」で始まり、「Forbidden: 」で終わる構造化された指示のみ出力せよ。
詩的表現・比喩・長い修飾句は一切使用するな。

## 🎵 楽器構成の厳守命令：
**CRITICAL**: Instrumentsセクションには「${actualInstruments}」をそのまま使用すること。
- 楽器を勝手に追加してはならない（electric piano, synth pad等を追加禁止）
- 楽器を勝手に変更してはならない（guitar → electric guitarへの変更等禁止）  
- 分析された楽器構成「${actualInstruments}」を正確に反映すること

## 🎤 ボーカル指示の厳守命令：
${vocalSettings.isNewSystem ? `
**CRITICAL**: Vocalsセクションには「${vocalSettings.vocalDescription}」をそのまま使用すること。
- 一般的な "expressive, emotional delivery" は使用禁止
- SUNO最適化された具体的な要素を必ず反映
- 選択要素: ${vocalSettings.selectedElements?.join('、') || 'なし'} を英語で表現` : `
**STANDARD**: 従来のボーカル表現技法を使用
- 性別・年齢・国籍に基づく表現
- 歌唱技法: ${vocal.techniques.join(', ')}`}

楽器名・ボーカル指示・禁止要素を具体的に明記せよ。
`}
`

    // 巨大プロンプト復旧完了 - 重要な連携システムをすべて保持

    // 歌詞生成
    const lyricsCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは日本の音楽業界で活躍する経験豊富な作詞家です。雰囲気・感情と音楽スタイルを歌詞に深く反映させ、楽曲の長さに応じた適切な歌詞量を創作できます。語彙選択、文体、リズム感すべてを楽曲設定と完全に一致させることができます。J-POPの作詞戦略、音韻学、リスナー心理を深く理解し、Suno AIで最高の結果を得られる歌詞を作成します。楽曲構成は単調にならないよう創造的で多様なパターンを使用し、指定された雰囲気・スタイル・長さを完璧に反映した歌詞を作成してください。**重要：指定された内容のみを歌詞に反映し、過去のリクエストや他の楽曲の要素は一切含めません。** 必ず「**タイトル候補:**」セクションから始めて、魅力的なタイトルを3つ提案し、その後に歌詞を続けてください。"
        },
        {
          role: "user",
          content: lyricsPrompt
        }
      ],
      temperature: 0.9,
      max_tokens: 2000
    })

    // 英語スタイル指示生成
    const styleCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a Suno AI optimization specialist who creates precise, structured style instructions following proven ChatGPT best practices. You MUST use the exact 'Core 10 Items' format with concrete specifications, avoiding all poetic language. Your instructions are technical blueprints, not artistic descriptions. Focus on what Suno AI needs to know: Purpose, Length, Language, specific instrument names, structure, and forbidden elements."
        },
        {
          role: "user",
          content: stylePrompt  // 巨大プロンプト復旧：重要な連携システムを保持
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const lyricsResponse = lyricsCompletion.choices[0]?.message?.content || ''
    const styleResponse = styleCompletion.choices[0]?.message?.content || ''

    // 🎯 Phase 0-3: 英語スタイル指示の品質チェック機能
    function checkEnglishStyleQuality(styleText: string) {
      const issues = []
      
      // 日本語文字検出
      const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/
      const hasJapanese = japaneseRegex.test(styleText)
      
      if (hasJapanese) {
        const japaneseMatches = styleText.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g)
        issues.push(`日本語検出: ${japaneseMatches?.join(', ')}`)
      }
      
      // 基本必須要素チェック
      const requiredElements = ['Purpose', 'Mood', 'Tempo', 'Instruments', 'Vocals']
      const missingElements = requiredElements.filter(element => 
        !styleText.toLowerCase().includes(element.toLowerCase())
      )
      
      if (missingElements.length > 0) {
        issues.push(`必須要素不足: ${missingElements.join(', ')}`)
      }
      
      return {
        isValid: issues.length === 0,
        issues,
        hasJapanese,
        confidence: issues.length === 0 ? 'high' : issues.length <= 2 ? 'medium' : 'low'
      }
    }

    const styleQuality = checkEnglishStyleQuality(styleResponse)
    
    console.log('🎯 英語スタイル指示品質チェック結果:', {
      isValid: styleQuality.isValid,
      confidence: styleQuality.confidence,
      issues: styleQuality.issues,
      hasJapanese: styleQuality.hasJapanese
    })
    
    // エラー検出時のログ
    if (!styleQuality.isValid) {
      console.error('⚠️ 英語スタイル指示に問題を検出:', styleQuality.issues)
    }

    // タイトル候補を確実に生成するためのフォールバック処理
    let titles: string[] = []
    
    // まず、AI応答からタイトルを抽出を試みる
    const allLines = lyricsResponse.split('\n')
    let inTitleSection = false
    
    for (const line of allLines) {
      if (line.includes('タイトル')) {
        inTitleSection = true
        continue
      }
      if (inTitleSection) {
        const titleMatch = line.match(/^\d+\.\s*(.+)/) || line.match(/^・\s*(.+)/) || line.match(/^-\s*(.+)/)
        if (titleMatch) {
          let title = titleMatch[1].trim()
          title = title.replace(/^\[(.+?)\]$/, '$1') // [タイトル] → タイトル
          title = title.replace(/^「(.+)」$/, '$1') // 「タイトル」 → タイトル
          if (title && !title.includes('**') && !title.includes('歌詞')) {
            titles.push(title)
          }
        } else if (line.includes('**') || line.includes('歌詞')) {
          break
        }
      }
    }
    
    // タイトルが3つ未満の場合、テーマに基づいて生成
    if (titles.length < 3) {
      const fallbackTitles = generateFallbackTitles(theme, mood, content)
      while (titles.length < 3 && fallbackTitles.length > 0) {
        const fallback = fallbackTitles.shift()
        if (fallback && !titles.includes(fallback)) {
          titles.push(fallback)
        }
      }
    }
    
    // 確実に3つのタイトルを保証
    if (titles.length === 0) {
      titles = ['新しい歌', '心の調べ', '大切な想い']
    } else if (titles.length === 1) {
      titles.push('心の調べ', '大切な想い')
    } else if (titles.length === 2) {
      titles.push('大切な想い')
    }
    
    // 最初の3つだけを使用
    titles = titles.slice(0, 3)
    
    console.log('=== デバッグ情報 ===')
    console.log('入力された歌詞内容:', content)
    console.log('生のAI応答（最初の1000文字）:', lyricsResponse.substring(0, 1000))
    console.log('最終タイトル:', titles)
    console.log('タイトル数:', titles.length)

    // 歌詞部分を抽出（タイトル候補セクションを除去）
    let lyrics = lyricsResponse
    
    // 「**歌詞（Sunoタグ付き）:**」以降の部分を抽出
    const lyricsMatch = lyricsResponse.match(/\*\*歌詞（Sunoタグ付き）:\*\*\s*\n([\s\S]+)$/s)
    if (lyricsMatch) {
      lyrics = lyricsMatch[1].trim()
    } else {
      // フォールバック: タイトル候補セクションを除去
      const lines = lyricsResponse.split('\n')
      const startIndex = lines.findIndex(line => 
        line.includes('[Intro]') || 
        line.includes('[Verse]') || 
        line.includes('[Pre-Chorus]') || 
        line.includes('[Chorus]')
      )
      
      if (startIndex !== -1) {
        lyrics = lines.slice(startIndex).join('\n').trim()
      }
    }
    
    // SUNOタグを抽出（清浄化前に）
    const sunoTagsMatch = lyrics.match(/^\[[\w\s,]+\][\s\n]*/m)
    const extractedSunoTags = sunoTagsMatch ? sunoTagsMatch[0].trim() : ''
    
    // 歌詞内の装飾記号を清浄化
    lyrics = lyrics
      .replace(/🔥\s*\[Rap Verse\]\s*🔥\s*/g, '') // 🔥アイコン行全体を除去
      .replace(/^\*\*タイトル候補:\*\*[\s\S]*?(?=\[)/m, '') // タイトル候補セクションを除去
      .replace(/^\*\*歌詞（Sunoタグ付き）:\*\*\s*\n?/m, '') // ヘッダーを除去
      .trim()

    return NextResponse.json({
      titles,
      lyrics,
      styleInstruction: styleResponse.replace(/^["']|["']$/g, '').trim(),
      sunoTags: extractedSunoTags || 'jpop,japanese pop,gentle', // デフォルトタグを設定
      mode,
      settings: {
        mood,
        musicStyle: cleanMusicStyle,
        theme,
        vocal,
        vocalConfiguration: vocalSettings.isNewSystem ? vocalConfiguration : null
      },
      // 🎯 Phase 0-3: 品質チェック結果を追加
      qualityCheck: {
        styleQuality: styleQuality,
        abTestFlags: {
          improvedTranslation: ENABLE_IMPROVED_TRANSLATION,
          dynamicStructure: ENABLE_DYNAMIC_STRUCTURE
        }
      }
    })

  } catch (error) {
    console.error('歌詞生成エラー:', error)
    return NextResponse.json(
      { error: '歌詞生成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 🎯 Phase 1-3: 新アーキテクチャ専用処理関数（ダミー実装を実際の生成に置き換え）
async function handleNewArchitectureGeneration(
  decomposedElements: DecomposedElements,
  userSettings: UserSettings,
  request: NextRequest
): Promise<NextResponse> {
  try {
    console.log('🚀 新アーキテクチャ処理開始')
    console.log('- 分解要素:', decomposedElements)
    console.log('- ユーザー設定:', userSettings)
    
    // 🔄 既存の強力な生成システムを新アーキテクチャで活用
    // ステップ1: DecomposedElementsとUserSettingsを既存システム形式に変換
    
    const legacyRequestData = {
      // 新アーキテクチャフラグ
      useNewArchitecture: true,
      decomposedElements,
      userSettings,
      
      // 既存システム互換パラメータに変換
      mode: 'custom',
      theme: userSettings.theme,
      content: userSettings.lyricsContent,
      songLength: userSettings.songLength,
      
      // 音楽スタイル: 分解された要素から構築
      musicStyle: `${decomposedElements.genre}, ${decomposedElements.instruments}, ${decomposedElements.mood}`,
      mood: decomposedElements.mood,
      
      // ボーカル設定: 新アーキテクチャのボーカル属性を変換
      vocal: {
        gender: decomposedElements.vocal.attribute || '女性（ソロ）',
        age: '20代',
        nationality: '日本',
        techniques: decomposedElements.vocal.sunoElements || []
      },
      
      // SUNO最適化設定: 新アーキテクチャの要素を活用
      vocalConfiguration: {
        useNewSystem: true,
        generatedText: `${decomposedElements.vocal.attribute}, ${decomposedElements.vocal.sunoElements?.join(', ') || ''}`,
        selectedElements: decomposedElements.vocal.sunoElements?.map(id => ({ id, label: id })) || [],
        optimizationSettings: {
          songLength: userSettings.songLength,
          vocalElements: decomposedElements.vocal.sunoElements?.map(id => ({ id, label: id })) || []
        }
      },
      
      // 言語設定
      languageSettings: {
        englishMixLevel: userSettings.language.englishMixLevel || 'none',
        languagePreference: userSettings.language.primary || 'japanese'
      },
      
      // ラップモード
      rapMode: userSettings.rapMode || 'none',
      
      // 内容反映度設定
      contentReflection: userSettings.contentReflection || 'literal',
      
      // 楽曲分析詳細: 分解要素から構築
      analyzedDetails: {
        tempo: decomposedElements.tempo,
        rhythm: decomposedElements.rhythm,
        instruments: decomposedElements.instruments,
        forbidden: decomposedElements.forbidden
      },
      
      // 楽曲構造情報
      analyzedStructure: {
        hasRap: userSettings.rapMode !== 'none',
        vocalStyle: decomposedElements.vocal.attribute || 'solo',
        genre: decomposedElements.genre,
        isDragonAshStyle: false
      }
    }

    console.log('🔄 既存生成システムに変換されたリクエスト:', {
      theme: legacyRequestData.theme,
      musicStyle: legacyRequestData.musicStyle,
      songLength: legacyRequestData.songLength,
      vocalAttribute: decomposedElements.vocal.attribute
    })

    // ステップ2: 既存の強力な歌詞生成プロンプトを使用
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    })

    // 既存システムの歌詞生成ロジックを再利用（上記のlyricsPrompt構築と同じ）
    const lyricsPrompt = `
あなたは日本のヒット曲を数多く手がけたプロの作詞家です。Suno AIで使用するための歌詞とタイトルを作成してください。

## 新アーキテクチャ楽曲設定（19ジャンル分類・SUNO最適化対応）
- ジャンル: ${decomposedElements.genre}
- 楽器構成: ${decomposedElements.instruments}
- 楽曲構造: ${decomposedElements.structure}
- リズム: ${decomposedElements.rhythm}
- テンポ: ${decomposedElements.tempo}
- ムード: ${decomposedElements.mood}
- 楽曲の長さ: ${userSettings.songLength}

## ボーカル設定（新アーキテクチャ）
- ボーカル属性: ${decomposedElements.vocal.attribute}
- SUNO最適化要素: ${decomposedElements.vocal.sunoElements?.join('、') || 'なし'}

## 言語設定
- 基本言語: ${userSettings.language.primary}
- 英語混在レベル: ${userSettings.language.englishMixLevel || 'なし'}

## 内容反映度設定
- 反映方法: ${userSettings.contentReflection || 'literal'}
${userSettings.contentReflection === 'literal' ? 
  '  → 専門用語・固有名詞をそのまま歌詞に使用' :
  userSettings.contentReflection === 'metaphorical' ?
  '  → 内容を詩的・象徴的に表現' :
  '  → 重要部分は忠実、他は比喩的に'}

## ラップ設定
- ラップモード: ${userSettings.rapMode}

## 歌詞に必ず盛り込む具体的な内容
${userSettings.lyricsContent}

## 楽曲テーマ
${userSettings.theme}

## 禁止要素
${decomposedElements.forbidden}

## 作詞要件
以下の要素を考慮してJ-POPヒット曲として成功する歌詞を作成してください：

1. **🚨 絶対遵守事項（SUNO AI対応）**
   - SUNOタグ（[...]）は100%英語のみ使用
   - 楽器指示は英語: [Acoustic guitar], [Piano solo], [Drums]等
   - 歌詞本文のみ日本語、演奏指示は全て英語
   - 例: [Guitar intro] ✅ / [ギター演奏] ❌

2. **新アーキテクチャ対応作詞戦略**
   - 19ジャンル分類システムに基づく適切な表現選択
   - 分析された楽器構成・リズム・テンポに完全同調した歌詞
   - SUNO最適化要素を活かした表現技法
   - 指定された楽曲構造に準拠した構成

2. **楽曲長さに応じた歌詞量調整（重要）**
${userSettings.songLength === '2-3分' ? 
  '**短い楽曲**：各セクションは短く簡潔に。Verse（4-6行）、Chorus（4-8行）、全体で30-40行程度。' :
  userSettings.songLength === '3-4分' ? 
  '**標準的な楽曲**：標準的な歌詞量。Verse（6-8行）、Chorus（6-10行）、全体で50-70行程度。' :
  userSettings.songLength === '4-5分' ? 
  '**長い楽曲**：充実した歌詞内容。Verse（8-12行）、Chorus（8-12行）、Bridge/Cメロを含め全体で70-90行程度。' :
  '**非常に長い楽曲**：多層的な歌詞構成。複数のストーリー展開、繰り返しセクション、全体で90行以上。'}

## 出力形式
必ず以下の形式で回答してください：

**タイトル候補:**
1. タイトル1
2. タイトル2  
3. タイトル3

**歌詞（Sunoタグ付き）:**
⚠️ **重要な注意事項:**
- SUNOタグ（[...]内）は絶対に日本語を使用しないでください
- 楽器指示は英語のみ使用: [Acoustic guitar intro], [Piano melody], [Drums and bass]
- 歌詞本文は日本語で、タグのみ英語厳守

## 🚨 この楽曲専用のSUNOタグ構成（生成AI専用指示）

**ジャンルタグ（歌詞冒頭に配置）:**
${generateGenreTags(decomposedElements, userSettings)}

**楽曲構造（必須遵守）:**
${generateCorrectStructure(decomposedElements, userSettings)}

**🚨 CRITICAL: SUNOタグ厳格ルール**
- 括弧内説明は絶対に使用禁止: [Verse 1 (Rap)] ❌
- 日本語タグは絶対に使用禁止: [ラップバース] ❌  
- 正しい英語タグのみ使用: [Rap Verse] ✅

**出力時の注意:**
- 上記のジャンルタグを歌詞の最初に配置
- 構造指示に従って正確なセクションタグを使用
- 括弧内説明や日本語タグは絶対に使用しない

[Intro]
（楽器演奏部分がある場合は英語タグのみ使用）

（上記の楽曲構造に基づいた各セクション）
...

[Outro]
[Fade out]
`

    // ステップ3: 歌詞生成実行
    const lyricsCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "あなたは日本の音楽業界で活躍する経験豊富な作詞家で、SUNO AI技術の専門家です。🚨重要：SUNOタグ（[...]内）は絶対に英語のみ使用してください。楽器指示は[Acoustic guitar], [Piano], [Drums]など英語で記述し、歌詞本文のみ日本語を使用します。新アーキテクチャの19ジャンル分類システムとSUNO最適化技術を完全理解し、日本語歌詞と英語楽器タグの完璧な組み合わせで最高品質の楽曲を作成してください。"
        },
        {
          role: "user",
          content: lyricsPrompt
        }
      ],
      temperature: 0.9,
      max_tokens: 2000
    })

    // ステップ4: 英語スタイル指示生成（既存システムのstylePrompt活用）
    // 🚨 日本語→英語変換処理（日本語混入を防止）
    const translateToEnglish = (text: string): string => {
      const translations: { [key: string]: string } = {
        '女性（ソロ）': 'female solo',
        '男性（ソロ）': 'male solo', 
        '女性（デュエット）': 'female duet',
        '男性（デュエット）': 'male duet',
        '混声（デュエット）': 'mixed duet',
        '女性（グループ）': 'female group',
        '男性（グループ）': 'male group',
        '混声（グループ）': 'mixed group',
        'コーラス重視（複数ボーカル）': 'chorus-focused vocals',
        'ソロ＋コーラス': 'solo with chorus',
        'Clear': 'clear',
        'Warm': 'warm',
        'Expressive': 'expressive',
        'Emotional': 'emotional',
        'Gentle': 'gentle',
        'Powerful': 'powerful',
        'Smooth': 'smooth',
        'Rich': 'rich',
        'Bright': 'bright',
        'Deep': 'deep',
        'Soft': 'soft',
        'Strong': 'strong',
        'Natural': 'natural',
        'Dynamic': 'dynamic',
        'Resonant': 'resonant',
        'Crisp': 'crisp'
      }
      
      let result = text
      Object.entries(translations).forEach(([japanese, english]) => {
        result = result.replace(new RegExp(japanese, 'g'), english)
      })
      
      return result
    }

    const stylePrompt = `Create a Suno AI style instruction for this new architecture song:

**New Architecture Analysis Results:**
- Genre: ${decomposedElements.genre}
- Instruments: ${decomposedElements.instruments}  
- Structure: ${decomposedElements.structure}
- Rhythm: ${decomposedElements.rhythm}
- Tempo: ${decomposedElements.tempo}
- Mood: ${decomposedElements.mood}
- Vocal Attribute: ${translateToEnglish(decomposedElements.vocal.attribute)}
- SUNO Elements: ${decomposedElements.vocal.sunoElements?.map(e => translateToEnglish(e)).join(', ') || 'none'}
- Song Length: ${userSettings.songLength}
- Language: ${userSettings.language.primary}
- Rap Mode: ${userSettings.rapMode}
- Forbidden: ${decomposedElements.forbidden}

**Format Requirements:**
Use exact format based on rap mode:
- If Rap Mode is "full": "Style: Hip-hop rap-only track. Purpose: freestyle rap performance, about [length], [language] lyrics. Vocals: continuous rap throughout, no melodic singing. Structure: intro → rap verse → rap hook → rap verse → rap hook → outro. Mood: [mood]. Tempo: [tempo]. Instruments: [instruments]. Forbidden: sung chorus, autotuned melodies, pop-style singing."
- If Rap Mode is "partial": "Purpose: [theme] track with rap sections, about [length], [language] lyrics. Mood: [mood]. Tempo: [tempo]. Rhythm: [rhythm] with rap sections. Instruments: [instruments]. Vocals: [vocal attribute] with rap verses. Structure: intro → verse → chorus → rap verse → chorus → outro. Rap Style: Japanese rap with rhymes and flow. Forbidden: [forbidden]."
- If Rap Mode is "none": "Purpose: [theme] track, about [length], [language] lyrics. Mood: [mood]. Tempo: [tempo]. Rhythm: [rhythm]. Instruments: [instruments]. Vocals: [vocal attribute]. Structure: [structure]. Genre: [genre]. Forbidden: [forbidden]."

Output only the formatted English style instruction for the specified rap mode.`

    const styleCompletion = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "system",
          content: "You are a Suno AI optimization specialist who creates precise style instructions from new architecture analysis results. Use the 19-genre classification system and SUNO optimization elements to create technical, structured instructions."
        },
        {
          role: "user", 
          content: stylePrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    // ステップ5: 応答処理と品質チェック
    const lyricsResponse = lyricsCompletion.choices[0]?.message?.content || ''
    let styleResponse = styleCompletion.choices[0]?.message?.content || ''
    
    // 🚨 緊急：英語スタイル指示から日本語を完全除去
    const removeJapaneseFromStyle = (text: string): string => {
      // 日本語文字の正規表現
      const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g
      
      // 既知の日本語フレーズを英語に置換
      const commonReplacements: { [key: string]: string } = {
        '優しく響くボーカル': 'gentle vocals',
        '感情豊かな': 'emotional',
        '心温まる': 'heartwarming',
        '懐かしい': 'nostalgic',
        '穏やか': 'gentle',
        '力強い': 'powerful',
        '透明感のある': 'clear',
        '暖かい': 'warm',
        'やわらか': 'soft',
        '美しい': 'beautiful',
        '深み': 'depth',
        '響く': 'resonant'
      }
      
      let result = text
      
      // 既知の日本語フレーズを置換
      Object.entries(commonReplacements).forEach(([japanese, english]) => {
        result = result.replace(new RegExp(japanese, 'g'), english)
      })
      
      // 残った日本語文字を検出して警告
      if (japaneseRegex.test(result)) {
        console.warn('🚨 英語スタイル指示に日本語が残っています:', result.match(japaneseRegex))
        // 日本語文字を除去（最終手段）
        result = result.replace(japaneseRegex, '')
      }
      
      return result
    }
    
    // 英語スタイル指示から日本語を除去
    styleResponse = removeJapaneseFromStyle(styleResponse)

    // タイトル抽出（既存システムと同じロジック）
    let titles: string[] = []
    const allLines = lyricsResponse.split('\n')
    let inTitleSection = false
    
    for (const line of allLines) {
      if (line.includes('タイトル')) {
        inTitleSection = true
        continue
      }
      if (inTitleSection) {
        const titleMatch = line.match(/^\d+\.\s*(.+)/) || line.match(/^・\s*(.+)/) || line.match(/^-\s*(.+)/)
        if (titleMatch) {
          let title = titleMatch[1].trim()
          title = title.replace(/^\[(.+?)\]$/, '$1').replace(/^「(.+)」$/, '$1')
          if (title && !title.includes('**') && !title.includes('歌詞')) {
            titles.push(title)
          }
        } else if (line.includes('**') || line.includes('歌詞')) {
          break
        }
      }
    }

    // タイトル不足時のフォールバック
    if (titles.length < 3) {
      const fallbackTitles = generateFallbackTitles(userSettings.theme, decomposedElements.mood, userSettings.lyricsContent)
      while (titles.length < 3 && fallbackTitles.length > 0) {
        const fallback = fallbackTitles.shift()
        if (fallback && !titles.includes(fallback)) {
          titles.push(fallback)
        }
      }
    }

    // 歌詞抽出
    let lyrics = lyricsResponse
    const lyricsMatch = lyricsResponse.match(/\*\*歌詞（Sunoタグ付き）:\*\*\s*\n([\s\S]+)$/s)
    if (lyricsMatch) {
      lyrics = lyricsMatch[1].trim()
    } else {
      const lines = lyricsResponse.split('\n')
      const startIndex = lines.findIndex(line => 
        line.includes('[Intro]') || line.includes('[Verse]') || line.includes('[Pre-Chorus]') || line.includes('[Chorus]')
      )
      if (startIndex !== -1) {
        lyrics = lines.slice(startIndex).join('\n').trim()
      }
    }
    
    // 🚨 SUNOタグ内の日本語を英語に変換
    const fixSunoTags = (text: string): string => {
      // SUNOタグ内の日本語を英語に変換
      const tagReplacements: { [key: string]: string } = {
        '静かにアコースティックギターが旋律を奏でる': 'Acoustic guitar intro',
        'ギター演奏': 'Guitar playing',
        'ピアノソロ': 'Piano solo',
        'ドラム': 'Drums',
        'ベース': 'Bass',
        'アコースティックギター': 'Acoustic guitar',
        'エレキギター': 'Electric guitar',
        '楽器演奏': 'Instrumental',
        'イントロ': 'Intro',
        'アウトロ': 'Outro',
        'フェードアウト': 'Fade out',
        '間奏': 'Interlude'
      }
      
      let result = text
      
      // タグ内の日本語を置換
      result = result.replace(/\[([^\]]*)\]/g, (match, content) => {
        let englishContent = content
        Object.entries(tagReplacements).forEach(([japanese, english]) => {
          englishContent = englishContent.replace(new RegExp(japanese, 'g'), english)
        })
        
        // まだ日本語が残っている場合は削除
        const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g
        if (japaneseRegex.test(englishContent)) {
          console.warn('🚨 SUNOタグに日本語が残っています:', match)
          englishContent = englishContent.replace(japaneseRegex, '').trim()
          // 空になった場合はデフォルトタグ
          if (!englishContent) {
            englishContent = 'Instrumental'
          }
        }
        
        return `[${englishContent}]`
      })
      
      return result
    }
    
    lyrics = fixSunoTags(lyrics)

    // 🚨 最終品質チェック：英語スタイル指示とSUNOタグに日本語が混入していないか確認
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/
    const cleanedStyleInstruction = styleResponse.replace(/^["']|["']$/g, '').trim()
    const cleanedLyrics = lyrics.replace(/^\*\*歌詞（Sunoタグ付き）:\*\*\s*\n?/m, '').trim()
    
    const issues: string[] = []
    
    // 英語スタイル指示の日本語チェック
    if (japaneseRegex.test(cleanedStyleInstruction)) {
      issues.push('英語スタイル指示に日本語が混入しています')
      console.error('🚨 スタイル指示に日本語混入:', cleanedStyleInstruction.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g))
    }
    
    // SUNOタグの日本語チェック  
    const sunoTags = cleanedLyrics.match(/\[[^\]]*\]/g) || []
    const japaneseTags = sunoTags.filter(tag => japaneseRegex.test(tag))
    if (japaneseTags.length > 0) {
      issues.push('SUNOタグに日本語が混入しています')
      console.error('🚨 SUNOタグに日本語混入:', japaneseTags)
    }

    // 最終出力構築
    const finalOutput: FinalOutput = {
      titles: titles.slice(0, 3),
      lyrics: cleanedLyrics,
      styleInstruction: cleanedStyleInstruction,
      editableStyle: true,
      regenerationSupported: true,
      qualityCheck: {
        hasJapanese: issues.length > 0,
        confidence: issues.length === 0 ? 'high' : 'medium', 
        issues
      }
    }

    console.log('✅ 新アーキテクチャ実生成処理完了')
    console.log('- 生成タイトル数:', finalOutput.titles.length)
    console.log('- タイトル:', finalOutput.titles)
    console.log('- 歌詞長:', finalOutput.lyrics.length, '文字')
    console.log('- スタイル指示:', finalOutput.styleInstruction.substring(0, 100) + '...')

    return NextResponse.json({
      titles: finalOutput.titles,
      lyrics: finalOutput.lyrics,
      styleInstruction: finalOutput.styleInstruction,
      editableStyle: finalOutput.editableStyle,
      regenerationSupported: finalOutput.regenerationSupported,
      qualityCheck: finalOutput.qualityCheck,
      debug: {
        architecture: 'new',
        processedElements: decomposedElements,
        processedSettings: userSettings,
        generationMethod: 'real_ai_generation',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('新アーキテクチャ処理エラー:', error)
    return NextResponse.json(
      { error: '新アーキテクチャでの歌詞生成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}