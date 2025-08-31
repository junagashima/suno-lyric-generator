// 🧪 decompose API テスト用スクリプト
// Node.js環境で実行してAPIをテスト

const testRawAnalysis = {
  rawText: "この楽曲はあいみょんの代表作の一つで、アコースティックギター中心の温かみのあるポップバラード。ミディアムテンポで優しいリズム、ノスタルジックで温かい雰囲気。楽曲構成はイントロ→Aメロ→サビ→Aメロ→サビ→Cメロ→サビ→アウトロ。女性ボーカルによる感情豊かで透明感のある歌声が特徴。ドラムとベースが程よくサポートし、ストリングスが楽曲に深みを添える。",
  confidence: "high",
  webSearchSources: ["https://example.com/aimyon-marigold"],
  analysisTimestamp: new Date().toISOString()
}

async function testDecomposeAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/decompose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rawAnalysis: testRawAnalysis
      })
    })

    const result = await response.json()
    console.log('🎯 Decompose API テスト結果:')
    console.log(JSON.stringify(result, null, 2))
    
  } catch (error) {
    console.error('❌ テストエラー:', error)
  }
}

// 使用方法:
// 1. サーバー起動: npm run dev
// 2. 別ターミナルで: node test_decompose.js

console.log('📋 テストデータ準備完了')
console.log('実行するには: testDecomposeAPI() を呼び出してください')

module.exports = { testDecomposeAPI, testRawAnalysis }