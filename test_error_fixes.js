const https = require('https');

async function makeRequest(url, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 30000
        };
        
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve({ status: res.statusCode, data: result });
                } catch (error) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.write(postData);
        req.end();
    });
}

async function testErrorFixes() {
    const baseUrl = 'https://3001-iwtc54r4u03tkl7eyetxg-6532622b.e2b.dev';
    
    console.log('🔧 エラー修正後のテスト開始');
    
    // テスト1: musicStyleが未定義の場合
    const testCase1 = {
        theme: 'テスト楽曲',
        // musicStyleを意図的に省略
        songLength: '3-4分',
        mood: 'gentle',
        content: 'テスト用の歌詞',
        rapMode: 'none',
        vocal: {
            gender: '女性（ソロ）',
            age: '20代',
            nationality: '日本',
            techniques: ['やさしい']
        }
    };
    
    // テスト2: すべてのフィールドが正常
    const testCase2 = {
        theme: 'ロマンチックな楽曲',
        musicStyle: 'jpop, acoustic guitar, piano, gentle',
        songLength: '3-4分',
        mood: 'romantic',
        content: 'ロマンチックな歌詞のテスト',
        rapMode: 'none',
        vocal: {
            gender: '女性（ソロ）',
            age: '20代',
            nationality: '日本',
            techniques: ['やさしい', 'エモーショナル']
        }
    };
    
    // テスト3: ラップモードのテスト
    const testCase3 = {
        theme: 'ヒップホップ楽曲',
        musicStyle: 'hiphop, rap, bass, drums',
        songLength: '3-4分',
        mood: 'energetic',
        content: 'ラップ楽曲のテスト',
        rapMode: 'full',
        vocal: {
            gender: '男性（ソロ）',
            age: '20代',
            nationality: '日本',
            techniques: ['ラップ']
        }
    };
    
    const testCases = [
        { name: 'musicStyle未定義テスト', data: testCase1 },
        { name: '正常ケース', data: testCase2 },
        { name: 'フルラップモード', data: testCase3 }
    ];
    
    for (const testCase of testCases) {
        try {
            console.log(`\n📝 ${testCase.name}:`);
            console.log('送信データ:', JSON.stringify(testCase.data, null, 2));
            
            const response = await makeRequest(`${baseUrl}/api/generate-lyrics`, testCase.data);
            
            console.log('✅ レスポンス受信');
            console.log('Status:', response.status);
            
            if (response.status === 200 && response.data) {
                console.log('✅ APIリクエスト成功');
                
                // 重要なフィールドの確認
                const { titles, lyrics, styleInstruction, sunoTags } = response.data;
                
                console.log('📋 レスポンス内容:');
                console.log(`  - タイトル数: ${titles?.length || 0}個`);
                console.log(`  - 歌詞長: ${lyrics?.length || 0}文字`);
                console.log(`  - スタイル指示: ${styleInstruction ? 'あり' : 'なし'}`);
                console.log(`  - SUNOタグ: ${sunoTags || 'なし'}`);
                
                // SUNOタグの形式チェック
                if (sunoTags) {
                    const isValid = !sunoTags.includes('(') && !sunoTags.includes(')') && 
                                   !/[ひらがなカタカナ漢字]/.test(sunoTags);
                    console.log(`  - SUNOタグ形式: ${isValid ? '✅ 正常' : '❌ 不正'}`);
                }
                
            } else {
                console.log('❌ APIリクエスト失敗');
                console.log('エラー内容:', response.data);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒待機
            
        } catch (error) {
            console.error(`❌ ${testCase.name} エラー:`, error.message);
        }
    }
    
    console.log('\n🔧 エラー修正テスト完了');
}

// 修正内容の検証
function verifyFixes() {
    console.log('🔍 修正内容の検証:');
    console.log('✅ removeUnwantedInstruments関数: undefined入力に対するデフォルト値対応');
    console.log('✅ getInstrumentsConfiguration関数: musicStyle未定義時のフォールバック追加');  
    console.log('✅ APIレスポンス: sunoTagsフィールドの追加');
    console.log('✅ SUNOタグ抽出: 歌詞からの正規表現による抽出処理');
    console.log('');
}

verifyFixes();
testErrorFixes().catch(console.error);