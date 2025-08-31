import React from 'react'
import { DecomposedElements } from '@/types/analysis'

// 🎯 Step 2: 改良版要素分解表示コンポーネント
// 19ジャンル分類システム連携 + 視覚的改善

interface DecomposedElementsDisplayProps {
  elements: DecomposedElements
  onProceed: () => void
  isLoading?: boolean
}

export function DecomposedElementsDisplayImproved({ 
  elements, 
  onProceed, 
  isLoading = false 
}: DecomposedElementsDisplayProps) {
  
  // 8つのSUNO要素を整理して表示
  const sunoElements = [
    {
      category: '🎵 基本音楽構成',
      description: 'SUNOが楽曲を生成する際の基本設計図',
      color: 'blue',
      elements: [
        { 
          key: 'instruments', 
          label: '楽器構成', 
          value: elements.instruments, 
          icon: '🎸',
          explanation: 'メインとなる楽器の組み合わせ'
        },
        { 
          key: 'structure', 
          label: '楽曲構成', 
          value: elements.structure, 
          icon: '🏗️',
          explanation: 'イントロ→Verse→Chorus等の流れ'
        },
        { 
          key: 'rhythm', 
          label: 'リズムパターン', 
          value: elements.rhythm, 
          icon: '🥁',
          explanation: 'ビートの種類と特徴'
        },
        { 
          key: 'tempo', 
          label: 'テンポ感', 
          value: elements.tempo, 
          icon: '⏱️',
          explanation: '楽曲の速さと躍動感'
        }
      ]
    },
    {
      category: '🎨 表現・雰囲気要素',
      description: '楽曲の感情と世界観を決定する要素',
      color: 'purple',
      elements: [
        { 
          key: 'genre', 
          label: 'ジャンル判定', 
          value: elements.genre, 
          icon: '🎭',
          explanation: '19ジャンル分類による特定結果'
        },
        { 
          key: 'mood', 
          label: 'ムード・感情', 
          value: elements.mood, 
          icon: '💫',
          explanation: '楽曲全体の感情的な印象'
        },
        { 
          key: 'forbidden', 
          label: '除外要素', 
          value: elements.forbidden, 
          icon: '🚫',
          explanation: 'SUNOが使用してはいけない要素'
        }
      ]
    },
    {
      category: '🎤 ボーカル設定（調整可能）',
      description: '次のステップでユーザーが詳細調整可能',
      color: 'green',
      elements: [
        { 
          key: 'vocal_attribute', 
          label: 'ボーカル属性', 
          value: elements.vocal.attribute, 
          icon: '👤',
          explanation: '歌い手の性別・人数構成'
        }
      ]
    }
  ]

  // カラーテーマの取得
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        title: 'text-blue-800',
        desc: 'text-blue-600',
        element: 'bg-blue-100 border-blue-200'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200', 
        title: 'text-purple-800',
        desc: 'text-purple-600',
        element: 'bg-purple-100 border-purple-200'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        title: 'text-green-800', 
        desc: 'text-green-600',
        element: 'bg-green-100 border-green-200'
      }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
          🔧 SUNO要素への分解完了
          <span className="ml-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            8要素検出
          </span>
        </h2>
        <p className="text-gray-600 text-sm">
          楽曲分析結果を<strong>8つのSUNO AI用要素</strong>に分解しました。各要素を確認して次のステップに進んでください。
        </p>
      </div>

      {/* 8つの要素をカテゴリ別表示 */}
      <div className="space-y-6">
        {sunoElements.map((category, categoryIndex) => {
          const colors = getColorClasses(category.color)
          
          return (
            <div 
              key={categoryIndex} 
              className={`${colors.bg} ${colors.border} border rounded-lg p-5`}
            >
              {/* カテゴリヘッダー */}
              <div className="mb-4">
                <h3 className={`text-lg font-semibold ${colors.title}`}>
                  {category.category}
                </h3>
                <p className={`text-sm ${colors.desc}`}>
                  {category.description}
                </p>
              </div>

              {/* 要素一覧 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.elements.map((element, elementIndex) => (
                  <div 
                    key={elementIndex} 
                    className={`${colors.element} border rounded-lg p-4`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">
                        {element.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 text-sm mb-1">
                          {element.label}
                        </div>
                        <div className="text-gray-900 text-sm font-medium mb-2">
                          {element.value}
                        </div>
                        <div className="text-xs text-gray-600">
                          {element.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* SUNO要素表示（現在のボーカル設定） */}
      {elements.vocal.sunoElements && elements.vocal.sunoElements.length > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
            ⚡ 現在のSUNO最適化要素
            <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
              次のステップで調整可能
            </span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {elements.vocal.sunoElements.map((sunoElement, idx) => (
              <span 
                key={idx}
                className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full border border-yellow-300"
              >
                {sunoElement}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 19ジャンル分類システム適用表示 */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center">
          🎯 19ジャンル分類システム適用済み
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">判定ジャンル:</span>
            <span className="font-medium text-gray-900">{elements.genre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">構成テンプレート:</span>
            <span className="font-medium text-gray-900">適用済み</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">5次元タグ:</span>
            <span className="font-medium text-gray-900">自動設定</span>
          </div>
        </div>
      </div>

      {/* 次のステップボタン */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onProceed}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              設定準備中...
            </>
          ) : (
            <>
              ⚙️ ユーザー設定・カスタマイズに進む
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-2">
          次のステップでボーカル属性・SUNO要素・楽曲長さなどを詳細設定できます
        </p>
      </div>

      {/* 技術詳細（折りたたみ） */}
      <div className="mt-4">
        <details className="cursor-pointer">
          <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
            🔍 8要素の技術詳細を表示
          </summary>
          <div className="mt-3 p-4 bg-gray-50 rounded-md">
            <div className="text-xs text-gray-600 space-y-2">
              <div><strong>不変要素（7個）:</strong> 楽曲分析結果に基づく固定要素。SUNOの音楽的品質を保証</div>
              <div><strong>可変要素（1個）:</strong> ユーザーが次ステップでカスタマイズ可能</div>
              <div><strong>19ジャンル連携:</strong> ジャンル判定により最適な構成・タグを自動適用</div>
              <div><strong>品質保証:</strong> 英語スタイル生成時の日本語混入を防止する設計</div>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}