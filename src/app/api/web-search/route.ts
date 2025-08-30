import { NextRequest, NextResponse } from 'next/server'
import { performWebSearchAnalysis } from '../../../utils/webSearchService'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: 'クエリが必要です' }, { status: 400 })
    }
    
    console.log('🔍 実際のウェブ検索実行:', query)
    
    // 共有ウェブ検索サービスを使用
    const results = await performWebSearchAnalysis(query)
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('🚨 ウェブ検索API エラー:', error)
    return NextResponse.json(
      { error: 'ウェブ検索中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

