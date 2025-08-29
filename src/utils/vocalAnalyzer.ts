// 楽曲分析に基づく最適なボーカル要素自動選択

import { 
  VocalElement, 
  AnalyzedVocalResult,
  toneOptions,
  deliveryOptions,
  emotionOptions,
  pronunciationOptions,
  generateSunoVocalText,
  allVocalElements 
} from '../data/sunoVocalElements'

interface MusicAnalysisData {
  genre?: string
  mood?: string
  style?: string
  tempo?: string
  rhythm?: string
  instruments?: string
  forbidden?: string
}

export function analyzeOptimalVocalElements(
  musicData: MusicAnalysisData,
  gender: string = 'male'
): AnalyzedVocalResult {
  const selectedElements: VocalElement[] = []
  let reasoning = ''

  // 1. ジャンル・スタイル分析から声の質を決定
  const toneElement = analyzeTone(musicData)
  if (toneElement) selectedElements.push(toneElement)

  // 2. 楽曲の感情・雰囲気から歌唱法を決定
  const deliveryElement = analyzeDelivery(musicData)
  if (deliveryElement) selectedElements.push(deliveryElement)

  // 3. ムード・テンポから感情表現を決定
  const emotionElement = analyzeEmotion(musicData)
  if (emotionElement) selectedElements.push(emotionElement)

  // 4. ジャンル特性から発音スタイルを決定（3要素になるまで）
  if (selectedElements.length < 3) {
    const pronunciationElement = analyzePronunciation(musicData)
    if (pronunciationElement) selectedElements.push(pronunciationElement)
  }

  // 推奨理由を生成
  reasoning = generateReasoning(musicData, selectedElements)

  return {
    recommendedElements: selectedElements,
    reasoning,
    sunoText: generateSunoVocalText(selectedElements, gender)
  }
}

function analyzeTone(musicData: MusicAnalysisData): VocalElement | null {
  const { genre, style, instruments, mood } = musicData

  // ロック系判定
  if (isRockGenre(genre, style, instruments)) {
    if (isHeavyRock(instruments, style)) {
      return findElement('raw_rough') // Raw / Rough
    } else {
      return findElement('clear') // Clear
    }
  }

  // エモ・オルタナ系判定
  if (isEmoGenre(genre, style, mood)) {
    return findElement('dark_husky') // Dark / Husky
  }

  // ポップス系判定
  if (isPopGenre(genre, style)) {
    return findElement('clear') // Clear
  }

  // シティポップ・ソウル系
  if (isCityPopGenre(genre, style)) {
    return findElement('warm_soft') // Warm / Soft
  }

  // デフォルト
  return findElement('clear')
}

function analyzeDelivery(musicData: MusicAnalysisData): VocalElement | null {
  const { genre, style, tempo, mood } = musicData

  // ロック・パンク系は叫び気味
  if (isRockGenre(genre, style) && isHighEnergyTempo(tempo)) {
    return findElement('shouting') // Shouting
  }

  // バラード・スロー系は表現豊か
  if (isSlowTempo(tempo) || isBalladMood(mood)) {
    return findElement('expressive') // Expressive
  }

  // エモ・オルタナ系は淡々と
  if (isEmoGenre(genre, style, mood)) {
    return findElement('flat_deadpan') // Flat / Deadpan
  }

  // ポップス系で高音域多用がありそうな場合
  if (isPopGenre(genre, style) && isHighEnergyTempo(tempo)) {
    return findElement('falsetto') // Falsetto
  }

  // シティポップ・会話的な楽曲
  if (isCityPopGenre(genre, style)) {
    return findElement('conversational') // Conversational
  }

  // デフォルト
  return findElement('expressive')
}

function analyzeEmotion(musicData: MusicAnalysisData): VocalElement | null {
  const { mood, tempo, genre, style } = musicData

  // 切ない・憂鬱系
  if (isMelancholicMood(mood) || isEmoGenre(genre, style, mood)) {
    return findElement('melancholic') // Melancholic
  }

  // エネルギッシュ・アップテンポ系
  if (isHighEnergyTempo(tempo) || isEnergeticMood(mood)) {
    return findElement('energetic') // Energetic
  }

  // 心情系・バラード
  if (isBalladMood(mood) || isSlowTempo(tempo)) {
    return findElement('emotional') // Emotional
  }

  // 軽快・ポップス系
  if (isPopGenre(genre, style) && !isSlowTempo(tempo)) {
    return findElement('playful') // Playful
  }

  // 親密・アコースティック系
  if (isIntimateStyle(style, mood)) {
    return findElement('intimate') // Intimate
  }

  // デフォルト
  return findElement('emotional')
}

