// SUNOタグ生成関数の単体テスト

// 🎯 Phase 2A: SUNOジャンルタグ生成関数
// SUNOルールに完全準拠したジャンルタグを生成
function generateGenreTags(elements, settings) {
  const tags = []
  
  // ラップモード対応
  if (settings.rapMode === 'full') {
    tags.push('hiphop', 'rap', 'japanese rap')
  } else if (settings.rapMode === 'partial') {
    tags.push('jpop', 'rap elements', 'hip hop fusion')
  } else {
    // ジャンルベースのタグ生成
    const genre = elements.genre.toLowerCase()
    if (genre.includes('pop')) {
      tags.push('jpop', 'japanese pop')
    } else if (genre.includes('rock')) {
      tags.push('jrock', 'japanese rock')  
    } else if (genre.includes('ballad')) {
      tags.push('jpop', 'ballad', 'emotional')
    } else {
      tags.push('jpop') // デフォルト
    }
  }
  
  // ムードタグ追加
  const mood = elements.mood.toLowerCase()
  if (mood.includes('energetic')) tags.push('energetic')
  if (mood.includes('gentle')) tags.push('gentle')
  if (mood.includes('nostalgic')) tags.push('nostalgic')
  
  // タグを[]形式で結合
  const tagString = tags.map(tag => `[${tag}]`).join('')
  return `${tagString}\n\n`
}

// テスト実行
console.log('🧪 SUNOタグ生成関数の単体テスト開始\n')

// テストケース1: 通常楽曲（ラップなし）
console.log('📝 テストケース1: 通常楽曲（ラップなし）')
const testCase1 = {
  elements: {
    genre: 'jpop',
    mood: 'gentle'
  },
  settings: {
    rapMode: 'none'
  }
}

const result1 = generateGenreTags(testCase1.elements, testCase1.settings)
console.log('結果:', result1)
console.log('期待される要素: jpop, japanese pop, gentle')
console.log('✅ ラップ要素なし:', !result1.includes('rap'))
console.log('✅ 角括弧形式:', result1.includes('[jpop]'))
console.log('')

// テストケース2: 部分ラップ楽曲
console.log('📝 テストケース2: 部分ラップ楽曲')
const testCase2 = {
  elements: {
    genre: 'jpop',
    mood: 'energetic'
  },
  settings: {
    rapMode: 'partial'
  }
}

const result2 = generateGenreTags(testCase2.elements, testCase2.settings)
console.log('結果:', result2)
console.log('期待される要素: jpop, rap elements, hip hop fusion, energetic')
console.log('✅ ラップ要素含有:', result2.includes('rap elements'))
console.log('✅ フュージョン要素:', result2.includes('hip hop fusion'))
console.log('')

// テストケース3: フルラップ楽曲
console.log('📝 テストケース3: フルラップ楽曲')
const testCase3 = {
  elements: {
    genre: 'hiphop',
    mood: 'aggressive'
  },
  settings: {
    rapMode: 'full'
  }
}

const result3 = generateGenreTags(testCase3.elements, testCase3.settings)
console.log('結果:', result3)
console.log('期待される要素: hiphop, rap, japanese rap')
console.log('✅ フルラップ:', result3.includes('[hiphop]') && result3.includes('[rap]'))
console.log('✅ Japanese rap:', result3.includes('[japanese rap]'))
console.log('')

// SUNOタグ規則チェック関数
function checkSunoTagRules(tags) {
  console.log('🔍 SUNOタグ規則チェック:')
  
  // 禁止パターンチェック
  const forbiddenPatterns = [
    { pattern: /\[.*?\(.*?\).*?\]/, name: '括弧説明付きタグ（例：[Verse 1 (Rap)]）' },
    { pattern: /\[.*?(説明|Rap|ラップ)\]/, name: '日本語説明タグ' },
    { pattern: /[ひらがなカタカナ漢字]/, name: '日本語文字' }
  ]
  
  let isValid = true
  forbiddenPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(tags)) {
      console.log(`❌ 禁止パターン検出: ${name}`)
      isValid = false
    } else {
      console.log(`✅ ${name}: OK`)
    }
  })
  
  // 推奨パターンチェック
  const recommendedPatterns = [
    { pattern: /\[[a-z\s]+\]/g, name: '小文字英語タグ形式' },
    { pattern: /\]\[/, name: '連続タグ形式' }
  ]
  
  recommendedPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(tags)) {
      console.log(`✅ 推奨パターン: ${name}`)
    }
  })
  
  return isValid
}

console.log('=== 全テストケースのSUNO規則チェック ===\n')

console.log('テストケース1のチェック:')
checkSunoTagRules(result1)
console.log('')

console.log('テストケース2のチェック:')
checkSunoTagRules(result2)
console.log('')

console.log('テストケース3のチェック:')
checkSunoTagRules(result3)
console.log('')

console.log('🎯 SUNOタグ生成関数の単体テスト完了')

// 実際の使用例のシミュレーション
console.log('\n=== 実際の使用例シミュレーション ===')

function simulateActualUsage() {
  const actualCases = [
    {
      name: 'バラード楽曲',
      elements: { genre: 'ballad', mood: 'nostalgic' },
      settings: { rapMode: 'none' }
    },
    {
      name: 'ロック楽曲', 
      elements: { genre: 'rock', mood: 'energetic' },
      settings: { rapMode: 'none' }
    },
    {
      name: 'Dragon Ash風楽曲',
      elements: { genre: 'jpop', mood: 'energetic' },
      settings: { rapMode: 'partial' }
    }
  ]
  
  actualCases.forEach(testCase => {
    console.log(`\n🎵 ${testCase.name}:`)
    const result = generateGenreTags(testCase.elements, testCase.settings)
    console.log(`生成タグ: ${result.trim()}`)
    
    // タグをカンマ区切り形式に変換（実際のSUNO入力用）
    const sunoFormat = result.replace(/\]\[/g, '], [').replace(/\n\n/, '')
    console.log(`SUNO入力形式: ${sunoFormat}`)
  })
}

simulateActualUsage();