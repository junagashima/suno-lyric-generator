'use client'

import { useState } from 'react'
import { SongGeneratorForm } from '@/components/SongGeneratorForm'
import { ResultDisplay } from '@/components/ResultDisplay'
import { EditableResultDisplay } from '@/components/EditableResultDisplay'
import { GuideSection } from '@/components/GuideSection'
import { FAQSection } from '@/components/FAQSection'
// 🎯 Phase 2B: 新アーキテクチャ統合
import { NewArchitectureMain } from '@/components/new-architecture/NewArchitectureMain'

export default function Home() {
  const [generatedData, setGeneratedData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // 🎯 Phase C: 新アーキテクチャをデフォルト、レガシーは開発者専用
  const [useNewArchitecture, setUseNewArchitecture] = useState(true)
  const [developerMode, setDeveloperMode] = useState(false)
  
  // 開発者モード切り替え（隠し機能）
  const toggleDeveloperMode = (event: React.KeyboardEvent) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      setDeveloperMode(!developerMode)
      console.log(`🔧 開発者モード: ${!developerMode ? 'ON' : 'OFF'}`)
    }
  }

  return (
    <main 
      className="container mx-auto px-4 py-8 max-w-6xl"
      tabIndex={0}
      onKeyDown={toggleDeveloperMode}
    >
      {/* ヘッダー */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🎵 Suno AI 歌詞・スタイル生成ツール
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          AIを活用してSuno AIで使用する歌詞とスタイル指示を生成します。<br/>
          {developerMode ? (
            <>🔧 <strong>開発者モード:</strong> 新アーキテクチャ・従来システム切り替え可能 (Ctrl+Shift+D で切り替え)</>
          ) : (
            <>✨ 段階的・高品質な楽曲生成システムで、楽曲分析から歌詞・スタイル生成まで完全サポート</>
          )}
        </p>
        
        {/* 🎯 Phase C: 開発者モードでのみアーキテクチャ切り替えボタン表示 */}
        {developerMode && (
          <div className="mt-6 flex justify-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md p-4">
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-sm font-medium text-gray-700">🔧 開発者システム選択:</span>
                <button
                  onClick={() => setUseNewArchitecture(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    useNewArchitecture 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🚀 新アーキテクチャ（推奨）
                </button>
                <button
                  onClick={() => setUseNewArchitecture(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    !useNewArchitecture 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📝 従来システム（デバッグ用）
                </button>
              </div>
              <p className="text-xs text-yellow-700">
                ⚠️ 開発者専用機能 - 一般ユーザーには新アーキテクチャのみ表示
              </p>
            </div>
          </div>
        )}
        
        {/* 🎯 Phase C: ステータス表示 - 一般ユーザー向けは常に新アーキテクチャ */}
        <div className={`mt-4 p-3 rounded-lg max-w-2xl mx-auto ${
          developerMode ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
        }`}>
          <p className={`text-sm ${developerMode ? 'text-yellow-800' : 'text-green-800'}`}>
            {developerMode ? (
              // 開発者モード表示
              useNewArchitecture ? (
                <>🚀 <strong>新アーキテクチャ (開発者確認):</strong> 完全独立・5ステップフロー・SUNO最適化</>
              ) : (
                <>📝 <strong>従来システム (開発者デバッグ):</strong> レガシーAPI・一発生成モード</>
              )
            ) : (
              // 一般ユーザー表示 (常に新アーキテクチャ)
              <>✨ <strong>高品質楽曲生成システム:</strong> 楽曲分析→要素分解→設定調整→生成→編集の完全フロー</>
            )}
          </p>
          {developerMode && (
            <p className="text-xs text-gray-600 mt-1">
              開発者モード有効 | 新アーキテクチャAPI: /api/new-architecture | レガシーAPI: /api/generate-lyrics
            </p>
          )}
        </div>
      </header>

      {/* 🎯 Phase C: メインコンテンツ - 一般ユーザーは常に新アーキテクチャ */}
      {(useNewArchitecture || !developerMode) ? (
        /* 新アーキテクチャ */
        <div className="space-y-8">
          <NewArchitectureMain onComplete={setGeneratedData} />
          
          {/* 生成結果が存在する場合は編集可能な結果表示を使用 */}
          {generatedData && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <EditableResultDisplay 
                data={generatedData}
                isLoading={isLoading}
                onUpdateData={setGeneratedData}
              />
            </div>
          )}
        </div>
      ) : (
        /* 従来システム */
        <>
          {/* ガイドセクション */}
          <GuideSection />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* 入力フォーム */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <SongGeneratorForm 
                onGenerate={setGeneratedData}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>

            {/* 結果表示 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ResultDisplay 
                data={generatedData}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* FAQセクション */}
          <FAQSection />
        </>
      )}
    </main>
  )
}