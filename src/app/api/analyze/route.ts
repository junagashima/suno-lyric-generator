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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `あなたは音楽分析の専門家です。必ず以下のJSON形式で回答してください：
{
  "mood": "20文字以内の簡潔な感情表現",
  "style": "単語1, 単語2, 単語3, ..."
}
雰囲気・感情は必ず20文字以内で、音楽スタイルは必ず単語のカンマ区切りリストにしてください。`
        },
        {
          role: "user",
          content: `楽曲「${song}」（${artist}）を分析して、JSONで回答してください。`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content || '{}'
    
    try {
      // JSON形式のレスポンスをパース
      const parsedResponse = JSON.parse(response)
      
      // 雰囲気・感情を20文字以内に制限（念のため）
      const mood = parsedResponse.mood ? 
        parsedResponse.mood.substring(0, 20) : 
        '穏やかで優しい雰囲気'
      
      // 音楽スタイルを確実に単語リスト形式に
      const style = parsedResponse.style || 
        'J-POP, ミディアムテンポ, アコースティック'

      return NextResponse.json({
        mood,
        style,
        fullAnalysis: `雰囲気: ${mood}\nスタイル: ${style}`
      })
    } catch (parseError) {
      // JSONパースに失敗した場合のフォールバック
      return NextResponse.json({
        mood: '穏やかで優しい雰囲気',
        style: 'J-POP, ミディアムテンポ, アコースティック',
        fullAnalysis: response
      })
    }

  } catch (error) {
    console.error('楽曲分析エラー:', error)
    return NextResponse.json(
      { error: '楽曲分析中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
