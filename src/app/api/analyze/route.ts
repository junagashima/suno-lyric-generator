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
      
      // データベース情報から表現豊かな分析結果を生成
      const mood = `${knownMusicData.mood.join('で')}な雰囲気。${knownMusicData.structure ? 'セクション間の感情変化により' + knownMusicData.mood[0] + 'から解放への流れを表現' : ''}`
      
      // グループボーカル設定の詳細な表現
      let vocalDescription: string = knownMusicData.vocal
      if (knownMusicData.vocalDetails) {
        vocalDescription = `${knownMusicData.vocal}（${knownMusicData.vocalDetails}）`
      } else {
        // グループボーカルの場合、詳細説明を追加
        switch (knownMusicData.vocal) {
          case '男女混合グループ':
            vocalDescription = '男女混合グループ（メイン・ハーモニー・コーラスワークの多層構成）'
            break
          case '女性グループ':
            vocalDescription = '女性グループ（複数ボーカルによる美しいハーモニー）'
            break
          case '男性グループ':
            vocalDescription = '男性グループ（重厚なグループコーラスと力強い歌唱）'
            break
          case '男女デュエット':
            vocalDescription = '男女デュエット（対話的な歌唱とハーモニー）'
            break
          case '女性デュエット':
            vocalDescription = '女性デュエット（美しい二重唱とコーラスワーク）'
            break
          case '男性デュエット':
            vocalDescription = '男性デュエット（重厚なハーモニーと対話的表現）'
            break
          case 'コーラス重視':
            vocalDescription = 'コーラス重視（重層的な多声部構成）'
            break
        }
      }
      
      // ChatGPT形式の構造化指示を生成
      const purpose = "MV style track"
      const length = "about 75 seconds"
      const language = "Japanese lyrics"
      
      // テンポ表現（BPM数値は避ける）
      let tempoDesc = "medium"
      if (knownMusicData.bpm) {
        tempoDesc = knownMusicData.bpm >= 130 ? "fast" : 
                   knownMusicData.bpm >= 100 ? "medium-fast" : "slow"
      }
      
      // 感情語（3つまで）
      const moodWords = knownMusicData.mood.slice(0, 3).join(', ')
      
      // 楽器（具体的に）
      const instruments = knownMusicData.instruments.length > 0 ? 
        knownMusicData.instruments.join(' + ') : "guitar + bass + drums"
      
      // 禁止要素（ジャンルに応じて）
      let forbiddenElements = "comedic tones, heavy EDM, fast tempo changes"
      if (knownMusicData.genre.includes('バラード')) {
        forbiddenElements = "heavy distortion, fast tempo, aggressive drums"
      } else if (knownMusicData.genre.includes('ロック')) {
        forbiddenElements = "comedic tones, light instrumentation, swing rhythm"
      }
      
      style = `Purpose: ${purpose}, ${length}, ${language}. Mood: ${moodWords}. Tempo: ${tempoDesc}, ${knownMusicData.tempo}. Instruments: ${instruments}. Vocals: ${vocalDescription}. Forbidden: ${forbiddenElements}.`
      
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
          content: `あなたは音楽プロデューサー兼作詞・作曲家として、Suno AI用の楽曲分析に特化した専門家です。技術的データより「音楽的表現力・雰囲気・感情」を重視し、Suno AIが理解しやすい表現で分析します。

## 分析の目的
- **Suno AIでの楽曲再現**のためのスタイル指示作成
- 技術データより「音の質感・雰囲気・感情の動き」を優先
- 聴き手の感覚に訴える表現を用いた分析
- 楽曲の「魂」や「エネルギー」を言語化

## JSON出力形式（必須）
{
  "mood": "感情・雰囲気の詳細表現（最大100文字）",
  "style": "Suno AI向け音楽的特徴（最大250文字）"
}

## 分析アプローチ（Suno AI最適化）

**mood**: 楽曲の感情的エッセンス
- 聴き手の心に与える**直接的な感情体験**
- 楽曲の**エネルギーの流れ**（静→動、緊張→解放等）
- **比喩的表現**を用いた雰囲気の描写
- 楽曲が描く**情景・シーン**の表現

**style**: Suno AIが理解する音楽的特徴
1. **サウンドの質感**: 音の重厚さ、軽やかさ、ダークさ、明るさ
2. **楽器の役割と効果**: 各楽器が楽曲に与える印象・役割
3. **ボーカルの表現力**: 歌唱の感情的特徴、技法の効果
4. **リズムの特性**: グルーブ感、疾走感、重厚感等
5. **音響的印象**: 空間の広がり、密度、音圧の特徴
6. **楽曲の展開**: セクション間の感情の変化、構成の効果
7. **プロダクションの特色**: 音作りの方向性、現代性

## 重要な表現方針
- **感覚的表現を重視**: 「120BPM」→「疾走感のある中高速テンポ」
- **比喩・イメージを活用**: 「真夜中のビル街で踊るような」
- **動的な表現**: 「静から動へ」「緊張から解放へ」
- **質感の描写**: 「ヘビーで歪んだ」「クリアで透明感のある」
- **Suno AIが理解する英語表現につながる分析**`
        },
        {
          role: "user",
          content: `楽曲「${song}」by ${artist} を、**Suno AI用スタイル指示作成**の観点で分析してください。

## 分析の目的
この楽曲をSuno AIで再現・参考にするためのスタイル指示を作成したい

## 分析指示（感覚・表現重視）
1. **音の質感・雰囲気を言語化**
   - 「この楽曲を聴いた時の感覚」を具体的に表現
   - 比喩やイメージを使った印象的な描写

2. **楽曲の感情的な流れ**
   - イントロからアウトロまでの「感情の動き」
   - 静と動、緊張と解放の変化

3. **サウンドの特徴を感覚で表現**
   - 「ヘビーで歪んだ」「クリアで透明感のある」等
   - 楽器の「役割と印象」（数値より感覚）

4. **ボーカルの表現力・感情**
   - 歌唱の「感情的特徴」と「表現技法の効果」
   - 性別・年代は正確に

## 分析対象楽曲
- 楽曲: ${song}
- アーティスト: ${artist}

## 出力要件
- Suno AIが理解できる「英語表現」につながる日本語分析
- 技術データより「聴覚的印象・感情体験」を重視
- 楽曲の「魂・エッセンス」を捉えた表現`
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
      
      // 分析結果の品質チェック（音楽理論要素を含む）
      const qualityCheck = {
        hasVocalInfo: style.includes('男性') || style.includes('女性') || style.includes('ボーカル'),
        hasGenre: style.match(/(J-POP|ロック|バラード|フォーク|R&B|ソウル|ポップス)/i),
        hasTempo: style.match(/(BPM|テンポ|スロー|ミディアム|アップ)/i),
        hasInstruments: style.match(/(ギター|ピアノ|ドラム|ベース|ストリングス)/i),
        hasBPM: style.match(/\d+\s*BPM/i),
        hasKey: style.match(/(キー|[A-G][#♭]?|メジャー|マイナー|長調|短調)/i),
        hasChords: style.match(/(コード|[A-G][#♭]?m?[0-9]?)/i),
        hasMusicalFeatures: style.match(/(音程|音階|リズム|和声|メロディー)/i)
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
