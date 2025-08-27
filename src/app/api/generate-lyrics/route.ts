import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// テーマと雰囲気に基づいてフォールバックタイトルを生成
function generateFallbackTitles(theme: string, mood: string, content: string): string[] {
  const titles: string[] = []
  
  // テーマベースのタイトル
  if (theme.includes('恋') || theme.includes('愛')) {
    titles.push('君への想い', '恋の調べ', '心のメロディー')
  } else if (theme.includes('卒業') || theme.includes('別れ')) {
    titles.push('旅立ちの日に', '新しい扉', '思い出の彼方')
  } else if (theme.includes('友情') || theme.includes('仲間')) {
    titles.push('かけがえのない時間', '絆の歌', 'ともに歩もう')
  } else if (theme.includes('家族')) {
    titles.push('ありがとうの歌', '家族の絆', '温かい場所')
  } else if (theme.includes('夢') || theme.includes('希望')) {
    titles.push('明日への扉', '輝く未来', '夢の向こう側')
  }
  
  // 雰囲気ベースのタイトル
  if (mood.includes('切ない') || mood.includes('悲しい')) {
    titles.push('心の雨', '涙の調べ', '静かな想い')
  } else if (mood.includes('希望') || mood.includes('前向き')) {
    titles.push('光の道', '新しい朝', '希望の歌')
  } else if (mood.includes('温かい') || mood.includes('優しい')) {
    titles.push('やさしい時間', '温もり', '心の安らぎ')
  }
  
  // 一般的なフォールバック
  titles.push('今日という日', '心の歌', '大切なもの', '新しい始まり', '永遠の瞬間')
  
  return titles
}

interface VocalSettings {
  gender: string
  age: string
  nationality: string
  techniques: string[]
}

interface GenerateRequest {
  mode: 'simple' | 'custom'
  mood: string
  musicStyle: string
  theme: string
  content: string
  songLength: string
  vocal: VocalSettings
}

