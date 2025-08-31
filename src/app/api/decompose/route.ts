import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { RawAnalysisResult, DecomposedElements, DecomposeApiResponse } from '../../../types/analysis'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { rawAnalysis }: { rawAnalysis: RawAnalysisResult } = await request.json()

    if (!rawAnalysis || !rawAnalysis.rawText) {
      return NextResponse.json(
        { error: '楽曲分析結果が提供されていません' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' },
        { status: 500 }
      )
    }

    console.log('🔧 楽曲分析結果のSUNO要素分解開始:', {
      analysisLength: rawAnalysis.rawText.length,
      confidence: rawAnalysis.confidence,
      sourcesCount: rawAnalysis.webSearchSources.length
    })

    // 🎯 SUNO要素分解用プロンプト
    const decompositionPrompt = `あなたはSUNO AI最適化の専門家です。楽曲分析結果から、SUNO AIで使用する要素に正確に分解してください。

## 入力された楽曲分析結果:
${rawAnalysis.rawText}

## 分解指示（JSON出力必須）:
以下の8つの要素に分解し、必ずJSON形式で出力してください：

{
  "instruments": "楽器構成の英語表記（例: acoustic guitar, drums, bass）",
  "structure": "楽曲構成の英語表記（例: intro → verse → chorus → verse → chorus → bridge → outro）", 
  "rhythm": "リズムの英語表記（例: gentle 4/4 beat, driving rock beat）",
  "tempo": "テンポの英語表記（例: medium tempo (100-110 BPM), slow ballad (70-80 BPM)）",
  "forbidden": "禁止要素の英語表記（例: No heavy distortion, No EDM drops, No comedic tones）",
  "mood": "ムード・雰囲気の英語表記（例: warm and nostalgic, energetic and uplifting）",
  "genre": "ジャンルの英語表記（例: acoustic pop ballad, rock anthem）",
  "vocal": {
    "attribute": "推定ボーカル属性（日本語）",
    "sunoElements": ["推定される3つのSUNO最適化要素（日本語）"]
  }
}

## 重要な変換ルール:
1. **楽器構成**: 具体的な楽器名を英語で、SUNOが理解しやすい表現
2. **楽曲構成**: 矢印（→）を使った流れで表現
3. **テンポ**: BPM範囲を含む自然な英語表現
4. **リズム**: ビートタイプを含む具体的表現
5. **禁止要素**: "No ～" 形式で3つ程度
6. **ムード**: 感情的で具体的な英語形容詞
7. **ジャンル**: SUNOで認識されやすいジャンル名
8. **ボーカル**: 日本語での推定（後でユーザーが調整）

## 分析品質の指針:
- 分析結果の信頼度: ${rawAnalysis.confidence}
- 不明確な場合は一般的で安全な表現を使用
- SUNOでの実用性を最優先に考慮

JSON形式で出力してください：`

    // OpenAI API実行
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "あなたはSUNO AI最適化の専門家です。楽曲分析結果を正確にSUNO用要素に分解し、JSON形式で出力します。技術的精度と実用性を重視してください。"
        },
        {
          role: "user",
          content: decompositionPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    })

    const response = completion.choices[0]?.message?.content || ''
    
    // JSON解析
    let parsedElements: any
    try {
      // JSON部分を抽出（```json ブロックがある場合）
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response
      
      parsedElements = JSON.parse(jsonText)
      console.log('✅ JSON解析成功:', parsedElements)
    } catch (error) {
      console.error('❌ JSON解析失敗:', error)
      console.log('生レスポンス:', response)
      
      // フォールバック: 安全なデフォルト値を生成
      parsedElements = {
        instruments: "guitar, drums, bass",
        structure: "intro → verse → chorus → verse → chorus → outro", 
        rhythm: "steady 4/4 beat",
        tempo: "medium tempo (100-120 BPM)",
        forbidden: "No heavy distortion, No EDM drops, No comedic tones",
        mood: "balanced and expressive",
        genre: "contemporary pop",
        vocal: {
          attribute: "男性（ソロ）",
          sunoElements: ["Clear", "Expressive", "Warm"]
        }
      }
      
      console.log('🔄 フォールバック値を使用:', parsedElements)
    }

    // データ検証とクリーニング
    const decomposedElements: DecomposedElements = {
      instruments: parsedElements.instruments || "guitar, drums, bass",
      structure: parsedElements.structure || "intro → verse → chorus → outro",
      rhythm: parsedElements.rhythm || "steady beat",
      tempo: parsedElements.tempo || "medium tempo",
      forbidden: parsedElements.forbidden || "No EDM drops", 
      mood: parsedElements.mood || "expressive",
      genre: parsedElements.genre || "pop",
      vocal: {
        attribute: parsedElements.vocal?.attribute || "男性（ソロ）",
        sunoElements: parsedElements.vocal?.sunoElements || ["Clear", "Expressive", "Warm"]
      }
    }

    // 品質チェック
    const qualityCheck = {
      hasAllElements: Object.values(decomposedElements).every(val => 
        typeof val === 'string' ? val.length > 0 : val !== null
      ),
      hasJapaneseInEnglish: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(
        `${decomposedElements.instruments} ${decomposedElements.structure} ${decomposedElements.rhythm} ${decomposedElements.tempo} ${decomposedElements.forbidden} ${decomposedElements.mood} ${decomposedElements.genre}`
      ),
      confidence: rawAnalysis.confidence
    }

    console.log('🎯 SUNO要素分解完了:', {
      elementsCount: Object.keys(decomposedElements).length,
      qualityCheck,
      vocalAttribute: decomposedElements.vocal.attribute,
      sunoElements: decomposedElements.vocal.sunoElements
    })

    const apiResponse: DecomposeApiResponse = {
      decomposedElements,
      success: true,
      message: qualityCheck.hasJapaneseInEnglish ? 
        '英語要素に日本語が含まれています。手動確認をお勧めします。' : 
        '正常に分解されました。'
    }

    return NextResponse.json(apiResponse)

  } catch (error) {
    console.error('楽曲要素分解エラー:', error)
    return NextResponse.json(
      { 
        error: '楽曲要素の分解中にエラーが発生しました',
        success: false 
      },
      { status: 500 }
    )
  }
}