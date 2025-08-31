// ボーカル設定の翻訳テスト

// translateToEnglish関数をシミュレート
function translateToEnglish(text) {
  const translations = {
    // 既存の翻訳
    '愛': 'love', '恋': 'romance', '恋愛': 'love', '友情': 'friendship',
    '家族': 'family', '希望': 'hope', '夢': 'dreams', '青春': 'youth',
    
    // ボーカル関連
    '男性ボーカル': 'male vocals', '女性ボーカル': 'female vocals',
    '男女混合': 'mixed male and female', '男女混合グループ': 'mixed gender group',
    'デュエット': 'duet', 'コーラス': 'chorus', 'ハーモニー': 'harmony',
    
    // ボーカル関連の頻出パターン追加
    '男性voice': 'male vocals',
    '女性voice': 'female vocals', 
    '男性': 'male',
    '女性': 'female',
    'voice': 'vocals',
    'ボイス': 'voice',
    '歌声': 'vocals',
    
    // 年齢・国籍
    '20代': '20s', '30代': '30s', '10代': 'teens',
    '日本': 'Japan', 'アメリカ': 'America',
    
    // テクニック
    'やさしい': 'gentle', 'パワフル': 'powerful', 'エモーショナル': 'emotional'
  };
  
  return translations[text] || text;
}

// advancedTranslateToEnglish関数をシミュレート
function advancedTranslateToEnglish(text) {
  if (!text) return 'expressive vocals';
  
  // 段階的翻訳処理
  let result = text;
  
  console.log('🔍 翻訳処理開始:', text);
  
  // 1. 複合語パターンの翻訳
  const complexPatterns = {
    '男女混合グループ voice': 'mixed gender group vocals',
    '男女混合グループ': 'mixed gender group vocals',
    '男女混合 voice': 'mixed male female vocals',
    '男女混合': 'mixed male female vocals',
    'グループ voice': 'group vocals',
    'デュエット voice': 'duet vocals',
    'デュエット': 'duet vocals'
  };
  
  // 2. 複合語パターンマッチング
  for (const [pattern, translation] of Object.entries(complexPatterns)) {
    if (result.includes(pattern)) {
      console.log(`✅ 複合語パターンマッチ: "${pattern}" → "${translation}"`);
      result = result.replace(pattern, translation);
    }
  }
  
  console.log('🔄 複合語処理後:', result);
  
  // 3. 残りの日本語を個別翻訳
  const words = result.split(/[\s,、]+/);
  const translatedWords = words.map(word => {
    const translated = translateToEnglish(word.trim());
    if (translated !== word.trim()) {
      console.log(`  📝 単語翻訳: "${word.trim()}" → "${translated}"`);
    }
    return translated;
  });
  
  result = translatedWords.join(' ');
  console.log('🔄 個別翻訳後:', result);
  
  // 4. 最終的な英語検証と調整
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(result)) {
    console.log('⚠️  まだ日本語が残っています:', result);
    // まだ日本語が残っている場合の緊急対応
    result = result
      .replace(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, 'vocals')
      .replace(/\s+/g, ' ')
      .trim();
    console.log('🔧 緊急対応後:', result);
  }
  
  const finalResult = result || 'expressive vocals';
  console.log('✅ 最終結果:', finalResult);
  return finalResult;
}

// テストケース
console.log('🧪 ボーカル翻訳テスト開始\n');

const testCases = [
  '男女混合, 20代, 日本',
  '男女混合グループ, 30代, 日本', 
  '女性（ソロ）, 20代, 日本',
  '男性（ソロ）, 20代, 日本',
  'デュエット, 20代, 日本'
];

testCases.forEach((testCase, index) => {
  console.log(`\n📝 テストケース${index + 1}: "${testCase}"`);
  const result = advancedTranslateToEnglish(testCase);
  console.log(`🎯 期待結果: 英語での適切な表現`);
  console.log(`📋 実際の結果: "${result}"`);
  console.log('---');
});

console.log('\n🎯 ボーカル翻訳テスト完了');