import React, { useState } from 'react'

// 🎯 スタイル指示カスタマイズガイドコンポーネント
// 英語表現例と効果説明、注意事項を提供

interface StyleCustomizationGuideProps {
  currentStyle: string
  onStyleUpdate: (newStyle: string) => void
}

export function StyleCustomizationGuide({ currentStyle, onStyleUpdate }: StyleCustomizationGuideProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedExample, setSelectedExample] = useState<string | null>(null)

  // 英語表現カテゴリと効果例
  const styleCategories = [
    {
      category: '🎤 ボーカルスタイル',
      description: 'ボーカルの表現力や歌い方に影響',
      examples: [
        {
          phrase: 'emotional vocals',
          effect: '感情豊かで表現力のある歌声',
          usage: 'バラードや感動的な楽曲に最適'
        },
        {
          phrase: 'powerful vocals',
          effect: '力強く迫力のあるボーカル',
          usage: 'ロックやアンセム系楽曲で効果的'
        },
        {
          phrase: 'gentle vocals',
          effect: '優しく柔らかな歌声',
          usage: 'アコースティックや癒し系楽曲向け'
        },
        {
          phrase: 'breathy vocals',
          effect: '息遣いが感じられる親密な歌声',
          usage: 'ジャズやR&B、ロマンチックな楽曲'
        }
      ]
    },
    {
      category: '🎵 楽器・音色指定',
      description: '使用楽器や音の質感を指定',
      examples: [
        {
          phrase: 'acoustic guitar fingerpicking',
          effect: 'フィンガーピッキングによる繊細なギター音',
          usage: 'アコースティック楽曲で温かみを追加'
        },
        {
          phrase: 'lush strings',
          effect: '豊かで厚みのあるストリングス',
          usage: 'オーケストラル要素やドラマチックな演出'
        },
        {
          phrase: 'vintage piano',
          effect: 'ビンテージ感のあるピアノ音',
          usage: 'レトロやクラシックな雰囲気作り'
        },
        {
          phrase: 'subtle percussion',
          effect: 'さりげない優しいパーカッション',
          usage: 'メロディを邪魔しないリズム要素'
        }
      ]
    },
    {
      category: '🎨 雰囲気・ムード',
      description: '楽曲全体の雰囲気や空気感',
      examples: [
        {
          phrase: 'nostalgic and warm',
          effect: '懐かしく温かい雰囲気',
          usage: 'メモリアルソングや回想シーン'
        },
        {
          phrase: 'uplifting and energetic',
          effect: '前向きで活力に満ちた印象',
          usage: '応援歌やポジティブな楽曲'
        },
        {
          phrase: 'dreamy atmosphere',
          effect: '夢想的で浮遊感のある空間',
          usage: 'ファンタジーやリラックス系'
        },
        {
          phrase: 'intimate and cozy',
          effect: '親密で居心地の良い雰囲気',
          usage: 'カフェミュージックやラブソング'
        }
      ]
    },
    {
      category: '⚡ 音楽的技術指定',
      description: '音楽理論や制作技術に関する指定',
      examples: [
        {
          phrase: 'rich harmonies',
          effect: '豊かなハーモニー構成',
          usage: 'ゴスペルやコーラスワークを重視'
        },
        {
          phrase: 'dynamic builds',
          effect: '盛り上がりのある構成変化',
          usage: 'サビへの期待感や感動的なクライマックス'
        },
        {
          phrase: 'subtle reverb',
          effect: '上品なリバーブ効果',
          usage: '空間の広がりや奥行き感の演出'
        },
        {
          phrase: 'clear production',
          effect: 'クリアで聴き取りやすいミックス',
          usage: '歌詞やメロディを重視したい場合'
        }
      ]
    }
  ]

  // サンプル追加機能
  const handleAddExample = (phrase: string) => {
    const updatedStyle = currentStyle.includes(phrase) 
      ? currentStyle 
      : `${currentStyle}, ${phrase}`
    onStyleUpdate(updatedStyle.replace(/^,\s*/, ''))
  }

  // よくある禁止表現と理由
  const forbiddenElements = [
    {
      phrase: 'No EDM drops',
      reason: 'EDMの急激なドロップを避け、流れを重視'
    },
    {
      phrase: 'No heavy distortion',
      reason: 'オーバーなディストーションでボーカルが埋もれるのを防止'
    },
    {
      phrase: 'No comedic elements',
      reason: '真剣な楽曲で笑い要素が入るのを防ぐ'
    },
    {
      phrase: 'No ambient pads',
      reason: 'アンビエント系の背景音でメロディが曖昧になるのを回避'
    }
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div 
        className="bg-blue-50 border-b border-blue-200 p-4 cursor-pointer hover:bg-blue-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl">🎨</span>
            <div>
              <h3 className="font-semibold text-blue-800">英語スタイル指示カスタマイズガイド</h3>
              <p className="text-sm text-blue-600">
                どんな英語表現がどんな効果をもたらすか詳しく解説
              </p>
            </div>
          </div>
          <span className="text-blue-600 text-xl">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6">
          {/* 重要な注意事項 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-600 text-xl flex-shrink-0">⚠️</span>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">重要な注意事項</h4>
                <div className="text-sm text-yellow-700 space-y-2">
                  <div>• <strong>楽曲イメージからの逸脱リスク:</strong> カスタマイズにより分析した楽曲の本来のイメージから大きく離れる可能性があります</div>
                  <div>• <strong>バランスの重要性:</strong> 過度な指定は楽曲の自然さを損なう場合があります</div>
                  <div>• <strong>英語のみ使用:</strong> 日本語を含むとSUNO AIが正しく認識しない可能性があります</div>
                  <div>• <strong>実験的な要素:</strong> 新しい表現は予期しない結果をもたらすことがあります</div>
                </div>
              </div>
            </div>
          </div>

          {/* カテゴリ別表現例 */}
          <div className="space-y-6">
            {styleCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                    <span>{category.category}</span>
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.examples.map((example, exampleIndex) => (
                      <div 
                        key={exampleIndex}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedExample === example.phrase 
                            ? 'border-blue-300 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedExample(
                          selectedExample === example.phrase ? null : example.phrase
                        )}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                              {example.phrase}
                            </code>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddExample(example.phrase)
                              }}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                            >
                              追加
                            </button>
                          </div>
                          <div className="text-sm text-gray-700">
                            <strong>効果:</strong> {example.effect}
                          </div>
                          <div className="text-xs text-gray-500">
                            <strong>適用場面:</strong> {example.usage}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 禁止要素の説明 */}
          <div className="mt-6 border border-red-200 rounded-lg overflow-hidden">
            <div className="bg-red-50 px-4 py-3 border-b border-red-200">
              <h4 className="font-semibold text-red-800 flex items-center space-x-2">
                <span>🚫 よく使用される禁止要素</span>
              </h4>
              <p className="text-sm text-red-600 mt-1">特定の音楽要素を避けたい場合の表現</p>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                {forbiddenElements.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <code className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono">
                        {item.phrase}
                      </code>
                      <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                    </div>
                    <button
                      onClick={() => handleAddExample(item.phrase)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    >
                      追加
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* カスタマイズのコツ */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center space-x-2">
              <span>💡</span>
              <span>効果的なカスタマイズのコツ</span>
            </h4>
            <div className="text-sm text-green-700 space-y-2">
              <div>• <strong>段階的な調整:</strong> 一度に多くを変更せず、少しずつ調整してください</div>
              <div>• <strong>楽曲ジャンルとの整合性:</strong> 分析されたジャンルと大きく異なる指定は避けましょう</div>
              <div>• <strong>具体的な表現:</strong> 抽象的でなく具体的な英語表現が効果的です</div>
              <div>• <strong>バランス:</strong> ボーカル、楽器、雰囲気のバランスを考慮してください</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}