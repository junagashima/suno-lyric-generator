// 楽曲分析の精度向上のための参照データベース
export interface MusicData {
  artist: string
  vocal: '男性' | '女性' | 'デュエット' | 'グループ'
  genre: string
  era: string
  tempo: string
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
    mood: ['力強い', 'ドラマチック', '感情的'],
    instruments: ['エレキギター', 'ドラム', 'ベース', 'シンセサイザー']
  },
  
  // 米津玄師
  'Lemon': {
    artist: '米津玄師',
    vocal: '男性',
    genre: 'J-POPバラード',
    era: '2010年代後半',
    tempo: 'スローバラード',
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
    genre: 'J-POP・エレクトロニック',
    era: '2020年代',
    tempo: 'アップテンポ',
    mood: ['疾走感', 'ドラマチック', '現代的'],
    instruments: ['シンセサイザー', 'エレクトロニック', 'ドラム']
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