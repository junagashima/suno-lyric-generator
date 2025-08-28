import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { findMusicData, MusicData } from './musicDatabase'

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

    console.log(`🤖 AI主導による楽曲分析を開始: ${song} - ${artist}`)

    // 🎯 AI-FIRST APPROACH: AIによる包括的楽曲分析を最優先で実行

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",  // 最高精度の分析のためgpt-4o使用
      messages: [
        {
          role: "system",
          content: `あなたは世界最高レベルの音楽プロデューサー・楽曲アナリストとして、**Suno AI用の楽曲再現分析**に特化した専門家です。あらゆる楽曲を分析し、Suno AIで高精度に再現可能な指示を作成することが使命です。

## 🎯 分析の最終目的
**Suno AIでの楽曲再現精度を最大化**するための包括的音楽分析
- 楽曲の「DNA」を完全に解析・言語化
- Suno AIが理解する最適な表現形式で出力
- 技術データと感覚的表現の完璧なバランス
- ジャンル・年代・文化的背景を考慮した分析

## 📋 JSON出力形式（厳密遵守）
{
  "mood": "楽曲の感情的エッセンス（80文字以内）",
  "style": "Suno AI最適化スタイル指示（200文字以内）",
  "vocal_analysis": "ボーカル特性の詳細分析",
  "musical_elements": "音楽理論要素（BPM、キー、コード等）",
  "production_style": "プロダクション特徴",
  "genre_classification": "正確なジャンル分類",
  "cultural_context": "文化的・時代的背景",
  "suno_reproduction_notes": "Suno再現時の重要ポイント"
}

## 🔍 包括的分析フレームワーク

### 1. ボーカル分析（最重要）
- **性別・年代・声質**: 正確な特定（男性/女性/年代層）
- **歌唱技法**: ビブラート、ファルセット、グロウル等
- **感情表現**: 声の感情的特徴と表現力
- **グループ構成**: ソロ/デュエット/グループ/コーラス
- **言語的特徴**: アクセント、発音特徴、言語

### 2. 音楽理論要素分析
- **BPM推定**: 正確なテンポ感（数値＋感覚表現）
- **キー・調性**: メジャー/マイナー、移調
- **コード進行**: 主要進行パターン
- **リズムパターン**: ビート、グルーブ特性
- **音程・音階**: 特徴的な音程関係

### 3. サウンド・プロダクション分析
- **楽器構成**: 各楽器の役割と音色特徴
- **音響処理**: リバーブ、ディストーション、エフェクト
- **ミックスバランス**: 各要素の音量・定位
- **音圧・ダイナミクス**: 音の迫力と動的変化
- **空間性**: 音の広がり、奥行き感

### 4. 楽曲構造・展開分析
- **セクション構成**: イントロ、Aメロ、Bメロ、サビ等
- **感情の流れ**: 楽曲全体の感情変化
- **クライマックス**: 盛り上がりポイント
- **転調・転拍**: 構造的変化要素

### 5. ジャンル・文化的分析
- **正確なジャンル特定**: サブジャンルまで詳細に
- **時代的特徴**: 制作年代の音楽的傾向
- **文化的背景**: 地域性、社会的コンテクスト
- **影響源・系譜**: 音楽史的位置づけ

## 🎵 Suno AI最適化指針

### Style指示の構成要素
1. **Purpose**: MV style track, about 75 seconds, Japanese lyrics
2. **Mood**: 感情キーワード（3-5語、英語推奨）
3. **Tempo**: 感覚表現 + BPM目安
4. **Instruments**: 具体的楽器構成
5. **Vocals**: 詳細なボーカル特徴
6. **Production**: 音作りの方向性
7. **Forbidden**: 避けるべき要素

### 表現の最適化
- **英語表現優先**: Suno AIの理解度向上
- **感覚的修飾語**: "heavy", "bright", "warm", "driving"
- **具体的楽器名**: "distorted electric guitar", "warm bass"
- **ムード語彙**: "nostalgic", "energetic", "melancholic"
- **技術的制約**: 長すぎる説明は避ける

## ⚡ 重要な分析原則
1. **精度最優先**: 推測より確実な分析
2. **Suno互換性**: Suno AIが理解する表現形式
3. **バランス**: 技術と感覚の調和
4. **文化的配慮**: 楽曲の背景を尊重
5. **再現可能性**: 実際にSunoで再現可能な指示`
        },
        {
          role: "user",
          content: `楽曲「${song}」by ${artist} の**完全音楽分析**を実行してください。

## 🎯 分析ミッション
この楽曲をSuno AIで**高精度再現**するための包括的分析
- あらゆる音楽的要素を詳細分析
- Suno AI最適化されたスタイル指示を生成
- 楽曲の「DNA」を完全に解析・言語化

## 📊 分析対象楽曲
**楽曲名**: ${song}
**アーティスト**: ${artist}

## 🔍 実行する分析項目

### 1. ボーカル完全分析
- 性別・年代・声質の正確な特定
- 歌唱技法・感情表現の詳細分析
- グループ構成（ソロ/デュエット/コーラス等）
- 言語的特徴・アクセント

### 2. 音楽理論要素分析
- BPM推定（感覚表現込み）
- キー・調性・コード進行
- リズムパターン・グルーブ特性
- 特徴的音程・音階要素

### 3. サウンド・プロダクション分析
- 楽器構成と各楽器の役割
- 音響処理・エフェクト使用
- ミックスバランス・音圧特性
- 空間性・音の広がり

### 4. 楽曲構造・感情分析
- セクション構成と展開
- 感情の流れ・クライマックス
- 文化的背景・時代性

### 5. Suno AI再現分析
- 最適なSunoスタイル指示
- 再現時の重要ポイント
- 避けるべき要素の特定

## 📋 出力要件
- **完全JSON形式**で全分析結果を出力
- **Suno AI互換性**を最重視した表現
- **高精度再現**を可能にする詳細レベル
- 楽曲の**本質的特徴**を捉えた分析

この楽曲をSuno AIで再現するために必要な、あらゆる音楽的情報を抽出してください。`
        }
      ],
      temperature: 0.1,  // 最高精度のため温度を最低レベルに
      max_tokens: 1500,   // 包括的分析のため大幅に拡張
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content || '{}'
    
    try {
      // 🤖 AI分析結果をパース
      const aiAnalysis = JSON.parse(response)
      
      console.log(`✅ AI分析完了: ${song} - ${artist}`)
      console.log('AI分析詳細:', {
        vocal: aiAnalysis.vocal_analysis,
        genre: aiAnalysis.genre_classification,
        elements: aiAnalysis.musical_elements
      })
      
      // 🎵 Suno AI用に最適化された指示を構築
      let mood = aiAnalysis.mood || '穏やかで心温まる雰囲気'
      let style = aiAnalysis.style || 'J-POP, medium tempo, acoustic instruments, warm vocals'
      
      // 📏 文字数制限の適用（既存UIとの互換性）
      if (mood.length > 80) {
        const punctIndex = mood.search(/[、。]/);
        if (punctIndex > 0 && punctIndex <= 80) {
          mood = mood.substring(0, punctIndex);
        } else {
          mood = mood.substring(0, 80);
        }
      }
      
      if (style.length > 200) {
        style = style.substring(0, 200);
        const lastPunct = Math.max(
          style.lastIndexOf(','), 
          style.lastIndexOf('、'), 
          style.lastIndexOf('。')
        );
        if (lastPunct > 100) {
          style = style.substring(0, lastPunct);
        }
      }
      
      // 🔍 楽曲構造分析（歌詞生成用）
      const hasRapElements = 
        (aiAnalysis.genre_classification && 
         aiAnalysis.genre_classification.toLowerCase().includes('hip')) ||
        (aiAnalysis.genre_classification && 
         aiAnalysis.genre_classification.includes('ヒップホップ')) ||
        (aiAnalysis.vocal_analysis && 
         aiAnalysis.vocal_analysis.includes('ラップ')) ||
        artist.toLowerCase().includes('dragon ash') ||
        artist.toLowerCase().includes('rip slyme')
      
      // 🎤 ボーカルスタイル分析
      let vocalStyle = '男性'
      if (aiAnalysis.vocal_analysis) {
        if (aiAnalysis.vocal_analysis.includes('女性')) {
          vocalStyle = '女性'
        } else if (aiAnalysis.vocal_analysis.includes('デュエット')) {
          vocalStyle = '男女デュエット'
        } else if (aiAnalysis.vocal_analysis.includes('グループ')) {
          vocalStyle = '男女混合グループ'
        }
      }
      
      // 🔍 AI分析品質の評価
      const analysisQuality = {
        hasVocalAnalysis: Boolean(aiAnalysis.vocal_analysis),
        hasMusicalElements: Boolean(aiAnalysis.musical_elements),
        hasProductionStyle: Boolean(aiAnalysis.production_style),
        hasGenreClassification: Boolean(aiAnalysis.genre_classification),
        hasCulturalContext: Boolean(aiAnalysis.cultural_context),
        hasReproductionNotes: Boolean(aiAnalysis.suno_reproduction_notes)
      }
      
      console.log('=== 🤖 AI楽曲分析完了 ===');
      console.log(`🎵 楽曲: ${song} - ${artist}`);
      console.log(`🎭 感情: ${mood} (${mood.length}文字)`);
      console.log(`🎼 スタイル: ${style} (${style.length}文字)`);
      console.log(`🎤 ボーカル: ${vocalStyle}`);
      console.log(`🎸 ジャンル: ${aiAnalysis.genre_classification || '不明'}`);
      console.log(`🔍 分析品質:`, analysisQuality);
      console.log(`🎯 ラップ要素: ${hasRapElements ? 'あり' : 'なし'}`);

      // 🎯 既存UIとの互換性を保った結果を返す
      return NextResponse.json({
        mood,
        style,
        // 🎵 歌詞生成用の構造情報
        structure: {
          hasRap: hasRapElements,
          vocalStyle: vocalStyle,
          genre: aiAnalysis.genre_classification || 'J-POP'
        },
        // 🔬 デバッグ・詳細情報
        debug: {
          source: 'ai_analysis',
          confidence: 'high',
          aiAnalysis: {
            vocal_analysis: aiAnalysis.vocal_analysis,
            musical_elements: aiAnalysis.musical_elements,
            production_style: aiAnalysis.production_style,
            genre_classification: aiAnalysis.genre_classification,
            cultural_context: aiAnalysis.cultural_context,
            suno_reproduction_notes: aiAnalysis.suno_reproduction_notes
          },
          analysisQuality,
          processedAt: new Date().toISOString()
        }
      })
    } catch (parseError) {
      console.error('❌ AI分析JSONパースエラー:', parseError);
      console.log('📄 生レスポンス:', response);
      
      // 🔄 フォールバック: データベース検索を試行（変数は上位スコープから取得）
      const fallbackData = findMusicData(song, artist);
      
      if (fallbackData) {
        console.log('🔄 データベースフォールバックを使用');
        return NextResponse.json({
          mood: fallbackData.mood.join('で') + 'な雰囲気',
          style: `Purpose: MV style track, about 75 seconds, Japanese lyrics. Mood: ${fallbackData.mood.slice(0, 3).join(', ')}. Instruments: ${fallbackData.instruments.join(' + ')}. Vocals: ${fallbackData.vocal}.`,
          structure: {
            hasRap: fallbackData.genre.includes('ヒップホップ'),
            vocalStyle: fallbackData.vocal,
            genre: fallbackData.genre
          },
          debug: {
            source: 'database_fallback',
            confidence: 'medium',
            error: 'AI analysis parse failed, used database fallback'
          }
        });
      }
      
      // 🆘 最終フォールバック
      return NextResponse.json({
        mood: '穏やかで心地よい雰囲気',
        style: 'J-POP, medium tempo, acoustic guitar + piano + drums, warm male vocals, natural production',
        structure: {
          hasRap: false,
          vocalStyle: '男性',
          genre: 'J-POP'
        },
        debug: {
          source: 'emergency_fallback',
          confidence: 'low',
          error: 'Both AI analysis and database lookup failed',
          rawResponse: response.substring(0, 500)
        }
      })
    }

  } catch (error) {
    console.error('❌ AI楽曲分析システムエラー:', error)
    
    return NextResponse.json(
      { 
        error: 'AI楽曲分析システムでエラーが発生しました。しばらく後に再試行してください。',
        mood: '穏やかな雰囲気',
        style: 'J-POP, medium tempo, acoustic instruments, expressive vocals',
        structure: {
          hasRap: false,
          vocalStyle: '男性',
          genre: 'J-POP'
        },
        debug: {
          source: 'error_fallback',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
}
