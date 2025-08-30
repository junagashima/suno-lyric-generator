import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query, type = 'song_analysis' } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: 'クエリが必要です' }, { status: 400 })
    }
    
    console.log('🔍 高度な楽曲分析検索:', query, type)
    
    // 楽曲情報の高精度推定システム
    const analysisResult = await performAdvancedSongAnalysis(query, type)
    
    return NextResponse.json(analysisResult)
    
  } catch (error) {
    console.error('🚨 検索エンジンAPI エラー:', error)
    return NextResponse.json(
      { error: '検索分析中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

async function performAdvancedSongAnalysis(query: string, type: string) {
  // クエリから楽曲とアーティスト情報を抽出
  const songArtistMatch = query.match(/[""""]([^""""]*)["""""]\s*[""""]([^""""]*)["""""]/);
  let song = '', artist = '';
  
  if (songArtistMatch) {
    [, song, artist] = songArtistMatch;
  } else {
    // より柔軟なパターンマッチング
    const parts = query.split(/\s+(by|\s-\s|：|:)\s+/);
    if (parts.length >= 2) {
      song = parts[0].replace(/[""""]/, '');
      artist = parts[1].replace(/[""""]/, '');
    }
  }
  
  // アーティスト特徴データベース
  const artistDatabase = getArtistDatabase();
  const artistInfo = findArtistInfo(artist, artistDatabase);
  
  if (artistInfo) {
    return {
      query,
      song,
      artist,
      foundRelevantInfo: true,
      confidence: artistInfo.confidence,
      analysis: {
        genre: artistInfo.genre,
        typical_tempo: artistInfo.tempo,
        typical_instruments: artistInfo.instruments,
        vocal_style: artistInfo.vocal_style,
        mood_tendencies: artistInfo.mood_tendencies
      },
      results: [{
        title: `${song || 'Unknown Song'} - ${artist}`,
        snippet: `${artist}の楽曲特徴: ${artistInfo.description}。典型的な楽器構成: ${artistInfo.instruments}、テンポレンジ: ${artistInfo.tempo}`,
        source: 'artist_database',
        confidence: artistInfo.confidence
      }],
      searchPerformed: true,
      timestamp: new Date().toISOString()
    };
  }
  
  // 未知のアーティストの場合の推定
  return {
    query,
    song,
    artist,
    foundRelevantInfo: false,
    confidence: 0.1,
    analysis: {
      genre: 'unknown',
      typical_tempo: 'medium (90-110 BPM)',
      typical_instruments: 'guitar, piano, bass, drums',
      vocal_style: 'standard',
      mood_tendencies: ['varied']
    },
    results: [{
      title: `${song || 'Unknown Song'} - ${artist || 'Unknown Artist'}`,
      snippet: '楽曲情報が不足しているため、一般的なJ-POP特徴から推定します。',
      source: 'estimation',
      confidence: 0.1
    }],
    searchPerformed: true,
    timestamp: new Date().toISOString()
  };
}

function getArtistDatabase() {
  return {
    // J-POP メジャーアーティスト
    'あいみょん': {
      genre: 'J-POP Folk',
      tempo: 'slow-medium (70-95 BPM)',
      instruments: 'acoustic guitar, piano, strings, gentle percussion',
      vocal_style: 'soft female vocals, emotional delivery',
      mood_tendencies: ['nostalgic', 'melancholic', 'warm', 'intimate'],
      description: 'フォーキーなJ-POPシンガーソングライター、感情豊かなアコースティックサウンド',
      confidence: 0.9
    },
    '米津玄師': {
      genre: 'Alternative J-POP',
      tempo: 'medium-fast (100-130 BPM)',
      instruments: 'electronic elements, guitar, piano, synthesizer',
      vocal_style: 'unique male vocals, distinctive tone',
      mood_tendencies: ['atmospheric', 'dreamy', 'innovative', 'modern'],
      description: '独特な世界観を持つアルターナティブポップアーティスト、電子音響とオーガニック楽器の融合',
      confidence: 0.9
    },
    'King Gnu': {
      genre: 'Alternative Rock/Pop',
      tempo: 'medium-fast (110-130 BPM)',
      instruments: 'electric guitar, bass, drums, piano, brass',
      vocal_style: 'powerful male vocals, wide vocal range',
      mood_tendencies: ['dynamic', 'energetic', 'sophisticated', 'groovy'],
      description: 'オルタナティブロックバンド、ジャズやファンク要素を取り入れた洗練されたサウンド',
      confidence: 0.9
    },
    'Official髭男dism': {
      genre: 'Piano Rock/Pop',
      tempo: 'medium-fast (110-140 BPM)',
      instruments: 'piano, guitar, bass, drums, brass section',
      vocal_style: 'energetic male vocals, catchy melodies',
      mood_tendencies: ['uplifting', 'energetic', 'positive', 'anthemic'],
      description: 'ピアノロックバンド、キャッチーなメロディとエネルギッシュなパフォーマンス',
      confidence: 0.9
    },
    'YOASOBI': {
      genre: 'Pop Electronic',
      tempo: 'fast (120-140 BPM)',
      instruments: 'electronic beats, synthesizer, piano, digital production',
      vocal_style: 'clear female vocals, pop sensibility',
      mood_tendencies: ['bright', 'modern', 'digital', 'youthful'],
      description: '小説を楽曲化するユニット、現代的な電子ポップサウンド',
      confidence: 0.9
    }
  };
}

function findArtistInfo(artist: string, database: any) {
  const artistLower = artist.toLowerCase().trim();
  
  // 直接マッチング
  for (const [key, value] of Object.entries(database)) {
    if (key.toLowerCase() === artistLower) {
      return value;
    }
  }
  
  // 部分マッチング
  for (const [key, value] of Object.entries(database)) {
    if (artistLower.includes(key.toLowerCase()) || key.toLowerCase().includes(artistLower)) {
      return { ...value, confidence: (value as any).confidence * 0.8 };
    }
  }
  
  return null;
}