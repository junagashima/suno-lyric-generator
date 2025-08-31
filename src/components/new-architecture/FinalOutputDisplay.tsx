import React, { useState } from 'react'
import { FinalOutput } from '@/types/analysis'

// 🎯 Phase 2B: 新アーキテクチャ用最終出力表示コンポーネント

interface FinalOutputDisplayProps {
  output: FinalOutput
  onRegenerateStyle: (reason: 'japanese_detected' | 'quality_improvement' | 'user_request' | 'optimization', issues?: string[]) => Promise<void>
  onReset: () => void
  isLoading: boolean
}

export function FinalOutputDisplay({ 
  output, 
  onRegenerateStyle, 
  onReset, 
  isLoading 
}: FinalOutputDisplayProps) {
  const [activeTab, setActiveTab] = useState<'titles' | 'lyrics' | 'style'>('titles')
  const [showRegenerateOptions, setShowRegenerateOptions] = useState(false)

  // スタイル指示の品質チェック結果を表示
  const getQualityBadge = () => {
    if (!output.qualityCheck) return null

    const { confidence, hasJapanese, issues } = output.qualityCheck

    if (hasJapanese || issues.length > 0) {
      return (
        <div className="flex items-center space-x-2">
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            ⚠️ 問題検出
          </span>
          {hasJapanese && (
            <span className="text-xs text-red-600">日本語混入</span>
          )}
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-2">
        <span className={`text-xs px-2 py-1 rounded-full ${
          confidence === 'high' ? 'bg-green-100 text-green-800' :
          confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {confidence === 'high' ? '✅ 高品質' :
           confidence === 'medium' ? '🔍 標準' : '⚠️ 要改善'}
        </span>
      </div>
    )
  }

  // タイトルコピー機能
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // TODO: トースト通知を実装
      console.log(`${type}をコピーしました`)
    } catch (error) {
      console.error('コピーに失敗しました:', error)
    }
  }

  // スタイル再生成処理
  const handleRegenerateStyle = async (
    reason: 'japanese_detected' | 'quality_improvement' | 'user_request' | 'optimization',
    issues?: string[]
  ) => {
    setShowRegenerateOptions(false)
    await onRegenerateStyle(reason, issues)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            🎤 生成完了
          </h2>
          <div className="flex items-center space-x-3">
            {getQualityBadge()}
            <button
              onClick={onReset}
              className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              🔄 最初から
            </button>
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          歌詞とスタイル指示の生成が完了しました。タブを切り替えて内容を確認してください。
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'titles', label: 'タイトル候補', icon: '📝' },
            { id: 'lyrics', label: '歌詞', icon: '🎵' },
            { id: 'style', label: 'スタイル指示', icon: '🎨' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* タイトル候補表示 */}
      {activeTab === 'titles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">📝 タイトル候補</h3>
            <span className="text-sm text-gray-500">{output.titles.length}個生成</span>
          </div>
          <div className="space-y-3">
            {output.titles.map((title, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-gray-900 font-medium">{title}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(title, 'タイトル')}
                  className="text-xs text-blue-600 hover:text-blue-800 border border-blue-300 px-2 py-1 rounded"
                >
                  📋 コピー
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 歌詞表示 */}
      {activeTab === 'lyrics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">🎵 生成された歌詞</h3>
            <button
              onClick={() => copyToClipboard(output.lyrics, '歌詞')}
              className="text-sm text-blue-600 hover:text-blue-800 border border-blue-300 px-3 py-1 rounded"
            >
              📋 全体コピー
            </button>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono leading-relaxed">
              {output.lyrics}
            </pre>
          </div>
          <div className="text-xs text-gray-500">
            ※ Sunoタグ（[Intro], [Verse], [Chorus]等）が含まれています
          </div>
        </div>
      )}

      {/* スタイル指示表示 */}
      {activeTab === 'style' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">🎨 英語スタイル指示</h3>
            <div className="flex items-center space-x-2">
              {output.regenerationSupported && (
                <button
                  onClick={() => setShowRegenerateOptions(!showRegenerateOptions)}
                  className="text-sm text-orange-600 hover:text-orange-800 border border-orange-300 px-3 py-1 rounded"
                  disabled={isLoading}
                >
                  🔄 再生成
                </button>
              )}
              <button
                onClick={() => copyToClipboard(output.styleInstruction, 'スタイル指示')}
                className="text-sm text-blue-600 hover:text-blue-800 border border-blue-300 px-3 py-1 rounded"
              >
                📋 コピー
              </button>
            </div>
          </div>

          {/* 再生成オプション */}
          {showRegenerateOptions && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-3">🔄 再生成理由を選択</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleRegenerateStyle('japanese_detected', output.qualityCheck?.issues)}
                  className="text-left p-2 text-sm bg-white border border-yellow-300 rounded hover:bg-yellow-50"
                  disabled={isLoading}
                >
                  <div className="font-medium">日本語混入修正</div>
                  <div className="text-xs text-gray-500">日本語を完全に英語化</div>
                </button>
                <button
                  onClick={() => handleRegenerateStyle('quality_improvement')}
                  className="text-left p-2 text-sm bg-white border border-yellow-300 rounded hover:bg-yellow-50"
                  disabled={isLoading}
                >
                  <div className="font-medium">品質向上</div>
                  <div className="text-xs text-gray-500">SUNO最適化を強化</div>
                </button>
                <button
                  onClick={() => handleRegenerateStyle('optimization')}
                  className="text-left p-2 text-sm bg-white border border-yellow-300 rounded hover:bg-yellow-50"
                  disabled={isLoading}
                >
                  <div className="font-medium">一般最適化</div>
                  <div className="text-xs text-gray-500">全般的な改善</div>
                </button>
                <button
                  onClick={() => setShowRegenerateOptions(false)}
                  className="text-left p-2 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                >
                  <div className="font-medium">キャンセル</div>
                  <div className="text-xs text-gray-500">再生成しない</div>
                </button>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-md p-4">
            <div className="text-sm text-gray-900 leading-relaxed">
              {output.styleInstruction}
            </div>
          </div>

          {/* 品質チェック詳細 */}
          {output.qualityCheck && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">🔍 品質チェック結果</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>• <strong>信頼度:</strong> {output.qualityCheck.confidence}</div>
                <div>• <strong>日本語混入:</strong> {output.qualityCheck.hasJapanese ? 'あり' : 'なし'}</div>
                {output.qualityCheck.issues.length > 0 && (
                  <div>• <strong>検出された問題:</strong> {output.qualityCheck.issues.join(', ')}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 新アーキテクチャ機能説明 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <details className="cursor-pointer">
          <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
            ✨ 新アーキテクチャの改善点
          </summary>
          <div className="mt-2 text-xs text-gray-600 space-y-1">
            <div>• <strong>段階的生成:</strong> 楽曲分析 → 要素分解 → ユーザー設定 → 最終生成</div>
            <div>• <strong>日本語混入防止:</strong> 英語スタイル指示の自動品質チェック・再生成</div>
            <div>• <strong>SUNO最適化:</strong> AI音楽生成に特化した8要素構造</div>
            <div>• <strong>カスタマイズ性:</strong> 詳細なユーザー設定とリアルタイム調整</div>
            <div>• <strong>品質保証:</strong> 各ステップでの検証と改善サイクル</div>
          </div>
        </details>
      </div>

      {/* ローディング状態 */}
      {isLoading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-700">処理中...</span>
          </div>
        </div>
      )}
    </div>
  )
}