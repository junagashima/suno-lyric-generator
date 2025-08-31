'use client'

import { useState } from 'react'
import { SongGeneratorForm } from '@/components/SongGeneratorForm'
import { ResultDisplay } from '@/components/ResultDisplay'
import { GuideSection } from '@/components/GuideSection'
import { FAQSection } from '@/components/FAQSection'

export default function Home() {
  const [generatedData, setGeneratedData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* ヘッダー */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🎵 Suno AI 歌詞・スタイル生成ツール
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          AIを活用してSuno AIで使用する歌詞とスタイル指示を生成します。<br/>
          簡単モードと、こだわりモードの2つの方法で楽曲制作をサポートします。
        </p>
      </header>

      {/* ガイドセクション */}
      <GuideSection />

      {/* メインコンテンツ */}
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
    </main>
  )
}