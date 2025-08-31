// 楽曲分析エンジンのコア機能

export async function performAdvancedSongAnalysis(query: string, type: string) {
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
    } else {
      // スペース区切りで推測
      const words = query.split(/\s+/);
      if (words.length >= 2) {
        song = words.slice(0, -1).join(' ');
        artist = words[words.length - 1];
      }
    }
  }
  
  console.log('🎵 抽出された情報:', { song, artist });
  
  // アーティスト特徴データベース
  const artistDatabase = getArtistDatabase();
  const artistInfo = findArtistInfo(artist, artistDatabase);
  
  if (artistInfo) {
    console.log('✅ アーティスト情報が見つかりました:', artist, artistInfo.confidence);
    
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
  
  console.log('⚠️ アーティスト情報が見つかりません:', artist);
  
  // 未知のアーティストの場合の推定
  return {
    query,
    song,
    artist,
    foundRelevantInfo: false,
    confidence: 0.1,
    analysis: null,
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

interface ArtistInfo {
  genre: string;
  tempo: string;
  instruments: string;
  vocal_style: string;
  mood_tendencies: string[];
  description: string;
  confidence: number;
}

function getArtistDatabase(): Record<string, ArtistInfo> {
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
    },
    'Dragon Ash': {
      genre: 'Hip-Hop Rock',
      tempo: 'medium (85-105 BPM)',
      instruments: 'guitar, bass, drums, rap vocals, melodic vocals',
      vocal_style: 'male rap and singing, alternative style',
      mood_tendencies: ['laid-back', 'cool', 'rhythmic', 'urban'],
      description: 'ヒップホップとロックを融合したオルタナティブバンド',
      confidence: 0.8
    },
    'ブランデー戦記': {
      genre: 'Alternative Rock',
      tempo: 'medium (90-110 BPM)',
      instruments: 'guitar, bass, drums, female vocals',
      vocal_style: 'female vocals, alternative rock style',
      mood_tendencies: ['melancholic', 'alternative', 'emotional'],
      description: 'オルタナティブロックバンド、女性ボーカルの感情的な表現',
      confidence: 0.7
    },
    'RADWIMPS': {
      genre: 'Alternative Rock/Pop',
      tempo: 'medium-fast (100-130 BPM)',
      instruments: 'guitar, piano, strings, drums, orchestral elements',
      vocal_style: 'expressive male vocals, emotional range',
      mood_tendencies: ['cinematic', 'emotional', 'uplifting', 'dramatic'],
      description: 'シネマティックなロックバンド、映画音楽的な壮大なサウンド',
      confidence: 0.9
    },
    'ONE OK ROCK': {
      genre: 'Rock/Alternative Rock',
      tempo: 'fast (120-150 BPM)',
      instruments: 'electric guitar, bass, drums, powerful vocals',
      vocal_style: 'powerful male vocals, rock energy',
      mood_tendencies: ['energetic', 'powerful', 'anthemic', 'driving'],
      description: '国際的ロックバンド、エネルギッシュで力強いロックサウンド',
      confidence: 0.9
    },
    'BUMP OF CHICKEN': {
      genre: 'Alternative Rock/Pop Rock',
      tempo: 'medium (90-120 BPM)',
      instruments: 'guitar, bass, drums, melodic arrangements',
      vocal_style: 'gentle male vocals, melodic delivery',
      mood_tendencies: ['nostalgic', 'warm', 'hopeful', 'gentle'],
      description: 'メロディックロックバンド、温かみのある優しいロックサウンド',
      confidence: 0.8
    },
    'Aimer': {
      genre: 'Pop/Alternative Pop',
      tempo: 'medium (80-110 BPM)',
      instruments: 'piano, strings, guitar, orchestral elements',
      vocal_style: 'husky female vocals, emotional expression',
      mood_tendencies: ['melancholic', 'atmospheric', 'cinematic', 'emotional'],
      description: 'アニメソング界の歌姫、ハスキーで感情豊かなボーカル',
      confidence: 0.8
    }
  };
}

function findArtistInfo(artist: string, database: Record<string, ArtistInfo>): ArtistInfo | null {
  if (!artist || artist.trim() === '') return null;
  
  const artistLower = artist.toLowerCase().trim();
  
  // 直接マッチング
  for (const [key, value] of Object.entries(database)) {
    if (key.toLowerCase() === artistLower) {
      return value;
    }
  }
  
  // 部分マッチング（より厳密に）
  for (const [key, value] of Object.entries(database)) {
    if (artistLower.includes(key.toLowerCase()) && key.length > 2) {
      return { ...value, confidence: value.confidence * 0.8 };
    }
    if (key.toLowerCase().includes(artistLower) && artistLower.length > 2) {
      return { ...value, confidence: value.confidence * 0.7 };
    }
  }
  
  return null;
}