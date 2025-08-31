import React from 'react'
import { useNewArchitectureFlow } from './useNewArchitectureFlow'
import { StepIndicator } from './StepIndicator'
import { MusicInputStep } from './MusicInputStep'
import { DecomposedElementsDisplay } from './DecomposedElementsDisplay'
import { UserSettingsStep } from './UserSettingsStep'
import { FinalOutputDisplay } from './FinalOutputDisplay'

// 🎯 Phase 2B: 新アーキテクチャメイン統合コンポーネント

export function NewArchitectureMain() {
  const {
    flowState,
    executeAnalysis,
    executeDecomposition,
    updateUserSettings,
    executeFinalGeneration,
    regenerateStyle,
    resetFlow,
    isReady,
    canProceed
  } = useNewArchitectureFlow()

  // 楽曲分析実行
  const handleAnalysis = async (artist: string, song: string) => {
    try {
      const analysisResult = await executeAnalysis(artist, song)
      // 分析完了後、自動で要素分解を実行
      if (analysisResult) {
        await executeDecomposition(analysisResult)
      }
    } catch (error) {
      console.error('分析・分解処理エラー:', error)
    }
  }

  // 設定完了後の最終生成
  const handleFinalGeneration = async () => {
    if (flowState.decomposedElements && canProceed.toOutput) {
      try {
        await executeFinalGeneration(flowState.decomposedElements, flowState.userSettings)
      } catch (error) {
        console.error('最終生成エラー:', error)
      }
    }
  }

  // スタイル再生成
  const handleStyleRegeneration = async (
    reason: 'japanese_detected' | 'quality_improvement' | 'user_request' | 'optimization',
    issues?: string[]
  ) => {
    if (flowState.finalOutput) {
      try {
        await regenerateStyle(flowState.finalOutput.styleInstruction, reason, issues || [])
      } catch (error) {
        console.error('スタイル再生成エラー:', error)
      }
    }
  }

  // エラー表示コンポーネント
  const ErrorDisplay = ({ error }: { error: string }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <span className="text-red-600 text-lg mr-2">❌</span>
        <div>
          <div className="font-medium text-red-800">エラーが発生しました</div>
          <div className="text-red-700 text-sm mt-1">{error}</div>
        </div>
      </div>
      <button
        onClick={resetFlow}
        className="mt-3 text-sm text-red-600 hover:text-red-800 border border-red-300 px-3 py-1 rounded"
      >
        🔄 最初からやり直し
      </button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          🚀 新アーキテクチャ - 段階的楽曲生成システム
        </h1>
        <p className="text-gray-600 text-sm">
          楽曲分析から最終出力まで、段階的に高品質な歌詞・スタイル指示を生成します
        </p>
      </div>

      {/* ステップインジケーター */}
      <StepIndicator 
        currentStep={flowState.currentStep} 
        isLoading={flowState.isLoading} 
      />

      {/* エラー表示 */}
      {flowState.error && <ErrorDisplay error={flowState.error} />}

      {/* ステップ別コンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左カラム: 現在のステップ */}
        <div>
          {flowState.currentStep === 'input' && (
            <MusicInputStep
              onAnalyze={handleAnalysis}
              isLoading={flowState.isLoading}
            />
          )}

          {flowState.currentStep === 'analysis' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="animate-pulse text-4xl mb-4">🔍</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">楽曲分析中...</h2>
                <p className="text-gray-600">
                  AIが楽曲を分析し、SUNO要素への分解を実行しています
                </p>
              </div>
            </div>
          )}

          {flowState.currentStep === 'decompose' && flowState.decomposedElements && (
            <DecomposedElementsDisplay
              elements={flowState.decomposedElements}
              onProceed={() => {/* 自動で次のステップに進む */}}
              isLoading={flowState.isLoading}
            />
          )}

          {flowState.currentStep === 'settings' && (
            <UserSettingsStep
              settings={flowState.userSettings}
              onUpdateSettings={updateUserSettings}
              onGenerate={handleFinalGeneration}
              isLoading={flowState.isLoading}
            />
          )}

          {flowState.currentStep === 'output' && flowState.finalOutput && (
            <FinalOutputDisplay
              output={flowState.finalOutput}
              onRegenerateStyle={handleStyleRegeneration}
              onReset={resetFlow}
              isLoading={flowState.isLoading}
            />
          )}
        </div>

        {/* 右カラム: サイドバー情報 */}
        <div className="space-y-6">
          {/* 現在の状態表示 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 進行状況</h3>
            
            <div className="space-y-3">
              {/* 分析結果 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">楽曲分析</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  flowState.analysisResult ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {flowState.analysisResult ? '✅ 完了' : '⏳ 待機中'}
                </span>
              </div>

              {/* 要素分解 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">要素分解</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  flowState.decomposedElements ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {flowState.decomposedElements ? '✅ 完了' : '⏳ 待機中'}
                </span>
              </div>

              {/* ユーザー設定 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ユーザー設定</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  canProceed.toOutput ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {canProceed.toOutput ? '✅ 設定済み' : '⏳ 待機中'}
                </span>
              </div>

              {/* 最終出力 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">最終出力</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  flowState.finalOutput ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {flowState.finalOutput ? '✅ 生成済み' : '⏳ 待機中'}
                </span>
              </div>
            </div>

            {/* プログレス表示 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>全体進捗</span>
                <span>{Math.round((Object.values({
                  analysis: !!flowState.analysisResult,
                  decompose: !!flowState.decomposedElements,
                  settings: canProceed.toOutput,
                  output: !!flowState.finalOutput
                }).filter(Boolean).length / 4) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(Object.values({
                      analysis: !!flowState.analysisResult,
                      decompose: !!flowState.decomposedElements,
                      settings: canProceed.toOutput,
                      output: !!flowState.finalOutput
                    }).filter(Boolean).length / 4) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* システム情報 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ℹ️ システム情報</h3>
            
            <div className="text-sm text-gray-600 space-y-2">
              <div>• <strong>アーキテクチャ:</strong> 新システム v2.0</div>
              <div>• <strong>API使用:</strong> analyze, decompose, generate-lyrics, regenerate-style</div>
              <div>• <strong>品質保証:</strong> 自動チェック・再生成対応</div>
              <div>• <strong>日本語混入:</strong> 根本的解決済み</div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={resetFlow}
                className="w-full text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-2 rounded hover:bg-gray-50"
                disabled={flowState.isLoading}
              >
                🔄 システムリセット
              </button>
            </div>
          </div>

          {/* ヘルプ・ガイド */}
          {flowState.currentStep !== 'output' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">💡 操作ガイド</h3>
              
              <div className="text-sm text-blue-700 space-y-2">
                {flowState.currentStep === 'input' && (
                  <>
                    <div>• アーティスト名と楽曲名を正確に入力してください</div>
                    <div>• サンプル楽曲を参考に、有名な楽曲を選ぶと分析精度が向上します</div>
                  </>
                )}
                
                {flowState.currentStep === 'decompose' && (
                  <>
                    <div>• 分解された8要素を確認してください</div>
                    <div>• 不変要素は楽曲分析に基づき、可変要素は次のステップで調整可能です</div>
                  </>
                )}
                
                {flowState.currentStep === 'settings' && (
                  <>
                    <div>• 歌詞テーマと具体的な内容は必須項目です</div>
                    <div>• 英語混在レベルはターゲット層に応じて調整してください</div>
                    <div>• ラップモードは楽曲のジャンルに合わせて選択します</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}