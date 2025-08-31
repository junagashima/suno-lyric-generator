// SUNO AI ボーカル4要素データ定義
// 参考: SUNO用 ボーカル歌い方 指示ノウハウ

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

// 1. 声の質（Tone）
export const toneOptions: VocalElement[] = [
  {
    id: 'clear',
    category: 'tone',
    label: 'Clear（クリア）',
    description: '澄んだ声、ハッキリした発音',
    examples: ['Official髭男dism', '米津玄師（クリーン寄り）'],
    sunoKeyword: 'clear'
  },
  {
    id: 'warm_soft',
    category: 'tone', 
    label: 'Warm / Soft（温かい・柔らか）',
    description: '柔らかく優しい声',
    examples: ['星野源', '優里'],
    sunoKeyword: 'warm, soft'
  },
  {
    id: 'raw_rough',
    category: 'tone',
    label: 'Raw / Rough（生々しい・荒い）', 
    description: '生っぽく荒い、少し枯れ気味',
    examples: ['ELLEGARDEN 細美武士', 'BUMP藤原基央'],
    sunoKeyword: 'raw, rough'
  },
  {
    id: 'bright',
    category: 'tone',
    label: 'Bright（明るい）',
    description: '高めで抜ける声',
    examples: ['緑黄色社会 長屋晴子'],
    sunoKeyword: 'bright'
  },
  {
    id: 'dark_husky',
    category: 'tone',
    label: 'Dark / Husky（暗い・ハスキー）',
    description: '低めで息混じり',
    examples: ['ヨルシカ suis', 'ずっと真夜中でいいのに。ACAね'],
    sunoKeyword: 'dark, husky'
  }
]

// 2. 歌唱法（Delivery）
export const deliveryOptions: VocalElement[] = [
  {
    id: 'expressive',
    category: 'delivery',
    label: 'Expressive（表現豊か）',
    description: '感情豊か、ドラマチック',
    examples: ['多くのJ-POPアーティスト'],
    sunoKeyword: 'expressive'
  },
  {
    id: 'flat_deadpan',
    category: 'delivery',
    label: 'Flat / Deadpan（淡々と）',
    description: '抑揚を抑えて淡々と',
    examples: ['ヨルシカ', 'ずとまよの一部楽曲'],
    sunoKeyword: 'flat, deadpan'
  },
  {
    id: 'shouting',
    category: 'delivery',
    label: 'Shouting（叫び気味）',
    description: 'ロックやエモで使う叫び気味',
    examples: ['ELLEGARDEN', 'ONE OK ROCK'],
    sunoKeyword: 'shouting'
  },
  {
    id: 'falsetto',
    category: 'delivery',
    label: 'Falsetto（裏声多用）',
    description: '裏声・ミックス多用',
    examples: ['髭男 藤原聡の高音域'],
    sunoKeyword: 'falsetto'
  },
  {
    id: 'conversational',
    category: 'delivery',
    label: 'Conversational（語りかけ）',
    description: '語りかけるように',
    examples: ['藤井風', 'ラップ風のトークボイス'],
    sunoKeyword: 'conversational'
  }
]

// 3. 感情表現（Emotion）
export const emotionOptions: VocalElement[] = [
  {
    id: 'emotional',
    category: 'emotion',
    label: 'Emotional（感情的）',
    description: '心情を込める',
    examples: ['バラード系楽曲'],
    sunoKeyword: 'emotional'
  },
  {
    id: 'energetic',
    category: 'emotion',
    label: 'Energetic（エネルギッシュ）',
    description: '元気で勢い重視',
    examples: ['アップテンポ楽曲'],
    sunoKeyword: 'energetic'
  },
  {
    id: 'melancholic',
    category: 'emotion',
    label: 'Melancholic（憂鬱・切ない）',
    description: '切なく憂鬱',
    examples: ['エモ系楽曲'],
    sunoKeyword: 'melancholic'
  },
  {
    id: 'playful',
    category: 'emotion',
    label: 'Playful（軽やか）',
    description: '軽やかで遊び心あり',
    examples: ['ポップス系楽曲'],
    sunoKeyword: 'playful'
  },
  {
    id: 'intimate',
    category: 'emotion',
    label: 'Intimate（親密）',
    description: '囁くように近い声',
    examples: ['バラード系楽曲'],
    sunoKeyword: 'intimate'
  }
]

