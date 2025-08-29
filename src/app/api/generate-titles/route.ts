import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { mood, musicStyle, theme, content } = await request.json()

    if (!theme || !content) {
      return NextResponse.json(
        { error: 'テーマと内容は必須です' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' },
        { status: 500 }
      )
    }

    const titlePrompt = `
あなたは日本の音楽業界で数々のヒット曲を手がけた天才作詞家・プロデューサーです。楽曲の内容と雰囲気に基づいて、記憶に残る印象的なタイトル候補を3つ提案してください。

## 楽曲情報
- 雰囲気・感情: ${mood}
- 音楽スタイル: ${musicStyle}
- テーマ・使用場面: ${theme}
- 歌詞の内容: ${content}

## タイトル作成戦略
以下の手法を駆使して、多様で魅力的なタイトルを生成してください：

### 1. 言葉遊び・表現技法
- 比喩・メタファー（例：「君は太陽」「心の鍵」）
- 対義語・逆説（例：「悲しい恋人」「静かな叫び」）
- 擬音語・擬態語（例：「ドキドキ」「ふわふわ」）
- カタカナ語の効果的使用（例：「シンデレラ」「エモーション」）

### 2. 感情・心理的表現
- 直接的感情（「愛してる」「さみしい」）
- 間接的表現（「君の影」「風の便り」）
- 時間・季節の暗喩（「桜散る頃」「夏の終わり」）
- 色彩・感覚的表現（「青い記憶」「甘い痛み」）

### 3. J-POPヒット曲の要素
- 共感を呼ぶ普遍的テーマ
- 覚えやすい語呂とリズム感
- 現代的センスと懐かしさの融合
- インパクトのある言葉の組み合わせ

### 4. タイトルバリエーション戦略
**3つのタイトルは異なるアプローチで作成：**
- 1つ目：直感的で感情的なタイトル
- 2つ目：抽象的・詩的なタイトル  
- 3つ目：現代的・キャッチーなタイトル

## 創造性向上指示
- 既存の楽曲タイトルとは違う新鮮な表現を追求
- 予想外の言葉の組み合わせを恐れない
- 楽曲の核心を突く印象的な一言を見つける
- リスナーが「なんだろう？」と興味を持つ要素を含める

## 出力形式
必ず以下のフォーマットで回答してください：

1. タイトル1
2. タイトル2
3. タイトル3

番号と半角ピリオドの後にタイトルのみを出力してください。説明文は不要です。
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "あなたは日本の音楽業界で数々のヒット曲を手がけ、多くのアーティストから信頼される天才作詞家・プロデューサーです。言葉遊び、感情表現、文化的センスを駆使して、記憶に残る印象的なタイトルを作り出すことができます。"
        },
        {
          role: "user",
          content: titlePrompt
        }
      ],
      temperature: 0.9,
      max_tokens: 200
    })

    const response = completion.choices[0]?.message?.content || ''
    console.log('タイトル専用API応答:', response)

    // タイトルを抽出
    const titles: string[] = []
    const lines = response.split('\n')
    
    for (const line of lines) {
      const match = line.match(/^\d+\.\s*(.+)$/)
      if (match && match[1].trim()) {
        titles.push(match[1].trim())
      }
    }

    console.log('抽出されたタイトル:', titles)

    // 3つのタイトルが取得できない場合の創造的フォールバック
    if (titles.length < 3) {
      const creativeFallbacks = {
        恋: ['君という名の奇跡', '約束の朝焼け', 'あの日の約束', '思い出工場', 'さよならの代わりに', '恋の未来地図'],
        卒業: ['旅立ちのプラットホーム', '桜とランドセル', '卒業証書と翼', '新しい世界の扉', '最後のチャイム', 'ありがとうの代わりに'],
        希望: ['光の方程式', '明日へのパスポート', '夢の設計図', '希望という名の武器', '未来工房', '奈落からの集散'],
        切ない: ['雨の日のバラード', '涙の設計図', '心の残像', '悲しみの色', '静かな叫び', '切なさの法則'],
        ありがとう: ['今、伝えたいこと', '感謝状', '君のおかげで', 'ありがとうの歌', '感謝する理由', '大切なものへ'],
        一般: ['物語の始まり', '青春の筆跡', '心のコンパス', '時の旅人', '今日という奇跡', '会いたくて']
      }
      
      let selectedFallbacks = creativeFallbacks.一般
      if (theme.includes('恋') || theme.includes('愛')) selectedFallbacks = creativeFallbacks.恋
      else if (theme.includes('卒業') || theme.includes('別れ')) selectedFallbacks = creativeFallbacks.卒業
      else if (theme.includes('希望') || theme.includes('夢')) selectedFallbacks = creativeFallbacks.希望
      else if (mood.includes('切ない') || mood.includes('悲しい')) selectedFallbacks = creativeFallbacks.切ない
      else if (theme.includes('ありがとう') || theme.includes('感謝')) selectedFallbacks = creativeFallbacks.ありがとう
      
      // ランダムに選択してバリエーションを増やす
      const shuffled = [...selectedFallbacks].sort(() => Math.random() - 0.5)
      
      while (titles.length < 3) {
        const fallback = shuffled[titles.length] || creativeFallbacks.一般[titles.length]
        if (!titles.includes(fallback)) {
          titles.push(fallback)
        }
      }
    }

    return NextResponse.json({
      titles: titles.slice(0, 3) // 確実に3つだけ返す
    })

  } catch (error) {
    console.error('タイトル生成エラー:', error)
    return NextResponse.json(
      { error: 'タイトル生成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}