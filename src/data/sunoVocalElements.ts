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
    sunoKeyword: 'shouting, slightly shouting'
  },
  {
    id: 'falsetto',
    category: 'delivery',
    label: 'Falsetto（裏声多用）',
    description: '裏声・ミックス多用',
    examples: ['髭男 藤原聡の高音域'],
    sunoKeyword: 'falsetto, mixed voice'
  },
  {
    id: 'conversational',
    category: 'delivery',
    label: 'Conversational（語りかけ）',
    description: '語りかけるように',
    examples: ['藤井風', 'ラップ風のトークボイス'],
    sunoKeyword: 'conversational, spoken'
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
    sunoKeyword: 'emotional, heartfelt'
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
    sunoKeyword: 'robotic, processed'
  },
  {
    id: 'bilingual',
    category: 'pronunciation',
    label: 'Bilingual（バイリンガル）',
    description: '日本語＋英語ミックス',
    examples: ['現代J-POP'],
    sunoKeyword: 'bilingual, code-switching'
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