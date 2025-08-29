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

    // 🔧 汎用音色除去用配列（不明確・汎用的な楽器名のみ対象）
    const unwantedInstruments = [
      // pad系楽器（汎用的で不明確な音色）
      'synth pad', 'synthpad', 'シンセパッド', 'シンセ パッド',
      'pad synth', 'atmospheric pad', 'ambient pad', 'soft pad',
      'background pad', 'string pad', 'warm pad', 'lush pad',
      // 汎用synth系（具体性のない電子音色指示）
      'synth', 'シンセ', 'dark synth', 'minimal synth', 'lead synth', 'bass synth',
      // 汎用的すぎる楽器名
      'electronic sounds', 'synthetic sounds', 'digital sounds'
    ];

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
      
      // 楽器（具体的に）- synth pad除去処理付き
      let instrumentsRaw = knownMusicData.instruments.length > 0 ? 
        knownMusicData.instruments.join(' + ') : "guitar + bass + drums"
      
      // データベース楽器構成からもsynth pad除去
      
      const instrumentsOriginalDB = instrumentsRaw;
      unwantedInstruments.forEach(unwanted => {
        const regex = new RegExp(unwanted.replace(/\s+/g, '\\s*'), 'gi');
        instrumentsRaw = instrumentsRaw.replace(regex, '');
        instrumentsRaw = instrumentsRaw.replace(/\s*\+\s*\+/g, ' + ').replace(/^\s*\+\s*|\s*\+\s*$/g, '').trim();
      });
      
      console.log('🔧 データベース楽器除去処理:', {
        original: instrumentsOriginalDB,
        processed: instrumentsRaw,
        removedUnwanted: instrumentsOriginalDB !== instrumentsRaw
      });
      
      const instruments = instrumentsRaw || "guitar + bass + drums"
      
      // 禁止要素（ジャンルに応じて）
      let forbiddenElements = "comedic tones, heavy EDM, fast tempo changes"
      if (knownMusicData.genre.includes('バラード')) {
        forbiddenElements = "heavy distortion, fast tempo, aggressive drums"
      } else if (knownMusicData.genre.includes('ロック')) {
        forbiddenElements = "comedic tones, light instrumentation, swing rhythm"
      }
      
      let style = `Purpose: ${purpose}, ${length}, ${language}. Mood: ${moodWords}. Tempo: ${tempoDesc}, ${knownMusicData.tempo}. Vocals: ${vocalDescription}. Forbidden: ${forbiddenElements}.`
      
      // Step G: 歌詞構成用の構造情報を追加
      const hasRapElements = knownMusicData.genre.includes('ヒップホップ') || 
                           knownMusicData.artist.includes('Dragon Ash') ||
                           knownMusicData.artist.includes('RIP SLYME')
      
      // 🔍 データベース処理でのsynth pad検査
      console.log('=== データベース処理 Synth Pad検査 ===');
      const dbSynthPadCheck = {
        moodHasSynthPad: /synth\s*pad/i.test(mood),
        styleHasSynthPad: /synth\s*pad/i.test(style),
        instrumentsHasSynthPad: /synth\s*pad/i.test(instruments)
      };
      console.log('データベース Synth pad検査:', dbSynthPadCheck);
      
      if (dbSynthPadCheck.moodHasSynthPad || dbSynthPadCheck.styleHasSynthPad || dbSynthPadCheck.instrumentsHasSynthPad) {
        console.log('⚠️ データベース警告: synth padが残っています！', {
          mood, style, instruments
        });
      } else {
        console.log('✅ データベース処理: synth pad除去完了');
      }
      
      return NextResponse.json({
        mood,
        style,
        // 新4要素をデータベース処理でも提供
        tempo: knownMusicData.tempo || "medium/steady (85-100 BPM)",
        rhythm: "steady 4/4 beat", // データベースには詳細リズムがないためデフォルト
        instruments: instruments,
        forbidden: "No comedic tones, No inappropriate instruments",
        // Step G: 安全に構造情報を追加
        structure: {
          hasRap: hasRapElements,
          vocalStyle: knownMusicData.vocal,
          genre: knownMusicData.genre
        },
        debug: {
          source: 'database',
          originalData: knownMusicData,
          confidence: 'high',
          synthPadRemoved: true
        }
      })
    }
    
    console.log(`🔍 AIによる分析を実行: ${song} - ${artist}`)

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",  // 精度向上のためgpt-4oに変更
      messages: [
        {
          role: "system",
          content: `🎯【最重要】styleフィールド制限：
styleフィールドでは「Purpose:」「Instruments:」等の形式は絶対に禁止です。
- styleフィールド：「ジャンル名、プロダクション手法」のみの短い記述
- 例：「エネルギッシュなロック、ドライビングなプロダクション」
- 禁止：Purpose、Instruments、Structure、Vocals、Forbidden等のあらゆる構造化記述

あなたは音楽プロデューサー兼作詞・作曲家として、Suno AI用の楽曲分析に特化した専門家です。技術的データより「音楽的表現力・雰囲気・感情」を重視し、Suno AIが理解しやすい表現で分析します。

## 分析の目的
- **Suno AIでの楽曲再現**のためのスタイル指示作成
- 技術データより「音の質感・雰囲気・感情の動き」を優先
- 聴き手の感覚に訴える表現を用いた分析
- 楽曲の「魂」や「エネルギー」を言語化

## JSON出力形式（必須）- Suno AI 4要素構造
{
  "mood": "感情・雰囲気の詳細表現（最大100文字）",
  "tempo": "Sunoテンポ指示: slow/relaxed (BPM帯) 形式（必須）",
  "rhythm": "Sunoリズム指示: ビートタイプ + 質感表現（必須）",
  "instruments": "Suno楽器指示: 具体的な楽器役割と質感（必須）",
  "forbidden": "Suno禁止要素: No EDM drops等の不要要素（必須）",
  "style": "総合的な音楽スタイル補足（オプション・最大150文字）"
}

## 分析アプローチ（Suno AI最適化）

**mood**: 楽曲の感情的エッセンス
- 聴き手の心に与える**直接的な感情体験**
- 楽曲の**エネルギーの流れ**（静→動、緊張→解放等）
- **比喩的表現**を用いた雰囲気の描写
- 楽曲が描く**情景・シーン**の表現

**新4要素構造の分析指示**:

**tempo**: Sunoテンポ指示（必須独立出力）
- 必ず「形容詞 (BPM帯)」形式: slow/relaxed (65-80 BPM)
- バラード系: slow/relaxed | ミッドテンポ: medium/steady | 活発系: medium-fast/upbeat | 疾走系: fast/driving
- 楽曲の実際の時間感覚を正確に判定（全ジャンル対応）

**rhythm**: Sunoリズム指示（必須独立出力） 
- ビートタイプ: steady 4/4 beat | swing 4/4 | syncopated groove | head-nod groove | driving rock beat | laid-back groove
- 楽曲のグルーブ感を的確に表現（全音楽スタイル対応）

**instruments**: Suno楽器指示（必須独立出力）
- 形式: "primary instruments + quality descriptors" 
- 例: "tight kick, sharp snare, steady hi-hat, melodic guitar"
- 🎯【分析原則】楽曲に実際に使用されている楽器構成のみを正確に記述
- ※推測による楽器追加や削除は禁止
- ⚠️【注意】「synth pad」のような汎用パッド音色は避け、より具体的な楽器名を使用
- ✅【推奨】: electric guitar, bass guitar, drum kit, piano, strings, brass, synthesizer（実際に使用されている場合）
- 🔄【品質重視】汎用的でなく、楽曲の特徴を表す具体的な楽器名と質感描写

**forbidden**: Suno禁止要素（必須独立出力）
- ジャンル混合防止: "No EDM drops", "No comedic tones", "No swing"等
- 楽曲スタイルに不適切な要素を明確に排除
- 必須追加: "No ambient pads" - あらゆるパッド音色の使用を禁止

**style**: ジャンル・雰囲気のみ（オプション）
- 🚫【絶対禁止】以下は一切含めない：
  - 楽器名（guitar, bass, drums, piano, synth等）
  - Purpose、Instruments、Structure、Vocals等の構造化記述
  - 「Purpose:」「Instruments:」「Structure:」等の形式
- ✅【記述内容のみ】ジャンル名、雰囲気・感情、プロダクション手法のみ
- ✅【例】「エネルギッシュなロック、ドライビングなプロダクション」

## 重要な表現方針（全楽曲対応）
- **Sunoネイティブテンポ表現**: 必ず「形容詞 (BPM帯)」で出力
  - 例: "medium-fast (100-110 BPM)" 「単体BPM数値は絶対禁止」
  - バラード系="slow/relaxed (70-80 BPM)" | ポップス="medium-fast (100-120 BPM)"
- **Sunoネイティブリズム表現**: ビートタイプで指定
  - "steady 4/4 beat" | "swing 4/4" | "syncopated groove" | "head-nod groove"等
- **禁止要素の明示**: "No EDM drops", "No comedic tones"等を必ず追加
- **全ジャンル対応**: J-POP、ロック、バラード、ヒップホップ、アニソン等に幅広く対応
- **感覚的表現を重視**: 「120BPM」→「疾走感のある中高速テンポ」
- **比喩・イメージを活用**: 「真夜中のビル街で踊るような」
- **動的な表現**: 「静から動へ」「緊張から解放へ」
- **質感の描写**: 「ヘビーで歪んだ」「クリアで透明感のある」
- **Suno AIネイティブな英語表現で直接指示**
- **重要**: styleフィールドに楽器名を含めない（instrumentsフィールドのみに記述）

## 🎯【Suno AI特化】分析精度ルール
1. 楽曲の実際の楽器構成を正確に分析・反映する
2. instrumentsフィールドとstyleフィールドで一貫した楽器構成を保つ
3. 汎用的な「synth pad」「atmospheric pad」等は避け、具体的楽器名を使用
4. 推測による楽器追加や削除は行わない
5. Suno AIが理解しやすい具体的で明確な楽器指示を優先`
        },
        {
          role: "user",
          content: `🎯【重要】styleフィールド出力制限：
styleフィールドでは「Purpose:」「Instruments:」等の形式を絶対に使用しないでください。
- styleフィールド：ジャンル名とプロダクション手法のみの簡潔な記述
- 楽器情報は全てinstrumentsフィールドに記述する
- 構造化された長文形式は禁止

楽曲「${song}」by ${artist} を、**Suno AI用スタイル指示作成**の観点で分析してください。

## 分析の目的
この楽曲をSuno AIで再現・参考にするためのスタイル指示を作成したい

## 分析指示（感覚・表現重視）
1. **テンポ・リズムの正確な分析（最重要）**
   - 楽曲の「実際の速度感」を慎重に判定
   - 「ゆったり」「穏やか」「活発」の正確な区別
   - リズムパターン: 「流らか」「重厚」「軽やか」「跳ねる」等
   - Dragon Ashの「Graceful Days」等は「ゆったりとしたバラード系」

2. **音の質感・雰囲気を言語化**
   - 「この楽曲を聴いた時の感覚」を具体的に表現
   - 比喩やイメージを使った印象的な描写

3. **楽曲の感情的な流れ**
   - イントロからアウトロまでの「感情の動き」
   - 静と動、緊張と解放の変化

4. **楽器構成と音の特徴（重要）**
   - 🎯【分析原則】楽曲に実際に使用されている楽器のみを正確に特定
   - 🎯【禁止行為】推測による楽器追加、汎用的すぎる楽器名の使用
   - ✅【具体的分析】electric guitar, acoustic guitar, bass guitar, drum kit, piano, strings, brass, vocals等の具体的楽器名
   - ⚠️【注意事項】「synth pad」のような汎用パッド音色は避け、具体的な楽器名を優先
   - 「ヘビーで歪んだ」「クリアで透明感のある」等の質感表現
   - 楽器の「役割と印象」（数値より感覚）

5. **フィールド分離の重要ルール**
   - 🎯【instruments】：楽器構成のみを記述
   - 🎯【style】：ジャンル・雰囲気・プロダクションのみ（楽器名は一切含めない）

6. **ボーカルの表現力・感情**
   - 歌唱の「感情的特徴」と「表現技法の効果」
   - 性別・年代は正確に

## 全ジャンル対応テンポ分析指針
- **slow/relaxed (65-80 BPM)**: バラード、叙情的楽曲全般
- **medium/steady (80-100 BPM)**: ミッドテンポJ-POP、フォーク系
- **medium-fast/upbeat (100-120 BPM)**: 標準的ポップス、軽快なロック
- **fast/driving (120+ BPM)**: エネルギッシュなロック、アニソン、一部ヒップホップ

## 分析対象楽曲
- 楽曲: ${song}
- アーティスト: ${artist}

## Suno AIネイティブ出力要件（必須）
**テンポ指示**:
- 必ず「形容詞 (BPM帯)」形式: "slow/relaxed (70-75 BPM)"
- 単体BPM数値は絶対禁止: ×"75 BPM" ○"slow (70-75 BPM)"

**リズム指示**:
- ビートタイプで指定: "steady 4/4 beat", "swing 4/4", "syncopated groove"
- 体感比喩: "head-nod groove"(Hip-Hop), "driving rock beat"

**禁止要素**:
- 必須項目: "No ambient pads" - 汎用パッド音色の禁止（具体的楽器名を優先）
- 追加禁止: "No EDM drops", "No comedic tones", "No swing"等（楽曲スタイルに不適切な要素）
- 楽曲分析に基づく適切な禁止要素の選定

**必須JSON出力例**:
{
  "mood": "静かで瞑想的な雰囲気、心の奥深くに響く叙情性",
  "tempo": "slow/relaxed (70-75 BPM)",
  "rhythm": "laid-back groove with steady 4/4 beat", 
  "instruments": "soft acoustic piano, gentle acoustic strings, subtle percussion",
  "forbidden": "No ambient pads, No EDM drops, No comedic tones",
  "style": "穏やかなバラード、オーガニックプロダクション"
}

🚫【絶対禁止例】styleフィールドで以下は出力しない：
❌ "Purpose: Opening theme, 3-4 minutes... Instruments: guitar + bass..."
❌ "Mood: energetic... Tempo: fast... Instruments: distorted guitar..."
✅ "エネルギッシュなロック、ドライビングプロダクション"

**その他要件**:
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
      
      // 🔧 不要楽器の除去処理（synth pad問題の解決）- 第1段階
      // AIが生成しがちな不適切な楽器指示を除去
      
      unwantedInstruments.forEach(unwanted => {
        // 🔧 強化版正規表現 - あらゆる区切り文字と句読点に対応
        const escapedUnwanted = unwanted.replace(/\s+/g, '\\s*');
        
        // 1. 基本形（前後に区切り文字がない場合）
        const basicRegex = new RegExp(`\\b${escapedUnwanted}\\b`, 'gi');
        style = style.replace(basicRegex, '');
        
        // 2. カンマ・句点区切り（,、。;）
        const punctRegex = new RegExp(`[,、。;]\\s*${escapedUnwanted}(?=[,、。;\\s]|$)`, 'gi');
        style = style.replace(punctRegex, '');
        const prePunctRegex = new RegExp(`${escapedUnwanted}\\s*[,、。;]`, 'gi');
        style = style.replace(prePunctRegex, '');
        
        // 3. +記号区切り（+ synth pad. の形式に対応）
        const plusRegex = new RegExp(`\\s*\\+\\s*${escapedUnwanted}(?=[.\\s,+]|$)`, 'gi');
        style = style.replace(plusRegex, '');
        const prePlusRegex = new RegExp(`${escapedUnwanted}\\s*\\+`, 'gi');
        style = style.replace(prePlusRegex, '');
        
        // 4. ピリオド・感嘆符終端（. ! の直前）
        const endPunctRegex = new RegExp(`\\s*${escapedUnwanted}\\s*[.!]`, 'gi');
        style = style.replace(endPunctRegex, '.');
        
        // 5. コロン区切り（Instruments: xxx の形式）
        const colonRegex = new RegExp(`(Instruments?:|楽器[:：])([^.]*?)${escapedUnwanted}([^.]*)`, 'gi');
        style = style.replace(colonRegex, (match: string, prefix: string, before: string, after: string) => {
          return prefix + before.replace(/\s*\+\s*$/, '') + after.replace(/^\s*\+\s*/, ' + ').replace(/^\s*[+,]\s*/, '');
        });
      });
      
      // 連続するカンマや余分な空白を整理（第1段階）
      style = style.replace(/[,、]\s*[,、]+/g, '、').replace(/\s*\+\s*\+/g, ' + ').replace(/^\s*[,+]\s*|\s*[,+]\s*$/g, '').replace(/\s+/g, ' ').trim();
      
      console.log('🔧 Style第1段階除去処理:', {
        original: parsedResponse.style,
        afterUnwanted: style,
        containsSynthPad: /synth\s*pad/i.test(style),
        containsPlus: style.includes('+'),
        hasInstruments: /Instruments?:/i.test(style)
      });
      
      // 🔧 styleフィールドから楽器名を除去（instrumentsフィールドと重複防止）
      // 🔧 commonInstruments = unwantedInstruments + 通常楽器（重複防止用）
      const commonInstruments = [
        // unwantedInstrumentsと同じリスト（synth系完全除去）
        ...unwantedInstruments,
        // 通常楽器（styleから除去してinstrumentsに分離）
        'guitar', 'ギター', 'electric guitar', 'エレキギター', 'acoustic guitar', 'アコースティックギター',
        'bass', 'ベース', 'bass guitar', 'ベースギター', 'bass guitar', 'drum kit', 'drum set',
        'drums', 'ドラム', 'ドラムス', 'percussion', 'パーカッション',
        'piano', 'ピアノ', 'keyboard', 'キーボード', 'electric piano',
        'strings', 'ストリングス', 'violin', 'バイオリン', 'vocals', 'voice', 'vocal'
      ];
      
      const styleBeforeCommon = style;
      commonInstruments.forEach(instrument => {
        // 🔧 強化版処理を統一適用
        const escapedInstrument = instrument.replace(/\s+/g, '\\s*');
        
        // 基本形除去
        const basicRegex = new RegExp(`\\b${escapedInstrument}\\b`, 'gi');
        style = style.replace(basicRegex, '');
        
        // カンマ・句点区切り
        const punctRegex = new RegExp(`[,、。;]\\s*${escapedInstrument}(?=[,、。;\\s]|$)`, 'gi');
        style = style.replace(punctRegex, '');
        const prePunctRegex = new RegExp(`${escapedInstrument}\\s*[,、。;]`, 'gi');
        style = style.replace(prePunctRegex, '');
        
        // +記号区切り（強化版）
        const plusRegex = new RegExp(`\\s*\\+\\s*${escapedInstrument}(?=[.\\s,+]|$)`, 'gi');
        style = style.replace(plusRegex, '');
        const prePlusRegex = new RegExp(`${escapedInstrument}\\s*\\+`, 'gi');
        style = style.replace(prePlusRegex, '');
        
        // ピリオド終端
        const endPunctRegex = new RegExp(`\\s*${escapedInstrument}\\s*[.!]`, 'gi');
        style = style.replace(endPunctRegex, '.');
      });
      
      // 🔧 Purpose形式完全除去（最終解決）
      // Purpose形式が含まれている場合、ジャンル部分のみを抽出
      if (style.includes('Purpose:') || style.includes('Mood:') || style.includes('Instruments:')) {
        // Purpose形式の場合、完全に新しいスタイル記述に置き換え
        const genre = style.match(/(rock|pop|ballad|folk|jazz|blues|electronic|hip.?hop|r&b|soul|classical|country|metal|punk|indie|alternative|ロック|ポップ|バラード|フォーク|ジャズ|ブルース)/gi)?.[0] || 'ロック';
        const productionStyle = parsedResponse.tempo?.includes('fast') ? 'ドライビングなプロダクション' : 
                               parsedResponse.tempo?.includes('slow') ? 'オーガニックなプロダクション' : 'ダイナミックなプロダクション';
        style = `エネルギッシュな${genre}、${productionStyle}`;
        
        console.log('🔧 Purpose形式を簡潔スタイルに置換:', {
          detected: 'Purpose format detected',
          newStyle: style
        });
      } else {
        // 通常の除去処理
        style = style.replace(/(Purpose|Instruments?|Structure|Vocals?|Mood|Tempo|Forbidden|楽器|構成)[:：][^.]*(\.)?/gi, '');
        style = style.replace(/[^.]*\b(guitar|bass|drums|piano|synth|keyboard|strings|brass|vocals?)\b[^.]*/gi, '');
      }
      
      // 🔧 強化版最終整理
      style = style
        // 連続区切り文字の修正
        .replace(/[,、]\s*[,、]+/g, '、')
        .replace(/\s*\+\s*\+/g, ' + ')
        // 前後の余分な区切り文字除去
        .replace(/^\s*[,+]\s*|\s*[,+]\s*$/g, '')
        // 複数のピリオドを1つに
        .replace(/\.+/g, '.')
        // 空白の正規化
        .replace(/\s+/g, ' ')
        // ピリオド前の空白除去
        .replace(/\s+\./g, '.')
        // 先頭末尾の空白・句読点除去
        .replace(/^[\s.]+|[\s.]+$/g, '')
        .trim();
      
      console.log('🔧 Style第2段階除去処理:', {
        beforeCommon: styleBeforeCommon,
        afterCommon: style
      });
      
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

      // 新しい4要素構造に対応（後方互換性保持）
      const tempo = parsedResponse.tempo || "medium/steady (85-100 BPM)"
      const rhythm = parsedResponse.rhythm || "steady 4/4 beat"
      let instruments = parsedResponse.instruments || "guitar, bass, drums"
      const forbidden = parsedResponse.forbidden || "No comedic tones"
      
      // 🔧 instruments フィールドからもsynth pad除去（強化版）
      const instrumentsOriginal = instruments;
      
      unwantedInstruments.forEach(unwanted => {
        const regex = new RegExp(unwanted.replace(/\s+/g, '\\s*'), 'gi');
        instruments = instruments.replace(regex, '');
        const commaRegex = new RegExp(`[,、]\\s*${unwanted.replace(/\s+/g, '\\s*')}`, 'gi');
        instruments = instruments.replace(commaRegex, '');
        const preCommaRegex = new RegExp(`${unwanted.replace(/\s+/g, '\\s*')}\\s*[,、]`, 'gi');
        instruments = instruments.replace(preCommaRegex, '');
        // +区切り形式にも対応
        const plusRegex = new RegExp(`\\s*\\+\\s*${unwanted.replace(/\s+/g, '\\s*')}`, 'gi');
        instruments = instruments.replace(plusRegex, '');
        const prePlusRegex = new RegExp(`${unwanted.replace(/\s+/g, '\\s*')}\\s*\\+`, 'gi');
        instruments = instruments.replace(prePlusRegex, '');
      });
      instruments = instruments.replace(/[,、]\s*[,、]+/g, ',').replace(/\s*\+\s*\+/g, ' + ').replace(/^\s*[,+]\s*|\s*[,+]\s*$/g, '').replace(/\s+/g, ' ').trim();
      
      console.log('🔧 Instruments除去処理:', {
        original: parsedResponse.instruments,
        originalAssigned: instrumentsOriginal,
        processed: instruments,
        removedSynthPad: instrumentsOriginal !== instruments
      });

      // 診断ログ: AIが新4要素を出力しているかチェック
      console.log('=== 新4要素診断 ===');
      console.log('AI原始応答:', JSON.stringify(parsedResponse, null, 2));
      console.log('新要素出力状況:');
      console.log('- tempo:', parsedResponse.tempo ? '✅ AI出力' : '❌ フォールバック');
      console.log('- rhythm:', parsedResponse.rhythm ? '✅ AI出力' : '❌ フォールバック'); 
      console.log('- instruments:', parsedResponse.instruments ? '✅ AI出力' : '❌ フォールバック');
      console.log('- forbidden:', parsedResponse.forbidden ? '✅ AI出力' : '❌ フォールバック');
      
      // 🔍 最終チェック: synth pad が完全に除去されているか確認
      console.log('=== 最終Synth Pad検査 ===');
      const finalSynthPadCheck = {
        moodHasSynthPad: /synth\s*pad/i.test(mood),
        styleHasSynthPad: /synth\s*pad/i.test(style),
        styleHasInstruments: /Instruments?:/i.test(style),
        styleHasPlus: style.includes('+'),
        instrumentsHasSynthPad: /synth\s*pad/i.test(instruments),
        forbiddenHasSynthPad: /synth\s*pad/i.test(forbidden)
      };
      console.log('Synth pad残存検査:', finalSynthPadCheck);
      console.log('Style内容詳細:', { 
        fullStyle: style,
        length: style.length,
        containsInstruments: style.match(/Instruments?:[^.]*/gi),
        containsAnyInstrument: /\b(guitar|bass|drums|piano|synth|keyboard)\b/i.test(style),
        instrumentsSectionRemoved: !style.includes('Instruments:')
      });
      
      if (finalSynthPadCheck.moodHasSynthPad || finalSynthPadCheck.styleHasSynthPad || 
          finalSynthPadCheck.instrumentsHasSynthPad || finalSynthPadCheck.forbiddenHasSynthPad) {
        console.log('⚠️ 警告: まだsynth padが残っています！', {
          mood, style, instruments, forbidden
        });
      } else {
        console.log('✅ synth pad除去完了');
      }

      return NextResponse.json({
        // 既存フィールド（後方互換性）
        mood,
        style,
        // 新しい4要素構造（順次追加）
        tempo,
        rhythm, 
        instruments,
        forbidden,
        debug: {
          originalMood: parsedResponse.mood,
          originalStyle: parsedResponse.style,
          newFields: { tempo, rhythm, instruments, forbidden },
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
