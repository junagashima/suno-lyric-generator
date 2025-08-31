// ブラウザでUI統合テストを実行するためのスクリプト
// このコードをブラウザのコンソールに貼り付けて実行してください

function testUIIntegration() {
    console.log('🧪 UI統合テスト開始');
    
    // 1. 新アーキテクチャが動作しているかチェック
    const newArchElement = document.querySelector('h1');
    if (newArchElement && newArchElement.textContent.includes('新アーキテクチャ')) {
        console.log('✅ 新アーキテクチャUIが動作中');
    } else {
        console.log('❌ 新アーキテクチャUIが見つからない');
    }
    
    // 2. 現在のステップをチェック
    const stepElements = document.querySelectorAll('[class*="step"], [class*="current"]');
    console.log(`📍 検出されたステップ要素数: ${stepElements.length}`);
    stepElements.forEach((el, i) => {
        console.log(`  ${i+1}. ${el.className} - ${el.textContent?.slice(0, 50)}`);
    });
    
    // 3. グリッドレイアウトをチェック
    const gridElements = document.querySelectorAll('[class*="grid"], [class*="col"]');
    console.log(`🏗️ グリッドレイアウト要素: ${gridElements.length}個`);
    gridElements.forEach((el, i) => {
        if (el.className.includes('grid') || el.className.includes('col')) {
            console.log(`  ${i+1}. ${el.tagName} - ${el.className}`);
            console.log(`     子要素数: ${el.children.length}`);
        }
    });
    
    // 4. 楽曲例示セクションを詳細チェック
    const exampleSection = document.querySelector('[class*="example"], [data-testid="example-display"]');
    if (exampleSection) {
        console.log('✅ 楽曲例示セクション発見');
        console.log('   クラス:', exampleSection.className);
        console.log('   内容プレビュー:', exampleSection.textContent?.slice(0, 100));
        
        // サンプル楽曲ボタンを探す
        const sampleButtons = exampleSection.querySelectorAll('button');
        console.log(`   ボタン数: ${sampleButtons.length}`);
        sampleButtons.forEach((btn, i) => {
            console.log(`     ${i+1}. "${btn.textContent?.trim()}" (${btn.disabled ? 'disabled' : 'active'})`);
        });
        
    } else {
        console.log('❌ 楽曲例示セクションが見つからない');
        
        // より広範囲に検索
        const textNodes = Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent && (
                el.textContent.includes('楽曲例示') || 
                el.textContent.includes('サンプル選択') ||
                el.textContent.includes('分析開始')
            )
        );
        
        console.log(`🔍 関連テキストが含まれる要素: ${textNodes.length}個`);
        textNodes.forEach((el, i) => {
            console.log(`  ${i+1}. ${el.tagName} - "${el.textContent?.slice(0, 60)}..."`);
        });
    }
    
    // 5. 右カラムのチェック
    const rightColumn = document.querySelector('.lg\\:grid-cols-2');
    if (rightColumn) {
        console.log('✅ 2カラムグリッドレイアウト発見');
        const columns = rightColumn.children;
        console.log(`   カラム数: ${columns.length}`);
        Array.from(columns).forEach((col, i) => {
            console.log(`   カラム ${i+1}: ${col.children.length}個の子要素`);
            Array.from(col.children).forEach((child, j) => {
                console.log(`     ${j+1}. ${child.tagName} (class: ${child.className})`);
            });
        });
    } else {
        console.log('❌ 2カラムレイアウトが見つからない');
    }
    
    // 6. React開発者ツールの情報
    const reactRoot = document.querySelector('#__next, [data-reactroot]');
    if (reactRoot) {
        console.log('✅ Reactルート要素発見');
        console.log('   React要素数:', reactRoot.querySelectorAll('[data-react*]').length);
    }
    
    // 7. 現在の状態についての推測
    console.log('\n🔍 分析結果:');
    
    const hasNewArch = !!document.querySelector('h1')?.textContent?.includes('新アーキテクチャ');
    const hasInputStep = !!document.querySelector('*')?.textContent?.includes('入力ステップ');
    const hasExampleText = !!document.querySelector('*')?.textContent?.includes('楽曲例示');
    
    console.log(`新アーキテクチャ動作: ${hasNewArch ? '✅' : '❌'}`);
    console.log(`入力ステップ: ${hasInputStep ? '✅' : '❌'}`);
    console.log(`楽曲例示テキスト: ${hasExampleText ? '✅' : '❌'}`);
    
    if (hasNewArch && hasExampleText) {
        console.log('💡 推測: 楽曲例示機能は実装されているが、CSS/レイアウトの問題で見えない可能性');
    } else if (hasNewArch && !hasExampleText) {
        console.log('💡 推測: currentStepが"input"以外のため、楽曲例示セクションが条件分岐で非表示');
    } else {
        console.log('💡 推測: 新アーキテクチャが動作していない、または別の問題');
    }
    
    console.log('\n🎯 UI統合テスト完了');
}

// 実行
testUIIntegration();

// フローステートをチェックする関数
function checkFlowState() {
    console.log('\n🔍 フローステート詳細チェック');
    
    // React内部の状態を推測（限定的）
    const allElements = Array.from(document.querySelectorAll('*'));
    
    // currentStepを推測
    const stepIndicators = allElements.filter(el => 
        el.textContent && (
            el.textContent.includes('楽曲分析中') ||
            el.textContent.includes('要素分解中') ||
            el.textContent.includes('設定') ||
            el.textContent.includes('出力')
        )
    );
    
    console.log('検出されたステップ関連要素:');
    stepIndicators.forEach((el, i) => {
        console.log(`  ${i+1}. "${el.textContent?.slice(0, 50)}"`);
    });
    
    // 進行状況セクションをチェック
    const progressElements = allElements.filter(el =>
        el.textContent && el.textContent.includes('進行状況')
    );
    
    if (progressElements.length > 0) {
        console.log('\n📊 進行状況セクション発見:');
        progressElements.forEach(el => {
            console.log(`内容: ${el.textContent?.slice(0, 200)}`);
        });
    }
}

checkFlowState();