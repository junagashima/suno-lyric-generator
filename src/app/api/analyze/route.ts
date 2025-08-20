import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { artist, song } = await request.json()

    if (!artist || !song) {
      return NextResponse.json(
        { error: 'アーティスト名と楽曲名は必須です' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' },
        { status: 500 }
      )
    }

    const prompt = `
楽曲分析を行ってください。以下の楽曲について、音楽的特徴を分析し、Suno AIでの楽曲制作に活用できる形で情報を提供してください。

楽曲: ${song}
アーティスト: ${artist}

以下の項目について詳細に分析してください：

1. 雰囲気・感情（楽曲全体から感じられる感情的な特徴）
   - 切ない、温かい、希望的、メランコリック、エネルギッシュ、穏やか など
   - 複数の感情が混在している場合はその組み合わせも表現

2. 音楽スタイル（ジャンル、楽器編成、音楽的特徴）
   - ジャンル：J-POP、ロック、フォーク、バラード、アコースティック など
   - 楽器編成：アコースティックギター、ピアノ、ストリングス、ドラム など
   - テンポ感：スローバラード、ミドルテンポ、アップテンポ など
   - 音楽的特徴：転調の有無、リズムパターン、印象的な楽器 など

回答は以下の形式でお願いします：
雰囲気・感情: [詳細な説明]
音楽スタイル: [詳細な説明]

※ 実際の楽曲の情報が不明な場合は、一般的に知られている楽曲情報や、アーティストの楽曲傾向から推測して回答してください。
※ J-POPの作詞戦略として、リスナーの共感を呼ぶ要素や、記憶に残りやすい特徴も考慮してください。
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "あなたは音楽分析の専門家です。日本のポピュラー音楽に詳しく、楽曲の感情的特徴と音楽的特徴を正確に分析できます。Suno AIでの楽曲制作に最適化された分析を提供してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const response = completion.choices[0]?.message?.content || ''
    
    // レスポンスから雰囲気・感情と音楽スタイルを抽出
    const moodMatch = response.match(/雰囲気・感情:\s*(.+?)(?=\n音楽スタイル:|$)/s)
    const styleMatch = response.match(/音楽スタイル:\s*(.+?)$/s)

    const mood = moodMatch ? moodMatch[1].trim() : ''
    const style = styleMatch ? styleMatch[1].trim() : ''

    return NextResponse.json({
      mood,
      style,
      fullAnalysis: response
    })

  } catch (error) {
    console.error('楽曲分析エラー:', error)
    return NextResponse.json(
      { error: '楽曲分析中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
