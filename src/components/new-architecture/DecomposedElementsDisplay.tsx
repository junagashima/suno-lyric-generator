import React from 'react'
import { DecomposedElements } from '@/types/analysis'

// 🎯 Phase 2A: 新アーキテクチャ用要素分解表示コンポーネント

interface DecomposedElementsDisplayProps {
  elements: DecomposedElements
  onProceed: () => void
  isLoading?: boolean
}

export function DecomposedElementsDisplay({ elements, onProceed, isLoading = false }: DecomposedElementsDisplayProps) {
  const elementGroups = [
    {
      title: '🎵 音楽要素（不変）',
      description: '楽曲分析に基づく固定要素',
      items: [
        { label: '楽器構成', value: elements.instruments, icon: '🎸' },
        { label: '楽曲構成', value: elements.structure, icon: '🏗️' },
        { label: 'リズム', value: elements.rhythm, icon: '🥁' },
        { label: 'テンポ', value: elements.tempo, icon: '⏱️' }
      ]
    },
    {
      title: '🎨 表現要素（不変）',
      description: '楽曲の感情・雰囲気要素',
      items: [
        { label: '禁止要素', value: elements.forbidden, icon: '🚫' },
        { label: 'ムード', value: elements.mood, icon: '💫' },
        { label: 'ジャンル', value: elements.genre, icon: '🎭' }
      ]
    },
    {
      title: '🎤 ボーカル要素（可変）',
      description: 'ユーザーが調整可能な要素',
      items: [
        { label: 'ボーカル属性', value: elements.vocal.attribute, icon: '👤' },
        { 
          label: 'SUNO要素', 
          value: elements.vocal.sunoElements.join(', '), 
          icon: '⚡',
          isArray: true 
        }
      ]
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          🔧 SUNO要素への分解完了
        </h2>
        <p className="text-gray-600 text-sm">
          楽曲分析結果を8つのSUNO要素に分解しました。内容を確認して次のステップに進んでください。
        </p>
      </div>

      {/* 分解された要素の表示 */}
      <div className="space-y-6">
        {elementGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{group.title}</h3>
              <p className="text-sm text-gray-500">{group.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {group.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start space-x-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-700 text-sm">{item.label}</div>
                    <div className={`text-gray-900 mt-1 ${'isArray' in item && item.isArray ? 'flex flex-wrap gap-1' : ''}`}>
                      {'isArray' in item && item.isArray ? (
                        elements.vocal.sunoElements.map((element, idx) => (
                          <span 
                            key={idx}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {element}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm leading-relaxed">{item.value}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 品質指標 */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 text-lg mr-2">✅</span>
            <div>
              <div className="font-medium text-green-800 text-sm">分解完了</div>
              <div className="text-green-700 text-xs">8要素すべて生成済み</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-blue-600 text-lg mr-2">🎯</span>
            <div>
              <div className="font-medium text-blue-800 text-sm">SUNO最適化</div>
              <div className="text-blue-700 text-xs">AI生成に特化した構造</div>
            </div>
          </div>
        </div>
      </div>

      {/* 次のステップボタン */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onProceed}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              処理中...
            </>
          ) : (
            <>
              ⚙️ ユーザー設定に進む
            </>
          )}
        </button>

        {/* 説明テキスト */}
        <p className="text-center text-sm text-gray-500 mt-2">
          次のステップで歌詞の内容や言語設定などをカスタマイズできます
        </p>
      </div>

      {/* 技術情報 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <details className="cursor-pointer">
          <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
            🔍 技術詳細を表示
          </summary>
          <div className="mt-2 text-xs text-gray-600 space-y-1">
            <div>• <strong>不変要素:</strong> 楽曲分析結果に基づき自動生成、編集不可</div>
            <div>• <strong>可変要素:</strong> ユーザーが次のステップで調整可能</div>
            <div>• <strong>SUNO要素:</strong> AI音楽生成に最適化された8要素構造</div>
            <div>• <strong>品質保証:</strong> 英語スタイル生成時の日本語混入を防止</div>
          </div>
        </details>
      </div>
    </div>
  )
}