// 4. 発音・言語的特徴（Pronunciation）
export const pronunciationOptions: VocalElement[] = [
  {
    id: 'clear_enunciation',
    category: 'pronunciation',
    label: 'Clear Enunciation（明瞭発音）',
    description: '歌詞を聞き取りやすく発音',
    examples: ['アニソン', 'J-POP'],
    sunoKeyword: 'clear enunciation'
  },
  {
    id: 'breathy',
    category: 'pronunciation',
    label: 'Breathy（息混じり）',
    description: '息を多く混ぜる（ボカロっぽさも）',
    examples: ['ボカロ系楽曲'],
    sunoKeyword: 'breathy'
  },
  {
    id: 'robotic',
    category: 'pronunciation',
    label: 'Robotic（機械的）',
    description: '機械的（ボカロ風、K-POPエフェクト寄り）',
    examples: ['ボカロ楽曲', 'K-POP'],
    sunoKeyword: 'robotic'
  },
  {
    id: 'bilingual',
    category: 'pronunciation',
    label: 'Bilingual（バイリンガル）',
    description: '日本語＋英語ミックス',
    examples: ['現代J-POP'],
    sunoKeyword: 'bilingual'
  }
]

// 全選択肢を統合
export const allVocalElements = [
  ...toneOptions,
  ...deliveryOptions,
  ...emotionOptions,
  ...pronunciationOptions
]

// カテゴリー別選択肢マップ
export const vocalElementsByCategory = {
  tone: toneOptions,
  delivery: deliveryOptions,
  emotion: emotionOptions,
  pronunciation: pronunciationOptions
}

// よく使われる組み合わせのプリセット
export interface VocalPreset {
  id: string
  name: string
  description: string
  elements: string[] // VocalElement.id配列
  sunoExample: string
}

export const vocalPresets: VocalPreset[] = [
  {
    id: 'ellegarden_rock',
    name: 'ロック（ELLEGARDEN風）',
    description: 'エネルギッシュなロックボーカル',
    elements: ['raw_rough', 'shouting', 'emotional'],
    sunoExample: 'Vocals: male voice, raw and emotional, clear but slightly shouting style.'
  },
  {
    id: 'higedan_pop',
    name: 'ポップ（髭男風）',
    description: 'クリアで表現豊かなポップス',
    elements: ['clear', 'expressive', 'energetic'],
    sunoExample: 'Vocals: male voice, clear and expressive, wide dynamic range with falsetto in the chorus.'
  },
  {
    id: 'hoshinogen_city',
    name: 'シティポップ（星野源風）',
    description: '温かく軽やかなシティポップ',
    elements: ['warm_soft', 'conversational', 'playful'],
    sunoExample: 'Vocals: male voice, soft and warm, relaxed and slightly playful.'
  },
  {
    id: 'yorushika_emo',
    name: 'エモ（ヨルシカ風）',
    description: '切ない女性ボーカル',
    elements: ['dark_husky', 'expressive', 'melancholic'],
    sunoExample: 'Vocals: female voice, husky and melancholic, expressive with breathy tone.'
  },
  {
    id: 'vocaloid',
    name: 'ボカロ風',
    description: 'ボーカロイド風の電子ボーカル',
    elements: ['bright', 'robotic', 'clear_enunciation'],
    sunoExample: 'Vocals: high-pitched, processed and slightly robotic tone, fast phrasing with clear enunciation.'
  }
]

// SUNOテキスト生成関数
export function generateSunoVocalText(elements: VocalElement[], gender: string = 'male'): string {
  if (elements.length === 0) return `${gender} voice`
  
  const keywords = elements.map(el => el.sunoKeyword).join(', ')
  return `${gender} voice, ${keywords}`
}

// ========================================
// 段階3: 年齢・楽曲長設定のSUNO最適化モード
// ========================================

// ボーカリスト年齢設定
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

