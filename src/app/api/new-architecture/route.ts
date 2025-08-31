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
  
  // ボーカルタグ
  const vocalAttr = elements.vocal.attribute?.toLowerCase() || ''
  if (vocalAttr.includes('male') && !vocalAttr.includes('female')) {
    tags.push('male vocal')
  } else if (vocalAttr.includes('female')) {
    tags.push('female vocal')
  }
  
  if (vocalAttr.includes('solo')) {
    tags.push('solo')
  } else if (vocalAttr.includes('choir') || vocalAttr.includes('chorus')) {
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
  
  // ボーカル説明を英語化
  const vocalDesc = elements.vocal.attribute || 'female vocal'
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

// 🎤 歌詞生成 - 独立実装（OpenAI API直接呼び出し）
async function generateLyrics(
  elements: DecomposedElements,
  userSettings: UserSettings,
  styleInstruction: string
): Promise<string> {
  const { theme, lyricsContent, rapMode, language } = userSettings
  
  // プロンプト構築
  const promptBase = `以下の条件で日本語歌詞を生成してください：

**楽曲スタイル**: ${styleInstruction}

**テーマ**: ${theme}
**内容**: ${lyricsContent}
**ラップモード**: ${rapMode === 'full' ? '全面ラップ' : rapMode === 'partial' ? '部分ラップ' : 'なし'}
**言語設定**: ${language.primary}（英語混入度: ${language.englishMixLevel}）

**構造要件**:
- [Intro] [Verse] [Chorus] [Bridge] [Outro] などのセクション表記を含める
- ラップセクションがある場合は [Rap] セクションを含める
- 各行は歌いやすいリズムと韻を重視

**内容要件**:
- テーマ「${theme}」を中心とした展開
- ${userSettings.contentReflection === 'literal' ? '直接的な表現' : userSettings.contentReflection === 'metaphorical' ? '比喩的な表現' : 'バランスの取れた表現'}
- 日本語として自然で感情的な歌詞

歌詞のみを出力してください：`

  try {
    // 開発環境では簡略化された歌詞を返す
    if (process.env.NODE_ENV === 'development') {
      return `[Intro]
この楽曲のテーマは「${theme}」
新しい世界への扉が今開く

[Verse]
${lyricsContent || 'ここに歌詞の内容が入ります'}
心に響く言葉たちが
静かに語りかけてくる

[Chorus]  
輝く未来へと続く道
一歩ずつ歩んでいこう
${rapMode === 'full' || rapMode === 'partial' ? '\n[Rap]\nYeah, check it out, この瞬間を大切に\n言葉に込めた想いを届けよう' : ''}

[Bridge]
時には立ち止まることも
大切な時間なのだから

[Outro]
新しい章の始まり
ここから全てが変わっていく`
    }
    
    // 本番環境では実際のOpenAI API呼び出し
    // TODO: OpenAI APIキーの設定と呼び出し実装
    return `[開発中] ${theme}をテーマとした歌詞が生成されます`
    
  } catch (error) {
    console.error('歌詞生成エラー:', error)
    throw new Error('歌詞生成に失敗しました')
  }
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
  
  return generatedTitles.slice(0, 6) // 最大6個
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
    
    // 🎤 歌詞生成
    const lyrics = await generateLyrics(decomposedElements, userSettings, styleInstruction)
    
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