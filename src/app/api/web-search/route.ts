import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: 'クエリが必要です' }, { status: 400 })
    }
    
    console.log('🔍 実際のウェブ検索実行:', query)
    
    let searchResults = []
    let foundRelevantInfo = false
    
    try {
      // 高度な楽曲分析検索エンジンを直接呼び出し
      const { performAdvancedSongAnalysis } = await import('../search-engine/analysis');
      const engineData = await performAdvancedSongAnalysis(query, 'song_analysis');
      
      
      if (engineData.foundRelevantInfo) {
        searchResults = engineData.results;
        foundRelevantInfo = true;
        
        console.log('✅ 楽曲分析エンジンから有用な情報を取得:', engineData.confidence);
      } else {
        console.log('🔄 楽曲分析エンジンでも情報不足、推定分析を実行');
        foundRelevantInfo = false;
      }
      
      // engineDataからsearchResultsが既に設定されているため、この部分は不要
    } catch (error) {
      console.error('🔍 検索エラー:', error);
      searchResults = [{
        title: `${query} - 検索エラー`,
        snippet: '検索中にエラーが発生しました。既知の情報から分析を実行します。',
        url: '#',
        source: 'error'
      }];
    }
    
    const results = {
      query,
      results: searchResults,
      searchPerformed: true,
      foundRelevantInfo,
      timestamp: new Date().toISOString(),
      note: foundRelevantInfo ? 
        '検索情報に基づいた分析を実行します' : 
        'より正確な分析のため、楽曲データベースの拡張が推奨されます'
    }
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('🚨 ウェブ検索API エラー:', error)
    return NextResponse.json(
      { error: 'ウェブ検索中にエラーが発生しました' },
      { status: 500 }
    )
  }
}