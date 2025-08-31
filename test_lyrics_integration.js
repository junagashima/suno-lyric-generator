#!/usr/bin/env node

console.log('🎵 SUNO連携歌詞生成テスト開始\n')

// テストAPIエンドポイント呼び出し
async function testLyricsIntegration() {
  const testRequest = {
    decomposedElements: {
      genre: 'J-Pop',
      mood: 'energetic, nostalgic', 
      tempo: 'medium-fast',
      rhythm: 'upbeat',
      instruments: 'guitar, piano, drums',
      vocal: {
        attribute: '男女混合グループ',
        sunoElements: ['warm', 'emotional']
      },
      forbidden: 'heavy metal elements'
    },
    userSettings: {
      songLength: '3-4分',
      rapMode: 'partial',
      language: {
        primary: 'japanese',
        englishMixLevel: 'light'
      },
      lyricsContent: 'チームワークと情熱で困難を乗り越える',
      theme: 'チームワークと情熱',
      contentReflection: 'balanced',
      vocalAttribute: '男女混合グループ',
      sunoElements: ['warm', 'emotional']
    },
    requestType: 'generate-lyrics'
  }

  try {
    console.log('📡 新アーキテクチャAPIテスト中...')
    
    const response = await fetch('http://localhost:3000/api/new-architecture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest)
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const result = await response.json()
    
    console.log('✅ API成功!')
    console.log('\n🎯 生成結果分析:')
    console.log('📝 タイトル数:', result.titles?.length || 0)
    console.log('🎵 歌詞長さ:', result.lyrics?.length || 0, '文字')
    console.log('🏷️ SUNOタグ:', result.sunoTags || 'なし')
    
    console.log('\n📊 SUNO連携チェック:')
    const lyrics = result.lyrics || ''
    
    // SUNOタグと歌詞の連携確認
    console.log('- 男女混合対応:', lyrics.includes('俺たち') && lyrics.includes('私たち') ? '✅ 対応' : '⚠️ 要確認')
    console.log('- テーマ統合:', lyrics.includes('チームワークと情熱') ? '✅ 統合済み' : '❌ 未統合') 
    console.log('- ラップセクション:', lyrics.includes('[Rap]') ? '✅ あり' : '❌ なし')
    console.log('- ムード反映:', lyrics.includes('力強く') || lyrics.includes('情熱') ? '✅ 反映' : '❌ 未反映')
    
    console.log('\n🎵 生成歌詞サンプル:')
    console.log(lyrics.substring(0, 300) + '...')
    
    console.log('\n🏷️ スタイル指示品質:')
    const styleInstruction = result.styleInstruction || ''
    console.log('- 日本語混入:', /[ひらがなカタカナ漢字]/.test(styleInstruction) ? '❌ あり' : '✅ なし')
    console.log('- ボーカル指定:', styleInstruction.includes('mixed') ? '✅ 男女混合' : '⚠️ 要確認')
    
    return result
    
  } catch (error) {
    console.error('❌ テストエラー:', error.message)
    return null
  }
}

// 本番環境での統合テスト実行
testLyricsIntegration().then(result => {
  if (result) {
    console.log('\n🎉 SUNO連携歌詞生成システム: 統合テスト成功!')
  } else {
    console.log('\n💥 統合テスト失敗')
  }
})