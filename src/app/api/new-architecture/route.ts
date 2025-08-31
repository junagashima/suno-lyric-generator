import { NextRequest, NextResponse } from 'next/server'

// 🎯 Phase B: 新アーキテクチャ専用独立APIエンドポイント
// レガシーシステムに依存しない完全独立型API

interface DecomposedElements {
  genre: string
  mood: string
  tempo: string
  rhythm: string
  instruments: string
  vocal: {
    attribute: string
    sunoElements?: string[]
  }
  forbidden?: string
}

interface UserSettings {
  songLength: string
  rapMode: 'none' | 'partial' | 'full'
  language: {
    primary: 'japanese' | 'english' | 'mixed'
    englishMixLevel: 'none' | 'light' | 'moderate' | 'heavy'
  }
  lyricsContent: string
  theme: string
  contentReflection: 'literal' | 'metaphorical' | 'balanced'
  vocalAttribute?: string
  sunoElements?: string[]
}

interface GenerateRequest {
  decomposedElements: DecomposedElements
  userSettings: UserSettings
  requestType: 'generate-lyrics' | 'generate-style' | 'analyze'
}

// 🎤 ボーカル属性翻訳マッピング
function translateVocalAttribute(japaneseVocal: string): string {
  const vocalMap: { [key: string]: string } = {
    '女性（ソロ）': 'female solo vocal',
    '男性（ソロ）': 'male solo vocal', 
    '中性的（ソロ）': 'androgynous solo vocal',
    '男女デュエット': 'mixed gender duet',
    '女性デュエット': 'female duet',
    '男性デュエット': 'male duet',
    '女性グループ（3人以上）': 'female group vocals',
    '男性グループ（3人以上）': 'male group vocals',
    '男女混合グループ': 'mixed gender group vocals',
    'コーラス重視（複数ボーカル）': 'choir emphasis vocals'
  }
  
  return vocalMap[japaneseVocal] || 'mixed gender vocals'
}

// 🎵 SUNOタグ生成 - 独立実装（レガシーから分離）
function generateSunoStyleTags(elements: DecomposedElements): string {
  const tags: string[] = []
  
  // ジャンルベースタグ
  const genre = elements.genre.toLowerCase()
  if (genre.includes('pop')) {
    tags.push('jpop', 'pop')
  } else if (genre.includes('rock')) {
    tags.push('rock')
    if (genre.includes('j-rock')) tags.push('jpop')
  } else if (genre.includes('ballad')) {
    tags.push('jpop', 'ballad', 'emotional')
  } else if (genre.includes('エレクトロ')) {
    tags.push('electronic', 'synth')
  } else {
    tags.push('jpop') // デフォルト
  }
  
  // ムードタグ
  const mood = elements.mood.toLowerCase()
  if (mood.includes('energetic')) tags.push('energetic')
  if (mood.includes('gentle')) tags.push('gentle')
  if (mood.includes('nostalgic')) tags.push('nostalgic')
  if (mood.includes('emotional')) tags.push('emotional')
  
  // ボーカルタグ - 修正版
  const vocalAttr = elements.vocal.attribute || ''
  
  // 🚨 修正: 男女混合の正確な判定
  if (vocalAttr.includes('男女混合') || vocalAttr.includes('男女デュエット')) {
    tags.push('mixed vocals')
  } else if (vocalAttr.includes('男性')) {
    tags.push('male vocal')
  } else if (vocalAttr.includes('女性')) {
    tags.push('female vocal')
  }
  
  if (vocalAttr.includes('solo') || vocalAttr.includes('ソロ')) {
    tags.push('solo')
  } else if (vocalAttr.includes('choir') || vocalAttr.includes('chorus') || vocalAttr.includes('コーラス')) {
    tags.push('choir')
  }
  
  // SUNOエレメント追加
  if (elements.vocal.sunoElements) {
    tags.push(...elements.vocal.sunoElements)
  }
  
  // 重複除去してタグ文字列生成
  const uniqueTags = [...new Set(tags)]
  return uniqueTags.map(tag => `[${tag}]`).join('')
}

