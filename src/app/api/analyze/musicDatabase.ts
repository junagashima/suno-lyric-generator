// 楽曲分析の精度向上のための参照データベース
export interface MusicData {
  artist: string
  vocal: '男性' | '女性' | '中性的' | '男女デュエット' | '女性デュエット' | '男性デュエット' | '女性グループ' | '男性グループ' | '男女混合グループ' | 'コーラス重視'
  vocalDetails?: string // ボーカル構成の詳細
  genre: string
  era: string
  tempo: string
  bpm?: number // BPM値
  key?: string // 音域・キー
  vocalRange?: string // ボーカル音域
  musicalFeatures?: string[] // 楽曲の特色
  commonIntervals?: string[] // 多用音程
  chord?: string[] // 主要コード進行
  structure?: string // 楽曲構成
  mood: string[]
  instruments: string[]
}

export const musicDatabase: Record<string, MusicData> = {
  // ブランデー戦記
  '赤いワインに涙が': {
    artist: 'ブランデー戦記',
    vocal: '女性',
    genre: 'ニューミュージック・フォーク',
    era: '1980年代',
    tempo: 'スローバラード',
    bpm: 65,
    key: 'Fm（ヘ短調）',
    vocalRange: '中音域中心（A3-F5）',
    musicalFeatures: ['メランコリックなメロディー', '7thコードの多用', 'テンション豊富な和声'],
    commonIntervals: ['短3度', '完全4度', '短7度'],
    chord: ['Fm-B♭m-C7-Fm', 'A♭-E♭-Fm'],
    structure: 'イントロ-Aメロ-Bメロ-サビ-間奏-Aメロ-Bメロ-サビ-アウトロ',
    mood: ['切ない', '大人っぽい', 'ノスタルジック'],
    instruments: ['アコースティックギター', 'ピアノ', 'ストリングス']
  },
  
  // あいみょん
  'マリーゴールド': {
    artist: 'あいみょん',
    vocal: '女性',
    genre: 'J-POPバラード',
    era: '2010年代',
    tempo: 'ミディアムバラード',
    bpm: 85,
    key: 'C（ハ長調）',
    vocalRange: '中音域（G3-E5）',
    musicalFeatures: ['親しみやすいメロディー', 'シンプルなコード進行', 'フォーク的な歌詞'],
    commonIntervals: ['長3度', '完全5度', '長2度'],
    chord: ['C-Am-F-G', 'Dm-G-C'],
    structure: 'イントロ-Aメロ-Bメロ-サビ-Aメロ-Bメロ-サビ-Cメロ-サビ-アウトロ',
    mood: ['温かい', '恋愛', '希望的'],
    instruments: ['アコースティックギター', 'ピアノ', 'ドラム']
  },
  
  'ハルノヒ': {
    artist: 'あいみょん',
    vocal: '女性',
    genre: 'アコースティックポップ',
    era: '2010年代',
    tempo: 'ミディアムテンポ',
    mood: ['爽やか', '青春', '前向き'],
    instruments: ['アコースティックギター', 'ハーモニカ', 'パーカッション']
  },
  
  // Official髭男dism
  'Pretender': {
    artist: 'Official髭男dism',
    vocal: '男性',
    genre: 'J-POPロック',
    era: '2010年代後半',
    tempo: 'ミディアムテンポ',
    bpm: 92,
    key: 'G（ト長調）',
    vocalRange: '中高音域（A3-A5）',
    musicalFeatures: ['ピアノ主導のアレンジ', '転調によるドラマ性', 'テンションコードの効果的使用'],
    commonIntervals: ['長3度', '完全4度', '短7度'],
    chord: ['G-Em-C-D', 'Am-D-G-C'],
    structure: 'イントロ-Aメロ-Bメロ-サビ-間奏-Aメロ-Bメロ-サビ-Cメロ-転調サビ-アウトロ',
    mood: ['切ない', '恋愛', 'ドラマチック'],
    instruments: ['ピアノ', 'エレキギター', 'ドラム', 'ベース']
  },
  
  'I LOVE...': {
    artist: 'Official髭男dism',
    vocal: '男性',
    genre: 'J-POPバラード',
    era: '2010年代後半',
    tempo: 'スローバラード',
    mood: ['感動的', '愛', '温かい'],
    instruments: ['ピアノ', 'ストリングス', 'アコースティックギター']
  },
  
  // King Gnu
  '白日': {
    artist: 'King Gnu',
    vocal: '男性',
    genre: 'オルタナティブロック',
    era: '2010年代後半',
    tempo: 'ミディアムロック',
    bpm: 136,
    key: 'Em（ホ短調）',
    vocalRange: '広音域（F#3-B5）',
    musicalFeatures: ['複雑なリズムパターン', 'モーダルな和声', '高い技術力のアレンジ'],
    commonIntervals: ['短3度', '完全5度', '短2度'],
    chord: ['Em-Am-D-G', 'C-D-Em'],
    structure: 'イントロ-Aメロ-Bメロ-サビ-間奏-Aメロ-Bメロ-サビ-ブリッジ-サビ×2-アウトロ',
    mood: ['力強い', 'ドラマチック', '感情的'],
    instruments: ['エレキギター', 'ドラム', 'ベース', 'シンセサイザー']
  },
  
  'SPECIALZ': {
    artist: 'King Gnu',
    vocal: '男性',
    genre: 'ダーク・オルタナティブロック',
    era: '2020年代',
    tempo: 'アップテンポ・疾走感',
    bpm: 128,
    key: 'Em（ホ短調）',
    vocalRange: '広音域・表現力重視（E3-B5）',
    musicalFeatures: ['ヘビーで歪んだギターリフ', '突き刺すようなドラム', '不穏なシンセアクセント', '静と動の極端な対比'],
    commonIntervals: ['短3度', '減5度（トライトーン）', '短7度'],
    chord: ['Em-Am-B7', 'C-D-Em', 'F#dim'],
    structure: 'ダークイントロ-抑制Aメロ-跳ねるBメロ-爆発サビ-不安定ブリッジ-厚みラストサビ',
    mood: ['ダーク', '緊張感', 'カオス的', '呪術的'],
    instruments: ['ヘビーエレキギター', 'シャープドラム', 'うねるベース', '不穏シンセ']
  },
  
  // 米津玄師
  'Lemon': {
    artist: '米津玄師',
    vocal: '男性',
    genre: 'J-POPバラード',
    era: '2010年代後半',
    tempo: 'スローバラード',
    bpm: 87,
    key: 'A♭（変イ長調）',
    vocalRange: '中高音域（E♭3-A♭5）',
    musicalFeatures: ['印象的なピアノフレーズ', 'ストリングスアレンジ', '繊細な転調技法'],
    commonIntervals: ['長3度', '完全5度', '長6度'],
    chord: ['A♭-Fm-D♭-E♭', 'B♭m-E♭-A♭'],
    structure: 'イントロ-Aメロ-Bメロ-サビ-間奏-Aメロ-Bメロ-サビ-Cメロ-転調サビ-アウトロ',
    mood: ['切ない', '喪失感', '美しい'],
    instruments: ['ピアノ', 'ストリングス', 'ドラム']
  },
  
  'パプリカ': {
    artist: '米津玄師',
    vocal: '男性',
    genre: 'ポップス',
    era: '2010年代後半',
    tempo: 'アップテンポ',
    mood: ['明るい', '希望的', '子供向け'],
    instruments: ['ギター', 'ドラム', 'ホーン', 'シンセサイザー']
  },
  
  // YOASOBI
  '夜に駆ける': {
    artist: 'YOASOBI',
    vocal: '女性',
    vocalDetails: 'メインボーカル女性、バックコーラス重視',
    genre: 'J-POP・エレクトロニック',
    era: '2020年代',
    tempo: 'アップテンポ',
    bpm: 130,
    key: 'G#m（嬰ト短調）',
    vocalRange: '中高音域（F#3-C#6）',
    musicalFeatures: ['EDM要素', '細かいシンセアルペジオ', '現代的なプロダクション'],
    commonIntervals: ['短3度', '完全4度', '長7度'],
    chord: ['G#m-E-B-F#', 'C#m-F#-B'],
    structure: 'イントロ-Aメロ-Bメロ-サビ-間奏-Aメロ-Bメロ-サビ-ブリッジ-ラストサビ-アウトロ',
    mood: ['疾走感', 'ドラマチック', '現代的'],
    instruments: ['シンセサイザー', 'エレクトロニック', 'ドラム']
  },
  
  // グループボーカルの例を追加
  // いきものがかり（男女混合グループ）
  'YELL': {
    artist: 'いきものがかり',
    vocal: '男女混合グループ',
    vocalDetails: 'メイン女性ボーカル、男性ハーモニー・バックコーラス',
    genre: 'J-POPバラード',
    era: '2000年代後半',
    tempo: 'ミディアムバラード',
    bpm: 76,
    key: 'F（ヘ長調）',
    vocalRange: '中音域、グループハーモニー',
    musicalFeatures: ['感動的なハーモニー', 'アコースティック主体', '卒業・応援ソング'],
    commonIntervals: ['長3度', '完全5度', '長6度'],
    chord: ['F-Dm-B♭-C', 'Am-Dm-Gm-C'],
    structure: 'イントロ-Aメロ-Bメロ-サビ-Aメロ-Bメロ-サビ-Cメロ-転調サビ×2-アウトロ',
    mood: ['希望的', '感動的', '励まし'],
    instruments: ['アコースティックギター', 'ピアノ', 'ストリングス', 'ドラム']
  },
  
  // BUMP OF CHICKEN（男性グループ）
  'チャンプ': {
    artist: 'BUMP OF CHICKEN',
    vocal: '男性グループ',
    vocalDetails: 'メインボーカル男性、グループコーラス',
    genre: 'オルタナティブロック',
    era: '2010年代',
    tempo: 'ミディアムロック',
    bpm: 140,
    key: 'D（ニ長調）',
    vocalRange: '中音域、力強い歌唱',
    musicalFeatures: ['バンドサウンド', 'メロディアス', 'エネルギッシュ'],
    commonIntervals: ['完全5度', '長3度', '完全4度'],
    chord: ['D-A-Bm-G', 'Em-A-D'],
    structure: 'イントロ-Aメロ-Bメロ-サビ-間奏-Aメロ-Bメロ-サビ-ブリッジ-サビ×2-アウトロ',
    mood: ['前向き', 'エネルギッシュ', 'バンドサウンド'],
    instruments: ['エレキギター', 'ベース', 'ドラム', 'キーボード']
  },
  
  // 宇多田ヒカル
  'First Love': {
    artist: '宇多田ヒカル',
    vocal: '女性',
    genre: 'R&Bバラード',
    era: '1990年代後半',
    tempo: 'スローバラード',
    mood: ['切ない', '初恋', '美しい'],
    instruments: ['ピアノ', 'ストリングス', 'R&Bビート']
  },
  
  'Automatic': {
    artist: '宇多田ヒカル',
    vocal: '女性',
    genre: 'R&B・ポップス',
    era: '1990年代後半',
    tempo: 'ミディアムテンポ',
    mood: ['クール', '大人っぽい', 'スタイリッシュ'],
    instruments: ['シンセサイザー', 'R&Bビート', 'ベース']
  }
}

// 楽曲名による部分マッチング検索
export function findMusicData(songTitle: string, artistName: string): MusicData | null {
  // 完全マッチを試す
  const exactMatch = musicDatabase[songTitle]
  if (exactMatch && artistName.includes(exactMatch.artist)) {
    return exactMatch
  }
  
  // 部分マッチを試す
  for (const [title, data] of Object.entries(musicDatabase)) {
    if (songTitle.includes(title) || title.includes(songTitle)) {
      if (artistName.includes(data.artist) || data.artist.includes(artistName)) {
        return data
      }
    }
  }
  
  return null
}