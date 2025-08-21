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
楽曲のタイトル候補を3つ提案してください。

## 楽曲情報
- 雰囲気・感情: ${mood}
- 音楽スタイル: ${musicStyle}
- テーマ・使用場面: ${theme}
- 歌詞の内容: ${content}

## タイトル作成要件
- 日本語で魅力的なタイトルを3つ
- 楽曲の内容と雰囲気を反映
- キャッチーで覚えやすい
- J-POPのトレンドに合致

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
          content: "あなたは日本のヒット曲のタイトルを数多く手がけたプロの作詞家です。楽曲の内容と雰囲気にぴったり合った、魅力的で印象的なタイトルを提案できます。"
        },
        {
          role: "user",
          content: titlePrompt
        }
      ],
      temperature: 0.8,
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

    // 3つのタイトルが取得できない場合のフォールバック
    if (titles.length < 3) {
      const fallbackTitles = [
        theme.includes('恋') ? '君への想い' : theme.includes('卒業') ? '旅立ちの日に' : '新しい始まり',
        mood.includes('切ない') ? '心の調べ' : mood.includes('希望') ? '明日への扉' : '今日という日',
        '大切なもの'
      ]
      
      while (titles.length < 3) {
        titles.push(fallbackTitles[titles.length])
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