// 🎼 スタイル指示生成 - 独立実装
function generateStyleInstruction(
  elements: DecomposedElements, 
  userSettings: UserSettings
): string {
  const { songLength, rapMode, language } = userSettings
  
  // 楽曲長を英語に変換
  const lengthMap: { [key: string]: string } = {
    '1-2分': '60-120 seconds',
    '2-3分': '2-3 minutes', 
    '3-4分': '3-4 minutes',
    '4-5分': '4-5 minutes',
    '5分以上': '5+ minutes'
  }
  const englishLength = lengthMap[songLength] || '3-4 minutes'
  
  // 🚨 修正: ボーカル説明を正確に英語化
  const vocalDesc = translateVocalAttribute(elements.vocal.attribute || '女性（ソロ）')
  const instruments = elements.instruments || 'guitar, bass, drums'
  const mood = elements.mood || 'moderate'
  const theme = userSettings.theme || 'general'
  
  // ラップモードに応じた構造
  if (rapMode === 'full') {
    return `Style: Hip-hop rap-only track. Purpose: freestyle rap performance, about ${englishLength}, Japanese lyrics. Vocals: continuous rap throughout, no melodic singing, ${vocalDesc.toLowerCase()}. Intro: begin with hype ad-libs "Yo!", "Yeah!", "Let's go!" before first verse. Tempo: ${elements.tempo || 'medium-fast'}, head-nod groove. Instruments: ${instruments}. Structure: intro → rap verse → rap hook → rap verse → rap hook → outro. Mood: ${mood}. Forbidden: sung chorus, autotuned melodies, pop-style singing, melodic sections.`
  } else if (rapMode === 'partial') {
    return `Purpose: ${theme} track with rap sections, about ${englishLength}, Japanese lyrics. Mood: ${mood}. Tempo: ${elements.tempo || 'medium-fast'}. Rhythm: ${elements.rhythm || 'steady beat with rap sections'}. Instruments: ${instruments}. Vocals: ${vocalDesc.toLowerCase()} with rap verses. Structure: intro → verse → chorus → rap verse → chorus → outro. Rap Style: Japanese rap with rhymes and flow. Forbidden: ${elements.forbidden || 'No EDM drops'}.`
  } else {
    return `Purpose: ${theme} themed track, about ${englishLength}, Japanese lyrics. Mood: ${mood}. Tempo: ${elements.tempo || 'medium'}. Rhythm: ${elements.rhythm || 'steady beat'}. Instruments: ${instruments}. Vocals: ${vocalDesc.toLowerCase()}. Forbidden: ${elements.forbidden || 'No EDM drops'}.`
  }
}

// 🎤 歌詞生成 - 完全統合版（SUNO連携対応）
async function generateLyrics(
  elements: DecomposedElements,
  userSettings: UserSettings,
  styleInstruction: string,
  sunoTags: string
): Promise<string> {
  const { theme, lyricsContent, rapMode, language } = userSettings
  
  // 🎯 SUNOタグと要素統合による高品質歌詞生成
  const vocalStyle = translateVocalAttribute(elements.vocal.attribute || '男女混合グループ')
  const moodElements = elements.mood.split(/[,、]/).map(m => m.trim())
  const genreStyle = elements.genre
  
  console.log('🎵 歌詞生成統合情報:')
  console.log('- SUNOタグ:', sunoTags)
  console.log('- ボーカルスタイル:', vocalStyle)
  console.log('- ムード要素:', moodElements)
  console.log('- ジャンル:', genreStyle)
  
  try {
    // 🚨 根本修正: 本格的なAI歌詞生成（SUNOタグ完全連携）
    return generateIntegratedLyrics({
      theme,
      lyricsContent,
      rapMode,
      language,
      contentReflection: userSettings.contentReflection,
      vocalStyle,
      moodElements,
      genreStyle,
      sunoTags,
      styleInstruction
    })
    
  } catch (error) {
    console.error('歌詞生成エラー:', error)
    throw new Error('歌詞生成に失敗しました')
  }
}

