// 🚨 緊急修正テスト - 致命的問題の修正確認

async function testEmergencyFixes() {
  console.log('🚨 緊急修正テスト開始\n')
  
  const testPayload = {
    decomposedElements: {
      genre: "チームワークと情熱",
      mood: "nostalgic and uplifting",
      tempo: "medium",
      rhythm: "steady beat",
      instruments: "electric guitar, bass guitar, live drums, electric piano",
      vocal: {
        attribute: "male vocal",
        sunoElements: ["energetic", "positive"]
      }
    },
    userSettings: {
      songLength: "3-4分",
      rapMode: "none",
      language: {
        primary: "japanese",
        englishMixLevel: "none"
      },
      lyricsContent: "チームワークと情熱をテーマとした歌詞",
      theme: "チームワークと情熱",
      contentReflection: "balanced"
    },
    requestType: "generate-lyrics"
  }

  try {
    console.log('🔧 修正後の新アーキテクチャAPIテスト')
    
    const response = await fetch('http://localhost:3000/api/new-architecture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    })

    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`)
    }

    const result = await response.json()
    
    console.log('\n📊 修正結果確認:')
    console.log(`✅ API成功: ${result.success}`)
    console.log(`📝 タイトル数: ${result.titles?.length}個 (期待値: 3個)`)
    console.log(`🎵 歌詞内容: ${result.lyrics ? '生成済み' : '未生成'}`)
    console.log(`🎯 スタイル指示: ${result.styleInstruction ? '生成済み' : '未生成'}`)
    
    console.log('\n🎯 生成内容詳細:')
    console.log('タイトル:')
    result.titles?.forEach((title, i) => {
      console.log(`   ${i+1}. ${title}`)
    })
    
    console.log('\n歌詞サンプル:')
    console.log((result.lyrics || '').substring(0, 150) + '...')
    
    console.log('\nSUNOタグ:')
    console.log(result.sunoTags || 'N/A')
    
    // 問題チェック
    const issues = []
    if (result.titles?.length !== 3) {
      issues.push(`タイトル数異常: ${result.titles?.length}個 (期待値: 3個)`)
    }
    if (!result.lyrics || result.lyrics.includes('[開発中]')) {
      issues.push('歌詞生成失敗または開発中表示')
    }
    if (!result.styleInstruction) {
      issues.push('スタイル指示未生成')
    }
    if (result.sunoTags && result.sunoTags.includes('rockl')) {
      issues.push('SUNOタグに不正形式含有')
    }
    
    console.log('\n🔍 問題チェック結果:')
    if (issues.length === 0) {
      console.log('✅ 全ての修正が成功')
    } else {
      console.log('❌ 残存問題:')
      issues.forEach(issue => console.log(`   - ${issue}`))
    }
    
    return {
      success: result.success,
      titlesCount: result.titles?.length,
      hasLyrics: !!result.lyrics && !result.lyrics.includes('[開発中]'),
      hasStyle: !!result.styleInstruction,
      issues: issues.length
    }
    
  } catch (error) {
    console.error('❌ テストエラー:', error.message)
    return { error: error.message }
  }
}

// 実行
(async () => {
  try {
    const result = await testEmergencyFixes()
    
    console.log('\n🎯 緊急修正結果:')
    if (result.error) {
      console.log('❌ テスト失敗:', result.error)
    } else if (result.issues === 0) {
      console.log('🎉 全問題修正完了!')
    } else {
      console.log('⚠️ 一部問題残存 - 追加修正が必要')
    }
    
  } catch (error) {
    console.error('❌ 緊急修正テスト実行エラー:', error.message)
  }
})()