function analyzePronunciation(musicData: MusicAnalysisData): VocalElement | null {
  const { genre, style } = musicData

  // アニソン・J-POP系
  if (isAnimeSongGenre(genre, style) || isJPopGenre(genre, style)) {
    return findElement('clear_enunciation') // Clear Enunciation
  }

  // ボカロ風・電子系
  if (isVocaloidStyle(genre, style)) {
    return findElement('robotic') // Robotic
  }

  // オルタナ・エモ系
  if (isEmoGenre(genre, style)) {
    return findElement('breathy') // Breathy
  }

  // 現代的J-POP（英語ミックス）
  if (isModernJPopGenre(genre, style)) {
    return findElement('bilingual') // Bilingual
  }

  // デフォルト
  return findElement('clear_enunciation')
}

// ヘルパー関数群
function isRockGenre(genre?: string, style?: string, instruments?: string): boolean {
  if (!genre && !style && !instruments) return false
  const combined = `${genre} ${style} ${instruments}`.toLowerCase()
  return /rock|ロック|guitar|ギター|distort|heavy|metal/.test(combined)
}

function isHeavyRock(instruments?: string, style?: string): boolean {
  if (!instruments && !style) return false
  const combined = `${instruments} ${style}`.toLowerCase()
  return /distort|heavy|metal|hard|loud|aggressive/.test(combined)
}

function isEmoGenre(genre?: string, style?: string, mood?: string): boolean {
  if (!genre && !style && !mood) return false
  const combined = `${genre} ${style} ${mood}`.toLowerCase()
  return /emo|alternative|indie|melancholic|憂鬱|切ない|ヨルシカ|ずとまよ/.test(combined)
}

function isPopGenre(genre?: string, style?: string): boolean {
  if (!genre && !style) return false
  const combined = `${genre} ${style}`.toLowerCase()
  return /pop|ポップ|j-pop|jpop/.test(combined)
}

function isCityPopGenre(genre?: string, style?: string): boolean {
  if (!genre && !style) return false
  const combined = `${genre} ${style}`.toLowerCase()
  return /city.*pop|シティポップ|neo.*soul|r&b|soul/.test(combined)
}

function isHighEnergyTempo(tempo?: string): boolean {
  if (!tempo) return false
  return /fast|medium-fast|driving|upbeat|quick|速い|疾走/.test(tempo.toLowerCase())
}

function isSlowTempo(tempo?: string): boolean {
  if (!tempo) return false
  return /slow|relaxed|ballad|gentle|静か|ゆっくり/.test(tempo.toLowerCase())
}

function isBalladMood(mood?: string): boolean {
  if (!mood) return false
  return /ballad|emotional|heartfelt|romantic|切ない|感動|涙/.test(mood.toLowerCase())
}

function isMelancholicMood(mood?: string): boolean {
  if (!mood) return false
  return /melancholic|sad|nostalgic|wistful|憂鬱|切ない|悲しい|寂しい/.test(mood.toLowerCase())
}

function isEnergeticMood(mood?: string): boolean {
  if (!mood) return false
  return /energetic|upbeat|excited|powerful|元気|エネルギッシュ|パワフル/.test(mood.toLowerCase())
}

function isIntimateStyle(style?: string, mood?: string): boolean {
  if (!style && !mood) return false
  const combined = `${style} ${mood}`.toLowerCase()
  return /intimate|acoustic|soft|gentle|warm|アコースティック|優しい|温かい/.test(combined)
}

function isAnimeSongGenre(genre?: string, style?: string): boolean {
  if (!genre && !style) return false
  const combined = `${genre} ${style}`.toLowerCase()
  return /anime|アニメ|アニソン|opening|ending|op|ed/.test(combined)
}

function isJPopGenre(genre?: string, style?: string): boolean {
  if (!genre && !style) return false
  const combined = `${genre} ${style}`.toLowerCase()
  return /j-pop|jpop|japanese.*pop/.test(combined)
}

function isVocaloidStyle(genre?: string, style?: string): boolean {
  if (!genre && !style) return false
  const combined = `${genre} ${style}`.toLowerCase()
  return /vocaloid|ボカロ|miku|初音|electronic|digital/.test(combined)
}

function isModernJPopGenre(genre?: string, style?: string): boolean {
  if (!genre && !style) return false
  const combined = `${genre} ${style}`.toLowerCase()
  return /modern|contemporary|current|最新|現代的/.test(combined)
}

function findElement(id: string): VocalElement | null {
  return allVocalElements.find(el => el.id === id) || null
}

function generateReasoning(
  musicData: MusicAnalysisData, 
  elements: VocalElement[]
): string {
  let reasoning = '楽曲分析に基づく自動選択: '
  
  if (elements.length > 0) {
    const categories = elements.map(el => {
      switch (el.category) {
        case 'tone': return `声質「${el.label}」`
        case 'delivery': return `歌唱法「${el.label}」`
        case 'emotion': return `感情「${el.label}」`
        case 'pronunciation': return `発音「${el.label}」`
        default: return el.label
      }
    }).join('、')
    
    reasoning += categories
  }
  
  if (musicData.genre || musicData.style) {
    reasoning += ` | ジャンル: ${musicData.genre || musicData.style}`
  }
  
  if (musicData.mood) {
    reasoning += ` | 雰囲気: ${musicData.mood}`
  }
  
  return reasoning
}