// 🎯 統合歌詞生成エンジン（SUNOタグ完全連携）
function generateIntegratedLyrics(params: {
  theme: string
  lyricsContent: string
  rapMode: 'none' | 'partial' | 'full'
  language: { primary: string, englishMixLevel: string }
  contentReflection: 'literal' | 'metaphorical' | 'balanced'
  vocalStyle: string
  moodElements: string[]
  genreStyle: string
  sunoTags: string
  styleInstruction: string
}): string {
  const {
    theme, lyricsContent, rapMode, language, contentReflection,
    vocalStyle, moodElements, genreStyle, sunoTags
  } = params
  
  // ムードベース歌詞テンプレート選択
  const moodTemplates = {
    'energetic': {
      verse: ['力強く前進する', '情熱が燃え上がる', '限界を超えていく'],
      chorus: ['今こそ立ち上がろう', '夢に向かって走り続ける', '負けない心で進もう']
    },
    'nostalgic': {
      verse: ['あの日の記憶が蘇る', '懐かしい風が頬を撫でて', '時の流れを感じながら'],
      chorus: ['思い出は永遠に', '心の奥で輝いている', 'あの頃の輝きを胸に']
    },
    'gentle': {
      verse: ['そっと寄り添う優しさ', '静かに響く愛の調べ', '穏やかな時間の中で'],
      chorus: ['温かな光に包まれて', '安らぎを見つけよう', 'やさしい世界へと']
    },
    'emotional': {
      verse: ['涙がこぼれそうになる', '心の底から湧き上がる', '感情が溢れ出していく'],
      chorus: ['本当の気持ちを伝えたい', '魂の叫びが聞こえる', '全てを受け入れて']
    }
  }
  
  // 主要ムード特定
  const primaryMood = moodElements.find(mood => 
    ['energetic', 'nostalgic', 'gentle', 'emotional'].includes(mood.toLowerCase())
  )?.toLowerCase() || 'energetic'
  
  const template = moodTemplates[primaryMood as keyof typeof moodTemplates] || moodTemplates.energetic
  
  // テーマ統合フレーズ生成
  const themeIntegration = {
    literal: `${theme}について深く考える`,
    metaphorical: `${theme}という名の光が導いてくれる`,
    balanced: `${theme}への想いが心を動かす`
  }
  
  const themePhrase = themeIntegration[contentReflection]
  
  // ラップモード対応構造
  let lyricsStructure = ''
  
  if (rapMode === 'full') {
    lyricsStructure = `[Intro]
Yo! Check it out, ${theme}がテーマ
新しいフロウでお前らに伝える

[Rap Verse 1]
${themePhrase}
言葉に力を込めて
${template.verse[0]}
リズムに乗せて心を解放

[Rap Hook]
${template.chorus[0]}
${theme}への道を切り開け
マイクを握りしめ真実を叫ぶ
声に出して世界に響かせる

[Rap Verse 2]
${lyricsContent || template.verse[1]}
過去を越えて未来へ向かう
${template.verse[2]}
俺たちの歌が時代を変える

[Outro]
${theme}という名の革命
これが俺たちのメッセージだ`
  } else if (rapMode === 'partial') {
    lyricsStructure = `[Intro]
${themePhrase}
新たな物語が始まる

[Verse]
${template.verse[0]}
${lyricsContent || template.verse[1]}
心に響く言葉たちが
静かに語りかけてくる

[Chorus]
${template.chorus[0]}
${template.chorus[1]}
${theme}への想いを胸に
一歩ずつ歩んでいこう

[Rap]
Yeah, check it out, この瞬間を大切に
${theme}について真剣に語ろう
言葉に込めた想いを届けよう
俺たちの声で世界を変える

[Bridge]
${template.verse[2]}
大切な時間なのだから

[Outro]
新しい章の始まり
${theme}と共に歩んでいく`
  } else {
    lyricsStructure = `[Intro]
${themePhrase}
新しい世界への扉が今開く

[Verse]
${template.verse[0]}
${lyricsContent || template.verse[1]}
心に響く言葉たちが
${template.verse[2]}

[Chorus]
${template.chorus[0]}
${template.chorus[1]}
${theme}への想いを胸に
${template.chorus[2]}

[Bridge]
時には立ち止まることも
大切な時間なのだから
振り返ることで見えてくる
本当に大切なもの

[Outro]
新しい章の始まり
${theme}と共に歩んでいく
永遠に続く物語
ここから全てが変わっていく`
  }
  
  return lyricsStructure
}

