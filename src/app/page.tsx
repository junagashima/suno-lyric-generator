'use client'

import { useState } from 'react'
import { SongGeneratorForm } from '@/components/SongGeneratorForm'
import { ResultDisplay } from '@/components/ResultDisplay'
import { GuideSection } from '@/components/GuideSection'
import { FAQSection } from '@/components/FAQSection'
// 🎯 Phase 2B: 新アーキテクチャ統合
import { NewArchitectureMain } from '@/components/new-architecture/NewArchitectureMain'

export default function Home() {
  const [generatedData, setGeneratedData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [useNewArchitecture, setUseNewArchitecture] = useState(false)

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* ヘッダー */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🎵 Suno AI 歌詞・スタイル生成ツール
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          AIを活用してSuno AIで使用する歌詞とスタイル指示を生成します。<br/>
          {useNewArchitecture ? (
            <>新アーキテクチャによる段階的・高品質な楽曲生成システムです。</>
          ) : (
            <>簡単モードと、こだわりモードの2つの方法で楽曲制作をサポートします。</>
          )}
        </p>
        
        {/* アーキテクチャ切り替えボタン */}
        <div className="mt-6 flex justify-center">
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">システム選択:</span>
            <button
              onClick={() => setUseNewArchitecture(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !useNewArchitecture 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📝 従来システム
            </button>
            <button
              onClick={() => setUseNewArchitecture(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                useNewArchitecture 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🚀 新アーキテクチャ
            </button>
          </div>
        </div>
        
        {useNewArchitecture && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-green-800">
              ✨ <strong>新アーキテクチャの特徴:</strong> 日本語混入問題の根本解決、段階的品質向上、SUNO最適化
            </p>
          </div>
        )}
      </header>

      {/* メインコンテンツ */}
      {useNewArchitecture ? (
        /* 新アーキテクチャ */
        <div className="space-y-8">
          <NewArchitectureMain onComplete={setGeneratedData} />
          
          {/* 生成結果が存在する場合は従来の結果表示を使用 */}
          {generatedData && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🎵 生成結果</h2>
              <ResultDisplay 
                data={generatedData}
                isLoading={isLoading}
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