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
  contentReflection?: 'literal' | 'metaphorical' | 'balanced' // Step D: 安全に追加（オプショナル）
  songLength: string
  vocal: VocalSettings
  // ユーザー明示的ラップ選択（安全追加）
  includeRap?: boolean
  // Step I: 楽曲構造情報を受け取る
  analyzedStructure?: {
    hasRap: boolean
    vocalStyle: string
    genre: string
    isDragonAshStyle?: boolean
  }
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
      includeRap = false, // 安全なデフォルト値
      analyzedStructure // Step I: 楽曲構造情報
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

## Step E: 内容反映方法（${contentReflection}）
${contentReflection === 'literal' ? 
  '- **専門用語・固有名詞・数字をそのまま歌詞に使用**してください\n- **具体的な内容を抽象化せず**、リズムに合わせて自然に歌詞化\n- **「スプデブ」「1-2ヶ月」等のキーワードを必ず含める**' :
contentReflection === 'metaphorical' ?
  '- **内容を詩的・象徴的に表現**し、直接的な専門用語は避ける\n- **比喩やメタファーを活用**して内容の本質を美しく表現\n- **抽象的な言葉で核心メッセージを伝達**' :
  '- **重要なキーワードは忠実に保持**、説明部分は詩的に表現\n- **専門用語の一部は残し**、周辺内容は美化して表現\n- **技術性と詩的表現のバランス**を取る'
}

## 作詞要件
以下の要素を考慮してJ-POPヒット曲として成功する歌詞を作成してください：

1. **J-POPヒット曲の作詞戦略**
   - リスナーの記憶に残りやすい表現
   - 感情に訴えかける言葉選び
   - 共感を呼ぶ普遍的テーマの表現
   - シンプルでキャッチーな言葉の使用
   - 現代のJ-POPトレンドを反映した語彙選択

2. **Suno AIタグの効果的活用**
   - 楽曲構成タグ: [Intro], [Verse], [Pre-Chorus], [Chorus], [Bridge], [Outro]${analyzedStructure?.hasRap ? ', [Rap Verse]' : ''}
   - 演出タグ: [Fade in], [Fade out], [Instrumental Break]
   - ボーカル指示タグ: [Vocal harmony], [Ad libs], [Whispered], [Belted]
   - 楽器指示タグ: [Piano solo], [Guitar riff], [String section]

3. **楽曲構成**
   ${songLength === '2-3分' ? '短めの楽曲構成（Intro-Verse-Chorus-Verse-Chorus-Outro）' :
     songLength === '3-4分' ? '標準的な楽曲構成（Intro-Verse-Pre-Chorus-Chorus-Verse-Pre-Chorus-Chorus-Bridge-Chorus-Outro）' :
     songLength === '4-5分' ? '充実した楽曲構成（複数のセクション、Cメロ、間奏を含む）' :
     '長い楽曲構成（複数の展開、インストゥルメンタル部分を含む）'}

## Step I: ラップセクション対応
${analyzedStructure?.hasRap ? `
   **🔥 この楽曲にはRAP要素が検出されました 🔥**
   - ジャンル: ${analyzedStructure.genre}
   - ボーカルスタイル: ${analyzedStructure.vocalStyle}
   - **[Rap Verse]タグを使用してラップセクションを明確に配置**
   - **ラップ部分は韻を踏んだリズミカルな歌詞構成を使用**
   - **歌い部分（メロディー）とラップ部分を明確に区別**
   - **楽曲構成例**: Intro → Verse(歌) → Pre-Chorus → Chorus → Rap Verse → Chorus → Bridge → Chorus → Outro
` : `
   - この楽曲は通常の歌唱スタイルで構成します
   - メロディー重視の楽曲構成を使用
`}

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
Suno AIで楽曲を生成するための最適化された英語スタイル指示を作成してください。ChatGPT実証済みの「核10項目」ベストプラクティスに基づいて、一筆書き設計図スタイルで簡潔に指示します。

## 核10項目マッピング（一筆書き設計図用）
1. **Purpose（用途）**: ${theme}をテーマとした楽曲
2. **Length（長さ）**: ${songLength}
3. **Language（言語）**: 日本語歌詞
4. **Vocals（ボーカル）**: ${vocal.gender}、${vocal.age}、${vocal.nationality}
5. **Tempo（テンポ帯）**: ${musicStyle}から抽出
6. **Rhythm（リズム質感）**: 楽曲スタイルに応じて設定
7. **Instruments（楽器）**: ${musicStyle}から主要楽器を抽出
8. **Structure（構成）**: ${songLength}に応じた構成
9. **Mood（感情3語）**: ${mood}から3つまでに絞る
10. **Forbidden（禁止要素）**: ジャンルに応じて設定

## 追加情報
- 歌唱技法: ${vocal.techniques.join(', ')}
- 詳細スタイル: ${musicStyle}

## Suno AI最適化指示作成方針

### 1. 核10項目による一筆書き設計図作成
- **Purpose指定**: "BGM for meeting", "MV style track", "Opening theme"
- **Length明記**: "about 75 seconds", "30-35 seconds"  
- **Language明記**: "Japanese lyrics", "instrumental only"
- **禁止要素必須**: "No rap", "No EDM drops", "No comedic tones"
- **楽器は3-4個**: "guitar + bass + drums + synth pad"
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
"Purpose: Opening theme style, 60-70 seconds, Japanese lyrics. Mood: tension, chaos, release. Tempo: medium-fast, driving beat. Instruments: heavy distorted guitar riffs + rumbling bass + sharp snare + low ominous synth. Vocals: male, calm in verse, explosive in chorus. Forbidden: EDM drops, bright brass, comic sound effects."

## 厳守必須フォーマット（ChatGPT実証済み）：

**必ず以下の構造で出力:**
"Purpose: [MV style track/BGM/Opening theme], about [X seconds], [Japanese lyrics/instrumental]. 
Mood: [感情語3つまで]. 
Tempo: [medium/slow/fast], [具体的リズム記述]. 
Instruments: [楽器名] + [楽器名] + [楽器名]. [追加楽器指定]. 
Structure: [intro] → [verse] → [chorus] → [closing]. 
Vocals: [性別] voice, [表情], [技法]. 
Forbidden: [禁止要素], [禁止要素], [禁止要素]."

**絶対に使用禁止の表現:**
- "musical journey", "soundscape", "emotional depth"
- "evoke", "infuse", "embrace", "heighten" 
- 長い形容詞句や詩的描写

## 🚫 絶対禁止表現リスト：
- "musical journey", "soundscape", "evoke", "infuse", "embrace"
- "emotional depth", "introspective", "poignant essence"  
- "solitary evening walk", "echoes with memories"
- キー名（F minor等）、BPM数値、音域指定

## ⚡ 出力命令（必須遵守）：
必ず「Purpose: 」で始まり、「Forbidden: 」で終わる構造化された指示のみ出力せよ。
詩的表現・比喩・長い修飾句は一切使用するな。
楽器名と禁止要素を具体的に明記せよ。
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
          content: "You are a Suno AI optimization specialist who creates precise, structured style instructions following proven ChatGPT best practices. You MUST use the exact 'Core 10 Items' format with concrete specifications, avoiding all poetic language. Your instructions are technical blueprints, not artistic descriptions. Focus on what Suno AI needs to know: Purpose, Length, Language, specific instrument names, structure, and forbidden elements."
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