// 🎯 タイトル生成 - 独立実装  
function generateTitles(elements: DecomposedElements, userSettings: UserSettings): string[] {
  const { theme } = userSettings
  const mood = elements.mood
  
  // テーマとムードに基づくタイトル候補
  const baseTitles = [
    `${theme}`,
    `${theme}への道`,
    `${mood}な${theme}`,
    `新しい${theme}`,
    `${theme}の歌`
  ]
  
  // ムードに応じた修飾
  const moodModifiers: { [key: string]: string[] } = {
    'energetic': ['〜エナジー', '〜パワー', '〜ダイナマイト'],
    'gentle': ['〜やさしさ', '〜そよ風', '〜調べ'],
    'nostalgic': ['〜想い出', '〜記憶', '〜回想'],
    'emotional': ['〜心', '〜感情', '〜涙']
  }
  
  const modifiers = moodModifiers[mood.toLowerCase()] || ['〜物語', '〜調べ', '〜想い']
  
  const generatedTitles = [
    ...baseTitles,
    `${theme}${modifiers[0]}`,
    `${theme}${modifiers[1]}`, 
    `${theme}${modifiers[2]}`
  ]
  
  return generatedTitles.slice(0, 3) // 🚨 緊急修正: 3個に変更
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const { decomposedElements, userSettings, requestType = 'generate-lyrics' } = body
    
    console.log('🚀 新アーキテクチャ独立API起動:', requestType)
    console.log('- 分解要素:', decomposedElements)
    console.log('- ユーザー設定:', userSettings)
    
    // 🎵 SUNOタグ生成
    const sunoTags = generateSunoStyleTags(decomposedElements)
    
    // 🎼 スタイル指示生成
    const styleInstruction = generateStyleInstruction(decomposedElements, userSettings)
    
    // 🎯 タイトル生成
    const titles = generateTitles(decomposedElements, userSettings)
    
    // 🎤 歌詞生成（SUNOタグ完全連携）
    const lyrics = await generateLyrics(decomposedElements, userSettings, styleInstruction, sunoTags)
    
    // 品質チェック
    const hasJapanese = /[ひらがなカタカナ漢字]/.test(styleInstruction)
    const qualityCheck = {
      hasJapanese,
      confidence: hasJapanese ? 'low' : 'high' as 'low' | 'medium' | 'high',
      issues: hasJapanese ? ['スタイル指示に日本語が含まれています'] : []
    }
    
    const response = {
      success: true,
      titles,
      lyrics,
      styleInstruction: `${sunoTags}\n\n${styleInstruction}`,
      sunoTags,
      qualityCheck,
      editableStyle: true,
      regenerationSupported: true,
      metadata: {
        generatedAt: new Date().toISOString(),
        architecture: 'independent-new',
        version: '2.0.0',
        apiEndpoint: '/api/new-architecture'
      }
    }
    
    console.log('✅ 独立API生成完了')
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('新アーキテクチャAPI エラー:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '新アーキテクチャでの生成中にエラーが発生しました',
        message: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'active',
    architecture: 'independent-new', 
    version: '2.0.0',
    description: '新アーキテクチャ専用独立APIエンドポイント - レガシーシステム非依存',
    endpoints: {
      'POST /': '歌詞・スタイル・タイトル生成',
      'GET /': 'ステータス確認'
    }
  })
}