export const vocalistAges: VocalistAge[] = [
  {
    id: 'teen',
    label: '10代',
    description: '若々しく透明感のある声質、高音が得意',
    sunoKeywords: ['youthful voice', 'clear tone', 'bright'],
    vocalCharacteristics: {
      tone: ['bright', 'clear'],
      delivery: ['energetic', 'expressive'],
      voiceQuality: 'young and fresh'
    }
  },
  {
    id: 'twenties',
    label: '20代',
    description: 'バランスの取れた成熟した声、表現力豊か',
    sunoKeywords: ['mature voice', 'balanced tone', 'expressive'],
    vocalCharacteristics: {
      tone: ['clear', 'warm_soft'],
      delivery: ['expressive', 'conversational'],
      voiceQuality: 'balanced and versatile'
    }
  },
  {
    id: 'thirties',
    label: '30代',
    description: '深みと落ち着きのある声、感情表現に説得力',
    sunoKeywords: ['mature voice', 'rich tone', 'emotional depth'],
    vocalCharacteristics: {
      tone: ['warm_soft', 'dark_husky'],
      delivery: ['conversational', 'expressive'],
      voiceQuality: 'deep and controlled'
    }
  },
  {
    id: 'forties_plus',
    label: '40代以上',
    description: '渋みと重厚感のある声、人生経験を感じさせる',
    sunoKeywords: ['experienced voice', 'deep resonance', 'seasoned'],
    vocalCharacteristics: {
      tone: ['dark_husky', 'raw_rough'],
      delivery: ['powerful', 'expressive'],
      voiceQuality: 'rich and experienced'
    }
  }
]

// 楽曲長最適化設定（既存のsongLength値に基づく）
export interface SongLengthOptimization {
  songLength: string // '2-3分', '3-4分', '4-5分', '5分以上'
  sunoOptimizations: string[]
}

export const songLengthOptimizations: Record<string, string[]> = {
  '2-3分': [
    'concise structure',
    'immediate hook',
    'tight arrangement'
  ],
  '3-4分': [
    'balanced dynamics',
    'verse-chorus contrast', 
    'bridge variation'
  ],
  '4-5分': [
    'extended development',
    'complex arrangement',
    'multiple emotional peaks'
  ],
  '5分以上': [
    'epic structure',
    'progressive development',
    'sophisticated storytelling',
    'instrumental breaks'
  ]
}

// SUNO最適化設定（修正版）
export interface SunoOptimizationSettings {
  vocalistAge: VocalistAge | null
  songLength: string // 既存のsongLength値を使用
  vocalElements: VocalElement[]
}

// ボーカリスト年齢に基づく推奨ボーカル要素の取得
export function getRecommendedElementsForVocalistAge(vocalistAge: VocalistAge): VocalElement[] {
  const recommended: VocalElement[] = []
  
  // 年齢に応じたtone要素
  vocalistAge.vocalCharacteristics.tone.forEach(toneId => {
    const element = allVocalElements.find(el => el.id === toneId)
    if (element) recommended.push(element)
  })
  
  // 年齢に応じたdelivery要素
  vocalistAge.vocalCharacteristics.delivery.forEach(deliveryId => {
    const element = allVocalElements.find(el => el.id === deliveryId)
    if (element) recommended.push(element)
  })
  
  return recommended
}

// ボーカル最適化テキスト生成（修正版・3要素制限）
export function generateOptimizedSunoText(
  elements: VocalElement[], 
  gender: string,
  vocalistAge: VocalistAge | null,
  songLength: string
): string {
  // 選択された基本要素のキーワードを取得
  const selectedKeywords = elements.map(el => el.sunoKeyword)
  
  // ボーカリスト年齢による最適化キーワードを取得
  let ageKeywords: string[] = []
  if (vocalistAge) {
    ageKeywords = vocalistAge.sunoKeywords.slice(0, 2)
  }
  
  // 全てのキーワードを結合して、厳密に3つまでに制限（SUNO推奨）
  const allKeywords = [...selectedKeywords, ...ageKeywords]
  const limitedKeywords = allKeywords.slice(0, 3)
  
  const finalText = `${gender} voice, ${limitedKeywords.join(', ')}`
  
  // 楽曲長最適化は英語スタイル指示で別途処理（ボーカルテキストには含めない）
  return finalText
}