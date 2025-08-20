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
          content: `あなたは音楽分析の専門家です。指定された楽曲を分析し、必ず以下のJSON形式で回答してください：

{
  "mood": "簡潔な感情表現（最大15文字）",
  "style": "ジャンル1, テンポ, 楽器編成"
}

重要な制約：
1. "mood"は必ず15文字以内の短い日本語表現にする
   良い例：切なく温かい、希望に満ちた、メランコリック
   悪い例：切なさと温かさが同居する複雑な感情表現
2. "style"は必ず音楽的な単語をカンマ区切りで3-5個程度
   良い例：J-POP, ミディアムテンポ, アコースティック
   悪い例：J-POPのバラード調でアコースティックギターを中心とした編成
3. 長文での説明は絶対に避ける
4. 必ずJSON形式で返答する

実際の出力例：
{"mood": "切なく美しい", "style": "バラード, スローテンポ, ピアノ, ストリングス"}`
        },
        {
          role: "user",
          content: `「${song}」（${artist}）を分析してください。短く簡潔に。`
        }
      ],
      temperature: 0.5,  // より確実な出力のため温度を下げる
      max_tokens: 150,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content || '{}'
    
    try {
      // JSON形式のレスポンスをパース
      const parsedResponse = JSON.parse(response)
      
      // 雰囲気・感情を15文字以内に制限（強制的に短くする）
      let mood = parsedResponse.mood || '穏やかで優しい'
      
      // 長すぎる場合は最初の15文字に切り詰める
      if (mood.length > 15) {
        // 句読点があれば、そこで切る
        const punctIndex = mood.search(/[、。]/);
        if (punctIndex > 0 && punctIndex <= 15) {
          mood = mood.substring(0, punctIndex);
        } else {
          mood = mood.substring(0, 15);
        }
      }
      
      // 音楽スタイルを確実に単語リスト形式に
      let style = parsedResponse.style || 'J-POP, ミディアムテンポ'
      
      // スタイルが長文になっている場合の処理
      if (style.length > 50) {
        // 最初の50文字で切って、最後のカンマまでにする
        style = style.substring(0, 50);
        const lastComma = style.lastIndexOf(',');
        if (lastComma > 0) {
          style = style.substring(0, lastComma);
        }
      }
      
      console.log('分析結果:', { mood, style });  // デバッグ用ログ

      return NextResponse.json({
        mood,
        style,
        debug: {
          originalMood: parsedResponse.mood,
          originalStyle: parsedResponse.style,
          processed: true
        }
      })
    } catch (parseError) {
      console.error('JSONパースエラー:', parseError);
      // JSONパースに失敗した場合のフォールバック
      return NextResponse.json({
        mood: '穏やかで優しい',
        style: 'J-POP, ミディアムテンポ',
        debug: {
          error: 'JSON parse failed',
          rawResponse: response
        }
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
