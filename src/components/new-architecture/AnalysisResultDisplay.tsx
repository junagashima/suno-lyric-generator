import React from 'react'
import { RawAnalysisResult } from '@/types/analysis'

// 🎯 Step 1: 楽曲分析結果表示コンポーネント

interface AnalysisResultDisplayProps {
  analysisResult: RawAnalysisResult
  onProceed: () => void
  isLoading?: boolean
}

export function AnalysisResultDisplay({ 
  analysisResult, 
  onProceed, 
  isLoading = false 
}: AnalysisResultDisplayProps) {
  
  // 分析結果から主要情報を抽出
  const extractAnalysisInfo = (rawText: string) => {
    // 簡単な情報抽出（後で改善可能）
    const lines = rawText.split('\n').filter(line => line.trim())
    
    return {
      genre: extractField(rawText, ['ジャンル', 'Genre', 'style']) || '判定中...',
      tempo: extractField(rawText, ['テンポ', 'Tempo', 'BPM']) || '分析中...',
      mood: extractField(rawText, ['雰囲気', 'Mood', 'atmosphere']) || '解析中...',
      structure: extractField(rawText, ['構成', 'Structure', 'format']) || '確認中...',
      instruments: extractField(rawText, ['楽器', 'Instruments', 'instrumentation']) || '識別中...'
    }
  }

  // フィールド抽出ヘルパー
  const extractField = (text: string, keywords: string[]): string | null => {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[：:：\\s]*([^\\n。．]+)`, 'i')
      const match = text.match(regex)
      if (match) {
        return match[1].trim()
      }
    }
    return null
  }

  const analysis = extractAnalysisInfo(analysisResult.rawText)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
          🔍 楽曲分析完了
          <span className={`ml-3 text-xs px-2 py-1 rounded-full ${
            analysisResult.confidence === 'high' ? 'bg-green-100 text-green-800' :
            analysisResult.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            信頼度: {analysisResult.confidence === 'high' ? '高' : analysisResult.confidence === 'medium' ? '中' : '低'}
          </span>
        </h2>
        <p className="text-gray-600 text-sm">
          AIによる楽曲分析が完了しました。以下の特徴が検出されました。
        </p>
      </div>

      {/* 分析結果の表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-4">
          {/* ジャンル */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-blue-600 text-lg mr-2">🎭</span>
              <h3 className="font-medium text-blue-800">ジャンル判定</h3>
            </div>
            <p className="text-blue-900 font-semibold">{analysis.genre}</p>
          </div>

          {/* テンポ */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-green-600 text-lg mr-2">⏱️</span>
              <h3 className="font-medium text-green-800">テンポ・リズム</h3>
            </div>
            <p className="text-green-900">{analysis.tempo}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* 雰囲気 */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-purple-600 text-lg mr-2">💫</span>
              <h3 className="font-medium text-purple-800">雰囲気・ムード</h3>
            </div>
            <p className="text-purple-900">{analysis.mood}</p>
          </div>

          {/* 楽器構成 */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-orange-600 text-lg mr-2">🎸</span>
              <h3 className="font-medium text-orange-800">楽器構成</h3>
            </div>
            <p className="text-orange-900">{analysis.instruments}</p>
          </div>
        </div>
      </div>

      {/* 楽曲構成 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-2">
          <span className="text-gray-600 text-lg mr-2">🏗️</span>
          <h3 className="font-medium text-gray-800">楽曲構成</h3>
        </div>
        <p className="text-gray-900">{analysis.structure}</p>
      </div>

      {/* 情報源表示 */}
      {analysisResult.webSearchSources && analysisResult.webSearchSources.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-blue-800 mb-2">📚 参照情報源</h4>
          <div className="space-y-1">
            {analysisResult.webSearchSources.slice(0, 3).map((source, index) => (
              <div key={index} className="text-xs text-blue-700 truncate">
                • {source}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 次のステップボタン */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={onProceed}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              要素分解中...
            </>
          ) : (
            <>
              🔧 SUNO要素への分解に進む
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-2">
          この分析結果をもとに、SUNO AI用の要素に分解します
        </p>
      </div>

      {/* 詳細情報（折りたたみ） */}
      <div className="mt-4">
        <details className="cursor-pointer">
          <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
            🔍 詳細な分析結果を表示
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              {analysisResult.rawText}
            </pre>
          </div>
        </details>
      </div>
    </div>
  )
}