export async function POST(request: NextRequest) {
  try {
    const {
      mode,
      mood,
      musicStyle,
      theme,
      content,
      songLength,
      vocal
    }: GenerateRequest = await request.json()

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

    // 歌詞生成プロンプト
    const lyricsPrompt = `
あなたは日本のヒット曲を数多く手がけたプロの作詞家です。Suno AIで使用するための歌詞とタイトルを作成してください。

## 楽曲設定
- モード: ${mode === 'simple' ? '簡単モード（参考楽曲ベース）' : 'こだわりモード（完全オリジナル）'}
- 雰囲気・感情: ${mood}
- 音楽スタイル: ${musicStyle}
- テーマ・使用場面: ${theme}
- 楽曲の長さ: ${songLength}

## ボーカル設定
- 構成: ${vocal.gender}
- 年齢: ${vocal.age}
- 国籍: ${vocal.nationality}
- 歌唱技法: ${vocal.techniques.join(', ')}

## ボーカル構成の特徴
${vocal.gender.includes('グループ') || vocal.gender.includes('デュエット') || vocal.gender.includes('コーラス') ? 
  '※ このボーカル構成では、ハーモニー・コーラスワーク・対話的歌唱を効果的に活用した歌詞構成を心がけてください' : 
  '※ ソロボーカルの表現力を活かした歌詞構成を心がけてください'}

## 歌詞に盛り込みたい内容
${content}

## 作詞要件
以下の要素を考慮してJ-POPヒット曲として成功する歌詞を作成してください：

1. **J-POPヒット曲の作詞戦略**
   - リスナーの記憶に残りやすい表現
   - 感情に訴えかける言葉選び
   - 共感を呼ぶ普遍的テーマの表現
   - シンプルでキャッチーな言葉の使用
   - 現代のJ-POPトレンドを反映した語彙選択

2. **Suno AIタグの効果的活用**
   - 楽曲構成タグ: [Intro], [Verse], [Pre-Chorus], [Chorus], [Bridge], [Outro]
   - 演出タグ: [Fade in], [Fade out], [Instrumental Break]
   - ボーカル指示タグ: [Vocal harmony], [Ad libs], [Whispered], [Belted]
   - 楽器指示タグ: [Piano solo], [Guitar riff], [String section]

3. **楽曲構成**
   ${songLength === '2-3分' ? '短めの楽曲構成（Intro-Verse-Chorus-Verse-Chorus-Outro）' :
     songLength === '3-4分' ? '標準的な楽曲構成（Intro-Verse-Pre-Chorus-Chorus-Verse-Pre-Chorus-Chorus-Bridge-Chorus-Outro）' :
     songLength === '4-5分' ? '充実した楽曲構成（複数のセクション、Cメロ、間奏を含む）' :
     '長い楽曲構成（複数の展開、インストゥルメンタル部分を含む）'}

## 出力形式
必ず以下の形式で回答してください（タイトル候補は必須）：

**タイトル候補:**
1. タイトル1
2. タイトル2
3. タイトル3

**歌詞（Sunoタグ付き）:**
[Intro]
[楽器演奏部分の指示がある場合]

[Verse]
歌詞内容...

[Pre-Chorus]
歌詞内容...

[Chorus]
歌詞内容...

[続きのセクション...]

[Outro]
[Fade out]

## 重要な出力要件
※ **必ずタイトル候補を3つ**最初に出力してください
※ タイトルは楽曲のテーマと雰囲気を反映した魅力的なものにしてください
※ 歌詞のみを出力し、前後の説明文は含めないでください
※ Sunoタグは効果的に配置し、楽曲の流れを明確に示してください
※ 日本語の美しい表現と現代的な感覚を両立させてください
※ リスナーが口ずさみたくなるようなキャッチーなフレーズを含めてください
`

    // 英語スタイル指示生成プロンプト（表現力強化）
    const stylePrompt = `
Suno AIで楽曲を生成するための高品質英語スタイル指示を作成してください。ChatGPTレベルの表現力で、Suno AIが音楽の「魂」を理解できる指示文を生成します。

## 日本語分析結果（全要素統合）
- 雰囲気・感情: ${mood}
- 音楽スタイル: ${musicStyle}
- テーマ: ${theme}
- ボーカル構成: ${vocal.gender}
- ボーカル年齢: ${vocal.age}
- ボーカル国籍: ${vocal.nationality}
- 歌唱技法: ${vocal.techniques.join(', ')}
- 楽曲の長さ: ${songLength}

## Suno AI最適化指示作成方針

### 1. 感覚的表現の活用
- 「120BPM」→「fast-paced and intense」
- 「切ない」→「melancholic yet evocative」
- 「ヘビー」→「heavy and distorted」

### 2. 音の質感・雰囲気の英語表現
- **ダーク**: dark, ominous, haunting, brooding
- **エネルギッシュ**: energetic, explosive, dynamic, driving
- **切ない**: melancholic, wistful, bittersweet, poignant
- **透明感**: clear, crisp, ethereal, pristine

### 3. 楽器・音響の表現技法
- **ギター**: distorted, fingerpicked, heavy riffs, sharp cutting
- **ドラム**: punchy, driving, sharp snares, powerful kicks
- **ボーカル**: soaring, passionate, restrained-to-explosive, layered harmonies

### 3.1. グループボーカル表現技法（${vocal.gender}の場合）
${vocal.gender.includes('グループ') || vocal.gender.includes('デュエット') || vocal.gender.includes('コーラス') ? `
- **ハーモニー**: rich harmonies, layered vocals, call-and-response, vocal interplay
- **コーラスワーク**: backing vocals, group chorus, multi-part harmony
- **対話**: conversational vocals, duet exchanges, interwoven melodies
- **音響効果**: vocal layering, harmonic richness, ensemble depth
` : `
- **ソロ表現**: expressive lead vocals, emotional delivery, vocal focus
- **表現力**: dynamic range, vocal technique mastery, emotional connection
`}

### 4. 楽曲展開の動的表現
- 「静から動へ」→「building from calm to explosive」
- 「緊張と解放」→「tension and release dynamics」
- 「疾走感」→「driving momentum with urgent energy」

## 出力要件
- **150語以内**で表現力豊かに
- **感覚的・比喩的表現**を積極活用
- 楽曲の「エネルギー・感情の流れ」を表現
- Suno AIが「音楽体験」を再現できる指示
- 英語指示文のみ出力

## 目標品質例（ChatGPTレベル）：
"Dark and experimental J-rock with heavy distorted guitars, driving bass, sharp drums, and ominous synth accents. Dynamic male vocals shifting between calm restraint and explosive shouts, layered with falsetto harmonies. Fast and intense tempo with sudden energy shifts. Tense, chaotic, yet exhilarating atmosphere like dancing on the edge of collapse in a neon-lit city at midnight."
`

    // 歌詞生成
    const lyricsCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは日本の音楽業界で活躍する経験豊富な作詞家です。Suno AIに最適化された、日本のヒット曲の要素を持つ歌詞を作成することができます。J-POPの作詞戦略、リスナーの心理、現代のトレンドを深く理解しています。必ず「**タイトル候補:**」セクションから始めて、魅力的なタイトルを3つ提案し、その後に歌詞を続けてください。"
        },
        {
          role: "user",
          content: lyricsPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    })

    // 英語スタイル指示生成
    const styleCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a master music producer and Suno AI specialist who creates exceptionally expressive and evocative style instructions. You translate musical concepts into vivid, sensory-rich English descriptions that capture the soul and energy of music, going beyond technical specifications to convey the emotional experience and artistic essence that Suno AI needs to recreate authentic musical expressions."
        },
        {
          role: "user",
          content: stylePrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const lyricsResponse = lyricsCompletion.choices[0]?.message?.content || ''
    const styleResponse = styleCompletion.choices[0]?.message?.content || ''

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
    
    console.log('=== タイトル抽出デバッグ ===')
    console.log('生のAI応答（最初の1000文字）:', lyricsResponse.substring(0, 1000))
    console.log('最終タイトル:', titles)
    console.log('タイトル数:', titles.length)

    // 歌詞部分を抽出（タイトル候補以降の部分）
    const lyricsMatch = lyricsResponse.match(/\*\*歌詞（Sunoタグ付き）:\*\*\n([\s\S]+)$/s)
    const lyrics = lyricsMatch ? lyricsMatch[1].trim() : lyricsResponse

    return NextResponse.json({
      titles,
      lyrics,
      styleInstruction: styleResponse.replace(/^["']|["']$/g, '').trim(),
      mode,
      settings: {
        mood,
        musicStyle,
        theme,
        vocal
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