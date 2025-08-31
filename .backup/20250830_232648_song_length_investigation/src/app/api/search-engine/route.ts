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

import { performAdvancedSongAnalysis } from './analysis'

// performAdvancedSongAnalysis関数はanalysis.tsから直接インポート