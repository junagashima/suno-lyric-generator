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
          content: `あなたは音楽分析の専門家です。指定された楽曲を詳細に分析し、必ず以下のJSON形式で回答してください：

{
  "mood": "感情・雰囲気の詳細表現（最大80文字）",
  "style": "詳細な音楽スタイル分析（最大200文字）"
}

重要な分析要件：
1. **mood（雰囲気・感情）**: 80文字以内で具体的かつ詳細に
   - 感情の層や変化を表現
   - リスナーに与える印象
   - 楽曲全体の情緒的な特徴
   
2. **style（音楽スタイル）**: 200文字以内で詳細に分析
   - メインジャンル・サブジャンル
   - BPM・テンポ感
   - 主要楽器・編成
   - 音響的特徴・プロダクション
   - 楽曲構成・アレンジの特徴
   - ボーカルスタイル・歌唱の特徴

分析精度要件：
- 楽曲の核となるジャンル分類を明確にする
- 具体的な楽器名・音色を含める
- テンポやリズムパターンを詳述
- 現代的なプロダクション要素も考慮
- 該当楽曲特有の音楽的特徴を抽出

出力例：
{"mood": "切なさと温かさが共存し、青春の終わりと新たな始まりへの複雑な感情を描いた、ノスタルジックで希望に満ちた雰囲気", "style": "アコースティック・J-POPバラード, 85-90BPM, フィンガーピッキングギター主体, ピアノ・ストリングス・軽いパーカッション, オーガニックで自然なプロダクション, サビでの壮大な展開, 透明感のある女性ボーカル"}`
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
      
      // 雰囲気・感情を80文字以内に制限（適度に詳細を保持）
      let mood = parsedResponse.mood || '穏やかで優しい雰囲気'
      
      // 長すぎる場合は最初の80文字に切り詰める
      if (mood.length > 80) {
        // 句読点があれば、そこで切る
        const punctIndex = mood.search(/[、。]/);
        if (punctIndex > 0 && punctIndex <= 80) {
          mood = mood.substring(0, punctIndex);
        } else {
          mood = mood.substring(0, 80);
        }
      }
      
      // 音楽スタイルを200文字以内に制限（詳細分析を保持）
      let style = parsedResponse.style || 'J-POP, ミディアムテンポ, アコースティック'
      
      // スタイルが長文になっている場合の処理
      if (style.length > 200) {
        // 最初の200文字で切って、最後のカンマまたは句点まで適切に処理
        style = style.substring(0, 200);
        const lastPunct = Math.max(style.lastIndexOf(','), style.lastIndexOf('、'), style.lastIndexOf('。'));
        if (lastPunct > 100) { // ある程度の長さを確保
          style = style.substring(0, lastPunct);
        }
      }
      
      console.log('詳細分析結果:', { 
        mood: `${mood} (${mood.length}文字)`, 
        style: `${style} (${style.length}文字)` 
      });  // デバッグ用ログ

      return NextResponse.json({
        mood,
        style,
        debug: {
          originalMood: parsedResponse.mood,
          originalStyle: parsedResponse.style,
          moodLength: mood.length,
          styleLength: style.length,
          processed: true
        }
      })
    } catch (parseError) {
      console.error('JSONパースエラー:', parseError);
      // JSONパースに失敗した場合のフォールバック
      return NextResponse.json({
        mood: '穏やかで優しい雰囲気',
        style: 'J-POP, ミディアムテンポ, アコースティック, ピアノ, 自然なプロダクション',
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
