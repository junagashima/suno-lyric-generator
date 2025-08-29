import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// プロ仕様タイトル生成（J-POPヒットノウハウ統合版）
function generateFallbackTitles(theme: string, mood: string, content: string): string[] {
  const titles: string[] = []
  
  // 🎯 戦略1: 短く口にしやすい（2-4語以内）
  const shortTitles = []
  
  // 🎨 戦略2: 視覚的イメージ重視（色・季節・場所）
  const visualTitles = []
  
  // 💫 戦略3: 感情直球ワード
  const emotionalTitles = []
  
  // テーマ別戦略的タイトル生成
  if (theme.includes('恋') || theme.includes('愛')) {
    shortTitles.push('君だけ', 'LOVE', 'キミ', '愛')
    visualTitles.push('桜色の恋', '夜空と君', '赤い糸', '恋の季節')
    emotionalTitles.push('君への想い', '愛をこめて', '恋心', '切ない愛')
  } else if (theme.includes('卒業') || theme.includes('別れ')) {
    shortTitles.push('さよなら', 'Goodbye', '旅立ち', '門出')
    visualTitles.push('桜散る日', '青春の扉', '夕暮れ道', '春の別れ')
    emotionalTitles.push('涙の卒業式', '思い出たち', '新しい明日', 'ありがとう')
  } else if (theme.includes('友情') || theme.includes('仲間')) {
    shortTitles.push('友達', 'Together', '仲間', '絆')
    visualTitles.push('虹の向こう', '青い空と', '街角で', '夏の友達')
    emotionalTitles.push('かけがえのない時間', '友情の歌', 'ずっと一緒', '心の友')
  } else if (theme.includes('家族')) {
    shortTitles.push('家族', 'Family', 'ありがとう', '母')
    visualTitles.push('温かい家', '夕飯の時間', '帰り道', '家族写真')
    emotionalTitles.push('ありがとうの歌', '家族の愛', '温もり', 'おかえり')
  } else if (theme.includes('夢') || theme.includes('希望')) {
    shortTitles.push('夢', 'Dream', '希望', 'Believe')
    visualTitles.push('虹のかなた', '星空の夢', '明日の空', '光の道')
    emotionalTitles.push('諦めない心', '夢を追いかけて', '希望の光', '未来への扉')
  }

  // 雰囲気別タイトル強化
  if (mood.includes('切ない') || mood.includes('悲しい')) {
    shortTitles.push('涙', '想い', '雨', '夜')
    visualTitles.push('雨の日', '夜の街', '灰色の空', '静かな部屋')
    emotionalTitles.push('心の雨', '涙そうそう', '切ない想い', '孤独な夜')
  } else if (mood.includes('希望') || mood.includes('前向き') || mood.includes('エネルギッシュ')) {
    shortTitles.push('光', 'Shine', '今日', '明日')
    visualTitles.push('青い空', '太陽の歌', '新しい朝', '虹色の日')
    emotionalTitles.push('輝く未来', '負けないで', '新しいスタート', '希望の歌')
  } else if (mood.includes('温かい') || mood.includes('優しい')) {
    shortTitles.push('優しさ', 'Heart', '温もり', '笑顔')
    visualTitles.push('春の陽だまり', '夕焼け空', '花畑', '暖かい部屋')
    emotionalTitles.push('やさしい時間', '心の温もり', '愛のうた', '安らぎ')
  }

  // 🎵 戦略4: 音の響き・リズム重視
  const rhythmicTitles = ['ワンダフル', 'キラキラ', 'ドキドキ', 'ワクワク', 'メロディー']
  
  // 🌟 戦略5: 抽象的・余白のあるタイトル
  const abstractTitles = ['物語', 'ココロ', 'カタチ', '軌跡', 'かけら', '瞬間', '記憶']

  // ノウハウ統合: バランス良く選出
  const allTitles = [
    ...shortTitles.slice(0, 2),      // 短さ重視
    ...visualTitles.slice(0, 2),     // 視覚的
    ...emotionalTitles.slice(0, 2),  // 感情的
    ...rhythmicTitles.slice(0, 1),   // 音響的
    ...abstractTitles.slice(0, 1)    // 抽象的
  ].filter(Boolean)

  // 重複排除して返却
  return [...new Set(allTitles)]
}

