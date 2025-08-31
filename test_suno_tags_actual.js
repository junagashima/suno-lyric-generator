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
            }
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
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.write(postData);
        req.end();
    });
}

async function testSunoTagsActual() {
    const baseUrl = 'https://3001-iwtc54r4u03tkl7eyetxg-6532622b.e2b.dev';
    
    console.log('🎵 SUNOタグ生成機能の実際の動作テスト開始');
    
    // テストケース1: 通常の楽曲（ラップなし）
    const testCase1 = {
        theme: '愛の歌',
        musicStyle: 'jpop, acoustic guitar, piano, gentle, romantic',
        songLength: '3-4分',
        mood: 'romantic',
        content: '愛している人への思いを歌った楽曲',
        lyrics: `愛している人へ
あなたがそばにいるだけで
心が温かくなるよ
これからもずっと一緒にいよう`,
        rapMode: 'none',
        vocal: {
            gender: '女性（ソロ）',
            age: '20代',
            nationality: '日本',
            techniques: ['やさしい', 'エモーショナル']
        }
    };
    
    // テストケース2: 部分的にラップ
    const testCase2 = {
        theme: 'エナジェティックな楽曲',
        musicStyle: 'jpop, hip hop elements, electric guitar, drums, energetic',
        songLength: '3-4分',
        mood: 'energetic',
        content: 'エネルギッシュでラップ要素を含む楽曲',
        lyrics: `Yo, 今日は最高の日だぜ
みんなで歌おう
夢を追いかけて
Never give up, keep on going`,
        rapMode: 'partial',
        vocal: {
            gender: '男性（ソロ）',
            age: '20代',
            nationality: '日本',
            techniques: ['パワフル', 'ラップ']
        }
    };
    
    // テストケース3: フルラップ
    const testCase3 = {
        theme: 'ヒップホップ楽曲',
        musicStyle: 'hiphop, rap, heavy bass, drums, aggressive',
        songLength: '3-4分',
        mood: 'aggressive',
        content: 'フルラップによるヒップホップ楽曲',
        lyrics: `Check it out, yo listen up
俺の言葉を聞け
街を歩く度に思う
Hip hop is my life`,
        rapMode: 'full',
        vocal: {
            gender: '男性（ソロ）',
            age: '20代',
            nationality: '日本',
            techniques: ['ラップ', 'フロー']
        }
    };
    
    const testCases = [
        { name: '通常楽曲（ラップなし）', data: testCase1 },
        { name: '部分ラップ楽曲', data: testCase2 },
        { name: 'フルラップ楽曲', data: testCase3 }
    ];
    
    for (const testCase of testCases) {
        try {
            console.log(`\n📝 テスト: ${testCase.name}`);
            console.log('送信データ:', JSON.stringify(testCase.data, null, 2));
            
            const response = await makeRequest(`${baseUrl}/api/generate-lyrics`, testCase.data);
            
            console.log('✅ レスポンス受信');
            console.log('Status:', response.status);
            
            if (response.data && response.data.sunoTags) {
                console.log('🎯 生成されたSUNOタグ:', response.data.sunoTags);
                
                // タグの形式チェック
                const tags = response.data.sunoTags;
                if (tags.includes('(') || tags.includes(')')) {
                    console.log('❌ 不正な形式: 括弧が含まれています');
                } else if (tags.match(/\[.*?\]/)) {
                    console.log('❌ 不正な形式: 角括弧が含まれています');  
                } else {
                    console.log('✅ 形式チェック: 正常');
                }
                
                // 英語チェック（日本語が含まれていないか）
                if (/[ひらがなカタカナ漢字]/.test(tags)) {
                    console.log('❌ 日本語が含まれています');
                } else {
                    console.log('✅ 英語のみで構成されています');
                }
                
                // 具体的なタグの内容確認
                console.log('📋 タグ分析:');
                const tagList = tags.split(',').map(t => t.trim());
                tagList.forEach(tag => {
                    console.log(`  - ${tag}`);
                });
                
            } else {
                console.log('❌ SUNOタグが生成されていません');
                console.log('レスポンス全体:', JSON.stringify(response.data, null, 2));
            }
            
            // 1秒待機
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error('❌ エラー発生:', error.message);
        }
    }
    
    console.log('\n🎵 SUNOタグ生成機能テスト完了');
}

testSunoTagsActual().catch(console.error);