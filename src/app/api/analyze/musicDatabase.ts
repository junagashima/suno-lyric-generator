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
  // Dragon Ash - ヒップホップ系
  'Grateful Days': {
    artist: 'Dragon Ash',
    vocal: '男性',
    vocalDetails: 'Kj (降谷建志) - メロディー＋ラップの融合スタイル',
    genre: 'ミクスチャー・ロック、ヒップホップ、J-Rock',
    era: '1999年（平成11年）',
    tempo: 'ミディアムテンポ、グルーヴ重視',
    bpm: 95,
    key: 'Em（ホ短調）',
    vocalRange: '中音域メイン（E3-B4）、ラップパートは会話的',
    musicalFeatures: [
      'メロディーとラップの自然な融合',
      '夏感・爽快感のあるサウンド',
      'ライブ楽器中心のオーガニックサウンド',
      '90年代後期ミクスチャーロックの代表作'
    ],
    commonIntervals: ['完全4度', '短3度', '完全5度'],
    chord: ['Em', 'C', 'G', 'D', 'Am'],
    structure: 'Intro → Verse(rap) → Chorus(melody) → Verse(rap) → Chorus → Bridge → Chorus → Outro',
    mood: ['nostalgic', 'uplifting', 'summer', 'energetic', 'positive'],
    instruments: ['electric guitar', 'bass guitar', 'live drums', 'minimal synth']
  },

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
    musicalFeatures: ['哀愁のあるメロディー', '80年代ニューミュージック'],
    chord: ['Fm', 'Bb', 'Eb', 'Ab'],
    mood: ['melancholic', 'nostalgic', 'bittersweet'],
    instruments: ['acoustic guitar', 'piano', 'strings', 'soft percussion']
  },

  // 呪術廻戦OP
  'SPECIALZ': {
    artist: 'King Gnu',
    vocal: '男性',
    genre: 'オルタナティブロック・ダークポップ',
    era: '2023年',
    tempo: 'ミディアムファスト、ダイナミック',
    bpm: 128,
    key: 'Dm（ニ短調）',
    vocalRange: '中低音域〜高音域（C3-G5）',
    musicalFeatures: ['ダークで重厚なサウンド', 'アニメOP特化', '緊張感のある展開'],
    chord: ['Dm', 'Bb', 'F', 'C', 'Gm'],
    mood: ['dark', 'intense', 'dramatic'],
    instruments: ['heavy guitar', 'driving bass', 'powerful drums', 'dark synth']
  }
}