interface VocalSettings {
  gender: string
  age: string
  nationality: string
  techniques: string[]
}

interface GenerateRequest {
  mode: 'simple' | 'custom'
  mood: string
  musicStyle: string
  theme: string
  content: string
  contentReflection?: 'literal' | 'metaphorical' | 'balanced' // Step D: 安全に追加（オプショナル）
  songLength: string
  vocal: VocalSettings
  // ラップモード選択（拡張版）
  rapMode?: 'none' | 'partial' | 'full'
  // 後方互換性のため保持
  includeRap?: boolean
  // Step I: 楽曲構造情報を受け取る
  analyzedStructure?: {
    hasRap: boolean
    vocalStyle: string
    genre: string
    isDragonAshStyle?: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      mode,
      mood,
      musicStyle,
      theme,
      content,
      contentReflection = 'literal', // Step D: 安全なデフォルト値
      songLength,
      vocal,
      rapMode = 'none', // 新しいラップモード
      includeRap = false, // 後方互換性のため保持
      analyzedStructure // Step I: 楽曲構造情報
    }: GenerateRequest = await request.json()

    // 後方互換性: includeRapがtrueの場合はpartialに変換
    const finalRapMode = includeRap && rapMode === 'none' ? 'partial' : rapMode

    if (!theme || !content) {
      return NextResponse.json(
        { error: 'テーマと歌詞の内容は必須です' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' },
        { status: 500 }
      )
    }

    // 歌詞生成プロンプト
    const lyricsPrompt = `
あなたは日本のヒット曲を数多く手がけたプロの作詞家です。Suno AIで使用するための歌詞とタイトルを作成してください。

## 楽曲設定
- モード: ${mode === 'simple' ? '簡単モード（参考楽曲ベース）' : 'こだわりモード（完全オリジナル）'}
- 雰囲気・感情: ${mood}
- 音楽スタイル: ${musicStyle}
- テーマ・使用場面: ${theme}
- 楽曲の長さ: ${songLength}

## ボーカル設定
- 構成: ${vocal.gender}
- 年齢: ${vocal.age}
- 国籍: ${vocal.nationality}
- 歌唱技法: ${vocal.techniques.join(', ')}

## ボーカル構成の特徴
${vocal.gender.includes('グループ') || vocal.gender.includes('デュエット') || vocal.gender.includes('コーラス') ? 
  '※ このボーカル構成では、ハーモニー・コーラスワーク・対話的歌唱を効果的に活用した歌詞構成を心がけてください' : 
  '※ ソロボーカルの表現力を活かした歌詞構成を心がけてください'}

## 歌詞に盛り込みたい内容
${content}

## Step E: 内容反映方法（${contentReflection}）
${contentReflection === 'literal' ? 
  '- **専門用語・固有名詞・数字をそのまま歌詞に使用**してください\n- **具体的な内容を抽象化せず**、リズムに合わせて自然に歌詞化\n- **「スプデブ」「1-2ヶ月」等のキーワードを必ず含める**' :
contentReflection === 'metaphorical' ?
  '- **内容を詩的・象徴的に表現**し、直接的な専門用語は避ける\n- **比喩やメタファーを活用**して内容の本質を美しく表現\n- **抽象的な言葉で核心メッセージを伝達**' :
  '- **重要なキーワードは忠実に保持**、説明部分は詩的に表現\n- **専門用語の一部は残し**、周辺内容は美化して表現\n- **技術性と詩的表現のバランス**を取る'
}

## ラップセクション対応
${finalRapMode === 'full' ? `
   **🔥 全面ラップ楽曲モード 🔥**
   **この楽曲は完全なヒップホップ・ラップ楽曲として作成してください**

   **CRITICAL: 歌メロディーは一切使用せず、全セクションをラップで構成**
   - **禁止事項**: [Chorus]での歌メロディー、サビでの歌唱、メロディアスなパート
   - **必須構成**: [Intro] → [Rap Verse] → [Rap Hook/Chorus] → [Rap Verse] → [Rap Hook/Chorus] → [Outro]
   - **ラップのみ**: 全てのボーカルパートはラップ・フロー・韻踏みで構成

   **日本語フリースタイルラップ技法（全面適用）:**
   - **連続フロー**: 途切れない韻とリズムの流れ
   - **多層韻**: 内韻・脚韻・頭韻の組み合わせ
   - **ストーリーテリング**: テーマ「${theme}」に沿った物語性のある歌詞
   - **パンチライン**: セクションごとに印象的な決め台詞
   - **ビート合わせ**: ヒップホップビートに完全に同調したシラブル調整

   **全面ラップ構成要件:**
   - 各[Rap Verse]は8-16行の充実したフロー
   - [Rap Hook/Chorus]はキャッチーで反復可能なラップフレーズ
   - 楽曲全体を通してメロディーではなくリズムと韻で構成
   - テーマ「${theme}」を中心とした一貫したメッセージ
` : finalRapMode === 'partial' || analyzedStructure?.hasRap ? `
   **この楽曲にはRAP要素を含める指定です（一部ラップモード）**
   ${finalRapMode === 'partial' ? '- **ユーザー選択**: 一部ラップモード（Dragon Ash風）' : ''}
   ${analyzedStructure?.hasRap ? `- **楽曲分析検出**: ${analyzedStructure.genre} / ${analyzedStructure.vocalStyle}` : ''}

   **MANDATORY: [Rap Verse]タグを必ず歌詞に含めてください**
   - **[Rap Verse]セクションをメロディーセクションとは別に作成**
   - **推奨構成**: Intro → Verse → Pre-Chorus → Chorus → [Rap Verse] → Chorus → Outro

   **日本語ラップ基本技法:**
   - **母音合わせ**: 行末の母音を統一（例：「未来/誓い/走りたい」でa-i音）
   - **脚韻**: 行の終わりの音を揃える（最も効果的）
   - **パンチライン**: キャッチーな決め台詞を1-2箇所に配置
   - **リズム調整**: ビートに合わせた語感重視の歌詞構成

   **[Rap Verse]作成要件（4-8行）:**
   - 内容テーマに沿った自己表現・主張を含める
   - 韻踏みパターンを必ず使用
   - パワフルで印象的な語彙選択
   - 絵文字や装飾記号は使用せず、純粋な歌詞のみを出力
` : ''}

${finalRapMode === 'full' ? `
## 🔥 全面ラップ楽曲作詞要件 🔥
**この楽曲は完全なヒップホップ・ラップ楽曲として作詞してください**

1. **ヒップホップ・ラップ作詞戦略**
   - **フロー重視**: ビートに合わせたリズミカルな言葉選び
   - **韻踏み必須**: 内韻・脚韻・頭韻を効果的に使用
   - **ストーリーテリング**: テーマに沿った一貫したメッセージ
   - **パンチライン**: 印象的で記憶に残るフレーズを各セクションに配置
   - **リアルな表現**: 具体的で直球な言葉遣い

2. **全面ラップ専用Sunoタグ**
   - **楽曲構成タグ**: [Intro], [Rap Verse], [Rap Hook/Chorus], [Outro] ※[Verse], [Pre-Chorus], [Chorus]は使用禁止
   - **演出タグ**: [Beat drop], [Instrumental Break], [Scratch sounds]
   - **ボーカル指示タグ**: [Aggressive delivery], [Smooth flow], [Rapid fire], [Whispered rap]
   - **楽器指示タグ**: [Heavy bass], [Drum pattern], [Scratch effects]

3. **全面ラップ楽曲構成（MANDATORY）**
   - **短め(2-3分)**: [Intro] → [Rap Verse] → [Rap Hook/Chorus] → [Rap Verse] → [Rap Hook/Chorus] → [Outro]
   - **標準(3-4分)**: [Intro] → [Rap Verse] → [Rap Hook/Chorus] → [Rap Verse] → [Rap Hook/Chorus] → [Rap Bridge] → [Rap Hook/Chorus] → [Outro]
   - **長め(4-5分+)**: [Intro] → [Rap Verse] → [Rap Hook/Chorus] → [Rap Verse] → [Rap Hook/Chorus] → [Rap Bridge] → [Rap Verse] → [Rap Hook/Chorus] → [Outro]

**CRITICAL: メロディックな[Verse], [Pre-Chorus], [Chorus]タグは絶対に使用しないでください**
` : `
## 作詞要件
以下の要素を考慮してJ-POPヒット曲として成功する歌詞を作成してください：

1. **J-POPヒット曲の作詞戦略**
   - リスナーの記憶に残りやすい表現
   - 感情に訴えかける言葉選び
   - 共感を呼ぶ普遍的テーマの表現
   - シンプルでキャッチーな言葉の使用
   - 現代のJ-POPトレンドを反映した語彙選択

2. **Suno AIタグの効果的活用**
   - 楽曲構成タグ: [Intro], [Verse], [Pre-Chorus], [Chorus], [Bridge], [Outro]${finalRapMode === 'partial' || analyzedStructure?.hasRap ? ', [Rap Verse]' : ''}
   - 演出タグ: [Fade in], [Fade out], [Instrumental Break]
   - ボーカル指示タグ: [Vocal harmony], [Ad libs], [Whispered], [Belted]
   - 楽器指示タグ: [Piano solo], [Guitar riff], [String section]

3. **楽曲構成**
   以下の多様な構成パターンから、楽曲の雰囲気とテーマに最適な構成を選択してください：
   
   **クラシック構成**: Intro → Verse → Chorus → Verse → Chorus → Bridge → Chorus → Outro
   **シンプル構成**: Intro → Verse → Chorus → Verse → Chorus → Outro
   **プリコーラス構成**: Intro → Verse → Pre-Chorus → Chorus → Verse → Pre-Chorus → Chorus → Bridge → Chorus → Outro
   **ダブルコーラス構成**: Intro → Verse → Chorus → Verse → Chorus → Chorus → Outro
   **Cメロ構成**: Intro → Verse → Chorus → Verse → Chorus → Cメロ → Chorus → Outro
   **インスト構成**: Intro → Verse → Chorus → Instrumental Break → Verse → Chorus → Outro
   **モーダル構成**: Intro → Verse → Chorus → Interlude → Verse → Bridge → Chorus → Outro
   **アーティスティック構成**: Intro → Verse → Verse → Chorus → Verse → Bridge → Outro
   
   楽曲の長さ：${songLength}
`}

${finalRapMode === 'full' ? `
## 🔥 全面ラップ楽曲出力形式 🔥
必ず以下の形式で回答してください：

**タイトル候補:**
1. タイトル1（ヒップホップらしいタイトル）
2. タイトル2（パンチのあるタイトル）
3. タイトル3（ストリート感のあるタイトル）

**歌詞（全面ラップSunoタグ付き）:**
[Intro]
[Beat starts] [Heavy bass]

[Rap Verse]
8-16行のフリースタイルラップ歌詞
（韻踏み・フロー・パンチライン必須）

[Rap Hook/Chorus]
4-8行のキャッチーなラップフック
（繰り返し可能な印象的フレーズ）

[Rap Verse]
8-16行のフリースタイルラップ歌詞
（テーマ展開・ストーリー継続）

[Rap Hook/Chorus]
4-8行のキャッチーなラップフック

[Outro]
[Beat fade] [Bass out]

**CRITICAL: [Verse], [Pre-Chorus], [Chorus]タグは絶対に使用禁止**
` : `
## 出力形式
必ず以下の形式で回答してください：

**タイトル候補:**
1. タイトル1
2. タイトル2
3. タイトル3

**歌詞（Sunoタグ付き）:**
[Intro]
[楽器演奏部分の指示がある場合]

[Verse]
歌詞内容...

[Pre-Chorus]
歌詞内容...

[Chorus]
歌詞内容...

${finalRapMode === 'partial' || analyzedStructure?.hasRap ? `[Rap Verse]
歌詞内容（ラップセクション、絵文字や装飾記号なし）...

` : ''}[続きのセクション...]

[Outro]
[Fade out]
`}

## J-POPヒット楽曲タイトル生成ガイドライン
タイトルは「聞く前の第一印象」かつ「聞いた後に記憶を固定するフック」として以下を参考に：

### 🎯 効果的タイトルの要素（自然に活用）
1. **長さとリズム**: 2-4語以内を目安に、口にしやすい響き
2. **イメージ喚起**: 色・季節・場所などの視覚的要素で映像化
3. **感情トリガー**: 「愛」「涙」「夢」「希望」等の感情直球ワード
4. **楽曲連動**: サビや印象的歌詞フレーズからの自然な抽出
5. **音の美しさ**: オノマトペや韻、日英ミックスの新鮮さ
6. **適度な抽象性**: リスナーが想像を膨らませられる余白

**重要**: 上記は参考であり、楽曲の本質とテーマ「${theme}」を最優先してください

${finalRapMode === 'full' ? `
## 🔥 全面ラップ楽曲重要出力要件 🔥
※ **必ずタイトル候補を3つ**最初に出力（ヒップホップらしいタイトル）
※ **「**歌詞（全面ラップSunoタグ付き）:**」以降は純粋なラップ歌詞とタグのみ**
※ **絶対禁止**: [Verse], [Pre-Chorus], [Chorus]タグの使用
※ **必須タグ**: [Rap Verse], [Rap Hook/Chorus]のみ使用
※ **絵文字や装飾記号は歌詞部分で一切使用禁止**
※ **韻踏み・フロー・パンチラインを必須で含める**
※ **各[Rap Verse]は8-16行、[Rap Hook/Chorus]は4-8行**
※ **メロディックな歌詞は一切書かず、全てラップフローで作詞**
※ **ビートに合わせたリズミカルな言葉選びを重視**
` : `
## 重要な出力要件
※ **必ずタイトル候補を3つ**最初に出力してください（上記ガイドライン参考）
※ タイトルは楽曲のテーマと雰囲気を反映した魅力的で記憶に残るものに
※ **楽曲構成は必ず変化させてください**：単調なパターンは避け、異なる構成を使用
※ **「**歌詞（Sunoタグ付き）:**」セクション以降は純粋な歌詞とタグのみ**を出力してください
※ **絵文字や装飾記号（🔥、📝、🎵等）は歌詞部分で一切使用禁止**
※ Sunoタグは効果的に配置し、楽曲の流れを明確に示してください
※ 日本語の美しい表現と現代的な感覚を両立させてください
※ リスナーが口ずさみたくなるようなキャッチーなフレーズを含めてください
${finalRapMode === 'partial' || analyzedStructure?.hasRap ? '※ **[Rap Verse]セクションでは、タグ以外は純粋な歌詞のみ**を記述してください' : ''}
`}
`

    // 英語スタイル指示生成プロンプト（表現力強化）
    const stylePrompt = `
Suno AIで楽曲を生成するための最適化された英語スタイル指示を作成してください。ChatGPT実証済みの「核10項目」ベストプラクティスに基づいて、一筆書き設計図スタイルで簡潔に指示します。

## 核10項目マッピング（一筆書き設計図用）
1. **Purpose（用途）**: ${theme}をテーマとした楽曲
2. **Length（長さ）**: ${songLength}
3. **Language（言語）**: 日本語歌詞
4. **Vocals（ボーカル）**: ${vocal.gender}、${vocal.age}、${vocal.nationality}
5. **Tempo（テンポ帯）**: ${musicStyle}から抽出
6. **Rhythm（リズム質感）**: 楽曲スタイルに応じて設定
7. **Instruments（楽器）**: ${musicStyle}から主要楽器を抽出
8. **Structure（構成）**: ${songLength}に応じた構成
9. **Mood（感情3語）**: ${mood}から3つまでに絞る
10. **Forbidden（禁止要素）**: ジャンルに応じて設定

## 追加情報
- 歌唱技法: ${vocal.techniques.join(', ')}
- 詳細スタイル: ${musicStyle}
- **ラップモード**: ${finalRapMode} (none: 通常楽曲, partial: 一部ラップ, full: 全面ラップ)

${finalRapMode === 'full' ? `
## 🔥 全面ラップ楽曲用 SUNO最適化指示（ChatGPT実証済み）

### 全面ラップ専用テンプレート適用
以下のテンプレートを参考に、SUNOの「歌モード引っ張られ」を回避した完全ラップ指示を生成：

**必須要素:**
- **Style**: "Hip-hop rap-only track" を冒頭に明記
- **Purpose**: "freestyle-style rap performance" でラップ性を強調  
- **Vocals**: "continuous rap throughout, no melodic singing" で歌禁止徹底
- **Rap Style**: "rhythmic, punchy, conversational flow, clear end rhymes"
- **Forbidden**: "sung chorus, autotuned melodies, pop-style singing" を必須記載

### 全面ラップ最適化ポイント:
- SUNOは歌に寄りやすいため「rap-only」「no singing」を複数回強調
- テンポは90-110BPM程度の中速〜速めが自然
- 楽器はシンプル（ドラム＋ベース中心）、軽くギターやシンセ追加
- 雰囲気: urban/energetic/confident/aggressive/chill等から選択
` : `
## Suno AI最適化指示作成方針

### 1. 核10項目による一筆書き設計図作成`}
- **Purpose指定**: "BGM for meeting", "MV style track", "Opening theme"
- **Length明記**: "about 75 seconds", "30-35 seconds"  
- **Language明記**: "Japanese lyrics", "instrumental only"
- **禁止要素必須**: "No rap", "No EDM drops", "No comedic tones"
- **楽器は3-4個**: "guitar + bass + drums + synth pad"
- **テンポ帯表現**: "medium-fast", "relaxed", "driving beat"

### 2. 音の質感・雰囲気の英語表現
- **ダーク**: dark, ominous, haunting, brooding
- **エネルギッシュ**: energetic, explosive, dynamic, driving
- **切ない**: melancholic, wistful, bittersweet, poignant
- **透明感**: clear, crisp, ethereal, pristine

### 3. 楽器・音響の表現技法
- **ギター**: distorted, fingerpicked, heavy riffs, sharp cutting
- **ドラム**: punchy, driving, sharp snares, powerful kicks
- **ボーカル**: soaring, passionate, restrained-to-explosive, layered harmonies

### 3.1. グループボーカル表現技法（${vocal.gender}の場合）
${vocal.gender.includes('グループ') || vocal.gender.includes('デュエット') || vocal.gender.includes('コーラス') ? `
- **ハーモニー**: rich harmonies, layered vocals, call-and-response, vocal interplay
- **コーラスワーク**: backing vocals, group chorus, multi-part harmony
- **対話**: conversational vocals, duet exchanges, interwoven melodies
- **音響効果**: vocal layering, harmonic richness, ensemble depth
` : `
- **ソロ表現**: expressive lead vocals, emotional delivery, vocal focus
- **表現力**: dynamic range, vocal technique mastery, emotional connection
`}

### 4. 楽曲展開の動的表現
- 「静から動へ」→「building from calm to explosive」
- 「緊張と解放」→「tension and release dynamics」
- 「疾走感」→「driving momentum with urgent energy」

## Suno AI最適化要件（ChatGPT実証済みベストプラクティス）

### 必須「核10項目」チェックリスト:
1. **Purpose（用途）**: BGM/CM/OP/MVなど明記
2. **Length（長さ）**: 30秒/60秒/2分など具体的に
3. **Language（言語）**: 日本語/英語/インスト
4. **Vocals（ボーカル）**: 有無・性別・表情（落ち着き→爆発等）
5. **Tempo（テンポ帯）**: ゆったり/中速/速い（数値避ける）
6. **Rhythm（リズム質感）**: 跳ねる/直進/シャッフル
7. **Instruments（楽器パレット）**: 必須楽器を3-4個明記
8. **Structure（構成）**: A→B→サビ/サビ先行等
9. **Mood（感情3語まで）**: 緊張感・昂揚・ほろ苦さ等
10. **Forbidden（禁止要素）**: ラップ禁止/EDMドロップ禁止等

### 出力ルール:
- **60-90語**の一筆書き設計図
- **比喩は1個まで**（音像が浮かぶもの）
- **禁止要素を必ず明記**（Sunoの勝手な追加を防ぐ）
- 英語指示文のみ出力

## ChatGPT実証済み成功テンプレート：

**赤いワイン系（Red Wine Style）:**
"Purpose: MV style track, about 75 seconds, Japanese lyrics. Mood: bittersweet warmth, quiet build, nocturnal reflection. Tempo: medium, gentle 8-beat. Instruments: delicate banjo phrases + nostalgic enka-style melody + guitar/bass/drums. Structure: intro → verse → pre-chorus → chorus → closing. Vocals: soft male voice, half-sad whisper. Forbidden: comedic tones, heavy EDM, fast bluegrass banjo."

**ダークJ-Rock系（SPECIALZ Style）:**
"Purpose: Opening theme style, 60-70 seconds, Japanese lyrics. Mood: tension, chaos, release. Tempo: medium-fast, driving beat. Instruments: heavy distorted guitar riffs + rumbling bass + sharp snare + low ominous synth. Vocals: male, calm in verse, explosive in chorus. Forbidden: EDM drops, bright brass, comic sound effects."

**🔥 全面ラップ系（Hip-hop Rap-only Style）:**
"Purpose: Hip-hop rap-only track, freestyle-style rap performance, about 90 seconds, Japanese lyrics. Mood: urban, energetic, confident. Tempo: medium-fast (90–110 BPM), head-nod groove. Instruments: strong drum beat + deep bassline + optional light guitar or synth for texture. Vocals: continuous rap throughout, no melodic singing, rhythmic punchy conversational flow with clear end rhymes. Forbidden: sung chorus, autotuned melodies, EDM drops, pop-style singing, melodic sections."

${finalRapMode === 'full' ? `
## 🔥 全面ラップ専用厳守フォーマット：

**全面ラップ楽曲用構造で必ず出力:**
"Style: Hip-hop rap-only track inspired by [参考スタイル]. 
Purpose: [freestyle rap performance/uplifting anthem], about [X seconds]. 
Vocals: [人数] [性別] voice(s), [call-and-response/solo] rap, no singing. 
Rap style: [conversational/aggressive/smooth], [punchy lines/flowing], [simple/complex] rhymes. 
Tempo: medium-fast with [groovy/driving] head-nod beat. 
Instruments: [live drums/drum beat] + [bass/bassline] + [light guitar/synth]. 
Mood: [urban/positive/energetic], [nostalgic/confident/aggressive]. 
Forbidden: melodic chorus, autotuned pop vocals, EDM drops, sung sections."
` : `
## 厳守必須フォーマット（ChatGPT実証済み）：

**必ず以下の構造で出力:**
"Purpose: [MV style track/BGM/Opening theme], about [X seconds], [Japanese lyrics/instrumental]. 
Mood: [感情語3つまで]. 
Tempo: [medium/slow/fast], [具体的リズム記述]. 
Instruments: [楽器名] + [楽器名] + [楽器名]. [追加楽器指定]. 
Structure: [intro] → [verse] → [chorus] → [closing]. 
Vocals: [性別] voice, [表情], [技法]. 
Forbidden: [禁止要素], [禁止要素], [禁止要素]."
`}

**絶対に使用禁止の表現:**
- "musical journey", "soundscape", "emotional depth"
- "evoke", "infuse", "embrace", "heighten" 
- 長い形容詞句や詩的描写

## 🚫 絶対禁止表現リスト：
- "musical journey", "soundscape", "evoke", "infuse", "embrace"
- "emotional depth", "introspective", "poignant essence"  
- "solitary evening walk", "echoes with memories"
- キー名（F minor等）、BPM数値、音域指定

${finalRapMode === 'full' ? `
## ⚡ 全面ラップ専用出力命令（必須遵守）：
必ず「Style: Hip-hop rap-only track」で始まり、「Forbidden: melodic chorus, autotuned pop vocals, EDM drops, sung sections.」で終わる構造化された指示のみ出力せよ。
詩的表現・比喩・長い修飾句は一切使用するな。
ラップスタイル・楽器名・禁止要素を具体的に明記せよ。
**CRITICAL**: 「singing」「melodic」「chorus」を禁止要素に必ず含めよ。
` : `
## ⚡ 出力命令（必須遵守）：
必ず「Purpose: 」で始まり、「Forbidden: 」で終わる構造化された指示のみ出力せよ。
詩的表現・比喩・長い修飾句は一切使用するな。
楽器名と禁止要素を具体的に明記せよ。
`}
`

    // 歌詞生成
    const lyricsCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは日本の音楽業界で活躍する経験豊富な作詞家です。Suno AIに最適化された、日本のヒット曲の要素を持つ歌詞を作成することができます。J-POPの作詞戦略、リスナーの心理、現代のトレンドを深く理解しています。楽曲の雰囲気とテーマに基づいて、最適な構成を選択し、創造的で多様なパターンを使用することができます。楽曲構成は単調にならないよう、異なる構成を使用してください。必ず「**タイトル候補:**」セクションから始めて、魅力的なタイトルを3つ提案し、その後に歌詞を続けてください。"
        },
        {
          role: "user",
          content: lyricsPrompt
        }
      ],
      temperature: 0.9,
      max_tokens: 2000
    })

    // 英語スタイル指示生成
    const styleCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a Suno AI optimization specialist who creates precise, structured style instructions following proven ChatGPT best practices. You MUST use the exact 'Core 10 Items' format with concrete specifications, avoiding all poetic language. Your instructions are technical blueprints, not artistic descriptions. Focus on what Suno AI needs to know: Purpose, Length, Language, specific instrument names, structure, and forbidden elements."
        },
        {
          role: "user",
          content: stylePrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const lyricsResponse = lyricsCompletion.choices[0]?.message?.content || ''
    const styleResponse = styleCompletion.choices[0]?.message?.content || ''

    // タイトル候補を確実に生成するためのフォールバック処理
    let titles: string[] = []
    
    // まず、AI応答からタイトルを抽出を試みる
    const allLines = lyricsResponse.split('\n')
    let inTitleSection = false
    
    for (const line of allLines) {
      if (line.includes('タイトル')) {
        inTitleSection = true
        continue
      }
      if (inTitleSection) {
        const titleMatch = line.match(/^\d+\.\s*(.+)/) || line.match(/^・\s*(.+)/) || line.match(/^-\s*(.+)/)
        if (titleMatch) {
          let title = titleMatch[1].trim()
          title = title.replace(/^\[(.+?)\]$/, '$1') // [タイトル] → タイトル
          title = title.replace(/^「(.+)」$/, '$1') // 「タイトル」 → タイトル
          if (title && !title.includes('**') && !title.includes('歌詞')) {
            titles.push(title)
          }
        } else if (line.includes('**') || line.includes('歌詞')) {
          break
        }
      }
    }
    
    // タイトルが3つ未満の場合、テーマに基づいて生成
    if (titles.length < 3) {
      const fallbackTitles = generateFallbackTitles(theme, mood, content)
      while (titles.length < 3 && fallbackTitles.length > 0) {
        const fallback = fallbackTitles.shift()
        if (fallback && !titles.includes(fallback)) {
          titles.push(fallback)
        }
      }
    }
    
    // 確実に3つのタイトルを保証
    if (titles.length === 0) {
      titles = ['新しい歌', '心の調べ', '大切な想い']
    } else if (titles.length === 1) {
      titles.push('心の調べ', '大切な想い')
    } else if (titles.length === 2) {
      titles.push('大切な想い')
    }
    
    // 最初の3つだけを使用
    titles = titles.slice(0, 3)
    
    console.log('=== タイトル抽出デバッグ ===')
    console.log('生のAI応答（最初の1000文字）:', lyricsResponse.substring(0, 1000))
    console.log('最終タイトル:', titles)
    console.log('タイトル数:', titles.length)

    // 歌詞部分を抽出（タイトル候補セクションを除去）
    let lyrics = lyricsResponse
    
    // 「**歌詞（Sunoタグ付き）:**」以降の部分を抽出
    const lyricsMatch = lyricsResponse.match(/\*\*歌詞（Sunoタグ付き）:\*\*\s*\n([\s\S]+)$/s)
    if (lyricsMatch) {
      lyrics = lyricsMatch[1].trim()
    } else {
      // フォールバック: タイトル候補セクションを除去
      const lines = lyricsResponse.split('\n')
      const startIndex = lines.findIndex(line => 
        line.includes('[Intro]') || 
        line.includes('[Verse]') || 
        line.includes('[Pre-Chorus]') || 
        line.includes('[Chorus]')
      )
      
      if (startIndex !== -1) {
        lyrics = lines.slice(startIndex).join('\n').trim()
      }
    }
    
    // 歌詞内の装飾記号を清浄化
    lyrics = lyrics
      .replace(/🔥\s*\[Rap Verse\]\s*🔥\s*/g, '') // 🔥アイコン行全体を除去
      .replace(/^\*\*タイトル候補:\*\*[\s\S]*?(?=\[)/m, '') // タイトル候補セクションを除去
      .replace(/^\*\*歌詞（Sunoタグ付き）:\*\*\s*\n?/m, '') // ヘッダーを除去
      .trim()

    return NextResponse.json({
      titles,
      lyrics,
      styleInstruction: styleResponse.replace(/^["']|["']$/g, '').trim(),
      mode,
      settings: {
        mood,
        musicStyle,
        theme,
        vocal
      }
    })

  } catch (error) {
    console.error('歌詞生成エラー:', error)
    return NextResponse.json(
      { error: '歌詞生成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}