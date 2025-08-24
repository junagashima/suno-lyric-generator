import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { findMusicData } from './musicDatabase'

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

    // まず楽曲データベースから正確な情報を検索
    const knownMusicData = findMusicData(song, artist)
    
    if (knownMusicData) {
      console.log(`✅ 楽曲データベースからマッチ: ${song} - ${artist}`)
      console.log('データベース情報:', knownMusicData)
      
      // データベース情報から正確な分析結果を生成
      const mood = knownMusicData.mood.join('で') + 'な雰囲気'
      const style = `${knownMusicData.genre}, ${knownMusicData.tempo}, ${knownMusicData.vocal}ボーカル, ${knownMusicData.instruments.join('・')}, ${knownMusicData.era}`
      
      return NextResponse.json({
        mood,
        style,
        debug: {
          source: 'database',
          originalData: knownMusicData,
          confidence: 'high'
        }
      })
    }
    
    console.log(`🔍 AIによる分析を実行: ${song} - ${artist}`)

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",  // 精度向上のためgpt-4oに変更
      messages: [
        {
          role: "system",
          content: `あなたは日本の音楽業界に精通した専門の楽曲分析家です。実在する楽曲について正確で詳細な分析を行います。

## 分析方針
- 楽曲の事実に基づいた正確な情報を提供
- アーティスト・楽曲名から正確な情報を推論
- 憶測ではなく、音楽的特徴の客観的分析を重視
- 特にボーカルの性別・年代は正確に判定

## JSON出力形式（必須）
{
  "mood": "感情・雰囲気（最大80文字）",
  "style": "音楽スタイル詳細（最大200文字）"
}

## 分析要素（必須含有）
**mood**: 楽曲の感情的特徴
- 主要な感情表現（切ない/希望的/ノスタルジック等）
- リスナーに与える心理的印象
- 歌詞やメロディーから感じられる情緒

**style**: 音楽的特徴の詳細
1. **ジャンル**: 正確なジャンル分類
2. **テンポ/BPM**: 推定テンポ
3. **楽器編成**: 主要楽器とアレンジ
4. **ボーカル**: 性別・年代・歌唱スタイル（★重要★）
5. **プロダクション**: 音響的特徴
6. **時代背景**: リリース年代の音楽的特徴

## 精度要件
- ボーカルの性別判定は最重要（男性/女性を明記）
- アーティスト名から正確なボーカル情報を推論
- 楽曲の実際の特徴に基づく分析
- 推測部分は「推定」と明記`
        },
        {
          role: "user",
          content: `楽曲「${song}」by ${artist} を正確に分析してください。

## 分析指示
1. この楽曲の正確な情報を基に分析
2. 特にボーカルの性別は正確に判定
3. 音楽的特徴を具体的に記述
4. JSON形式で回答

楽曲名: ${song}
アーティスト: ${artist}`
        }
      ],
      temperature: 0.2,  // 精度重視で温度をさらに下げる
      max_tokens: 400,   // 詳細分析のためトークン数を増加
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content || '{}'
    
    try {
      // JSON形式のレスポンスをパース
      const parsedResponse = JSON.parse(response)
      
      // 既知楽曲の検証（テスト用）
      const knownSongs = {
        '赤いワインに涙が': { artist: 'ブランデー戦記', vocal: '女性' },
        'マリーゴールド': { artist: 'あいみょん', vocal: '女性' },
        'Pretender': { artist: 'Official髭男dism', vocal: '男性' },
        '白日': { artist: 'King Gnu', vocal: '男性' }
      }
      
      const knownSong = Object.entries(knownSongs).find(([songName, info]) => 
        song.includes(songName) && artist.includes(info.artist)
      )
      
      if (knownSong) {
        const [, songInfo] = knownSong
        console.log(`既知楽曲検出: ${song} - 正解ボーカル: ${songInfo.vocal}`)
        
        // ボーカル性別の検証
        const detectedVocal = parsedResponse.style.includes('女性') ? '女性' : 
                              parsedResponse.style.includes('男性') ? '男性' : '不明'
        
        console.log(`検出されたボーカル: ${detectedVocal}, 正解: ${songInfo.vocal}`)
        
        if (detectedVocal !== songInfo.vocal) {
          console.warn('⚠️ ボーカル性別の分析結果が不正確です！')
        }
      }
      
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
      
      // 分析結果の品質チェック
      const qualityCheck = {
        hasVocalInfo: style.includes('男性') || style.includes('女性') || style.includes('ボーカル'),
        hasGenre: style.match(/(J-POP|ロック|バラード|フォーク|R&B|ソウル|ポップス)/i),
        hasTempo: style.match(/(BPM|テンポ|スロー|ミディアム|アップ)/i),
        hasInstruments: style.match(/(ギター|ピアノ|ドラム|ベース|ストリングス)/i)
      }
      
      console.log('=== 楽曲分析結果 ===');
      console.log(`楽曲: ${song} - ${artist}`);
      console.log('分析結果:', { 
        mood: `${mood} (${mood.length}文字)`, 
        style: `${style} (${style.length}文字)` 
      });
      console.log('品質チェック:', qualityCheck);

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
