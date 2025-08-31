const http = require('http');

// テスト用データ
const testData = {
  rawAnalysis: {
    rawText: "J-POPバラード、感情的なメロディー、アコースティックギター、ピアノ、85BPM、温かい雰囲気",
    confidence: "medium",
    webSearchSources: []
  }
};

// API統合テスト関数
async function testIntegration() {
  console.log('🧪 新アーキテクチャ統合テスト開始\n');
  
  try {
    // Test 1: /api/decompose エンドポイント
    console.log('📝 Test 1: /api/decompose');
    const decomposeData = await makeRequest('/api/decompose', testData);
    console.log('✅ 成功:', decomposeData ? '要素分解完了' : '失敗');
    
    if (decomposeData && decomposeData.decomposedElements) {
      console.log('🎵 分解された要素:');
      Object.entries(decomposeData.decomposedElements).forEach(([key, value]) => {
        console.log(`  ${key}: ${typeof value === 'string' ? value.substring(0, 50) + '...' : value}`);
      });
    }
    
    console.log('\n');
    
    // Test 2: /api/regenerate-style エンドポイント  
    console.log('📝 Test 2: /api/regenerate-style');
    const regenerateData = await makeRequest('/api/regenerate-style', {
      decomposedElements: decomposeData?.decomposedElements || {},
      userSettings: {
        songLength: '3-4分',
        rapMode: 'none',
        language: { preference: 'japanese', englishMixLevel: 'none' },
        lyricsContent: 'テスト用の歌詞内容',
        theme: 'テスト'
      },
      currentStyle: 'test style instruction'
    });
    console.log('✅ 成功:', regenerateData ? 'スタイル再生成完了' : '失敗');
    
    if (regenerateData) {
      console.log('🎨 再生成結果:', regenerateData.newStyleInstruction?.substring(0, 100) + '...');
    }
    
  } catch (error) {
    console.error('❌ 統合テストエラー:', error.message);
  }
}

// HTTP リクエスト関数
function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const jsonData = JSON.parse(responseBody);
            resolve(jsonData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseBody}`));
          }
        } catch (error) {
          reject(new Error(`JSON Parse Error: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// テスト実行
testIntegration();
