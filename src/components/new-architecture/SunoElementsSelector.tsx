import React from 'react'
import { SUNO_ELEMENTS } from '@/types/analysis'

interface SunoElementsSelectorProps {
  selectedElements: string[]
  onToggle: (elementId: string) => void
  isLoading: boolean
}

export function SunoElementsSelector({ selectedElements, onToggle, isLoading }: SunoElementsSelectorProps) {
  const getSunoElementsByCategory = (category: string) => 
    SUNO_ELEMENTS.filter(element => element.category === category)

  const categoryLabels = {
    tone: '🎨 トーン系',
    delivery: '🎵 歌唱法系', 
    emotion: '💫 感情表現系',
    pronunciation: '🔤 発音系'
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-5">
      <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
        ⚡ SUNO最適化要素選択
        <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
          {selectedElements.length}/3選択
        </span>
      </h3>
      <p className="text-sm text-green-600 mb-4">
        ボーカルの特徴を3つまで選択してください（SUNOの音質向上に効果的）
      </p>

      <div className="space-y-4">
        {['tone', 'delivery', 'emotion', 'pronunciation'].map(category => {
          const categoryElements = getSunoElementsByCategory(category)

          return (
            <div key={category}>
              <h4 className="font-medium text-gray-700 mb-2">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {categoryElements.map(element => (
                  <div key={element.id} className="relative">
                    <button
                      type="button"
                      onClick={() => onToggle(element.id)}
                      disabled={isLoading || (!selectedElements.includes(element.id) && selectedElements.length >= 3)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        selectedElements.includes(element.id)
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      } ${(!selectedElements.includes(element.id) && selectedElements.length >= 3) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{element.label}</div>
                          <div className="text-xs text-gray-600 mt-1">{element.description}</div>
                        </div>
                        {selectedElements.includes(element.id) && (
                          <span className="text-green-600 text-lg">✓</span>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selectedElements.length === 3 && (
        <div className="mt-3 text-sm text-green-600 bg-green-100 p-2 rounded">
          ✅ 3つの要素が選択されました。これでSUNO最適化が有効になります。
        </div>
      )}
    </div>
  )
}