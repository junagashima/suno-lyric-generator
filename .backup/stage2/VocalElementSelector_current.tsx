import React, { useState, useEffect } from 'react'
import { 
  VocalElement, 
  VocalConfiguration,
  AnalyzedVocalResult
} from '../types/vocal'
import { 
  vocalElementsByCategory, 
  vocalPresets,
  generateSunoVocalText,
  allVocalElements
} from '../data/sunoVocalElements'

interface VocalElementSelectorProps {
  gender: string
  mode: 'simple' | 'custom'
  analyzedResult?: AnalyzedVocalResult | null
  onSelectionChange: (configuration: VocalConfiguration) => void
}

export default function VocalElementSelector({ 
  gender, 
  mode, 
  analyzedResult,
  onSelectionChange 
}: VocalElementSelectorProps) {
  const [selectedElements, setSelectedElements] = useState<VocalElement[]>([])
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  
  // 段階2: 簡単モードでの推奨設定編集機能
  const [isEditingRecommended, setIsEditingRecommended] = useState(false)
  const [originalRecommended, setOriginalRecommended] = useState<VocalElement[] | null>(null)

  // 楽曲分析結果が更新されたら自動選択
  useEffect(() => {
    if (mode === 'simple' && analyzedResult) {
      setSelectedElements(analyzedResult.recommendedElements)
      setSelectedPreset('')
      // 段階2: 編集モード用に元の推奨設定を保存
      setOriginalRecommended(analyzedResult.recommendedElements)
      setIsEditingRecommended(false) // 新しい分析結果では編集モードをリセット
    }
  }, [mode, analyzedResult])

  // 選択変更時にコールバック実行
  useEffect(() => {
    const generatedText = generateSunoVocalText(selectedElements, gender)
    console.log('🎤 VocalElementSelector更新:', { selectedElements, generatedText })
    onSelectionChange({
      selectedElements,
      generatedText
    })
  }, [selectedElements, gender, onSelectionChange])

  // プリセット選択ハンドラー
  const handlePresetSelect = (presetId: string) => {
    const preset = vocalPresets.find(p => p.id === presetId)
    if (preset) {
      const elements = preset.elements.map(elementId => 
        allVocalElements.find(el => el.id === elementId)!
      ).filter(Boolean)
      setSelectedElements(elements)
      setSelectedPreset(presetId)
    }
  }

  // 個別要素選択ハンドラー
  const handleElementToggle = (element: VocalElement) => {
    setSelectedPreset('') // プリセット選択を解除

    // 同じカテゴリの他の要素を除去して新要素を追加
    const newElements = selectedElements.filter(
      el => el.category !== element.category
    )
    
    // 既に選択されている場合は除去、そうでなければ追加
    const isAlreadySelected = selectedElements.some(el => el.id === element.id)
    if (!isAlreadySelected) {
      newElements.push(element)
    }

    // 最大3要素まで
    if (newElements.length <= 3) {
      setSelectedElements(newElements)
    }
  }

  // 段階2: 編集モード開始ハンドラー
  const handleStartEditing = () => {
    setIsEditingRecommended(true)
  }

  // 段階2: 編集完了ハンドラー
  const handleFinishEditing = () => {
    setIsEditingRecommended(false)
  }

  // 段階2: 元の推奨設定に戻すハンドラー
  const handleResetToOriginal = () => {
    if (originalRecommended) {
      setSelectedElements(originalRecommended)
      setSelectedPreset('')
    }
  }

  // シンプルモードの表示
  if (mode === 'simple') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">🎵 ボーカルスタイル</h3>
        
        {analyzedResult ? (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              📊 楽曲分析に基づく推奨設定
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {analyzedResult.recommendedElements.map(element => (
                <span 
                  key={element.id}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {element.label}
                </span>
              ))}
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-mono text-gray-700">
                {analyzedResult.sunoText}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 {analyzedResult.reasoning}
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              楽曲分析を実行すると、最適なボーカルスタイルが自動選択されます
            </p>
          </div>
        )}
      </div>
    )
  }

  // こだわりモードの表示
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">🎵 ボーカルスタイル（こだわりモード）</h3>
        <p className="text-sm text-gray-600 mb-4">
          4要素から3つ選んで組み合わせてください（SUNO推奨）
        </p>
      </div>

      {/* プリセット選択 */}
      <div>
        <h4 className="text-md font-medium mb-3">📋 プリセット（お手軽選択）</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vocalPresets.map(preset => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className={`p-3 border rounded-lg text-left transition-colors ${
                selectedPreset === preset.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <div className="font-medium text-sm">{preset.name}</div>
              <div className="text-xs text-gray-600">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 個別要素選択 */}
      <div>
        <h4 className="text-md font-medium mb-3">
          🎛️ 個別選択 
          <span className="text-sm font-normal text-gray-600">
            （{selectedElements.length}/3）
          </span>
        </h4>
        
        {Object.entries(vocalElementsByCategory).map(([category, elements]) => (
          <div key={category} className="mb-4">
            <h5 className="text-sm font-medium mb-2 capitalize">
              {category === 'tone' && '1. 声の質'}
              {category === 'delivery' && '2. 歌唱法'}
              {category === 'emotion' && '3. 感情'}
              {category === 'pronunciation' && '4. 発音'}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {elements.map(element => {
                const isSelected = selectedElements.some(el => el.id === element.id)
                const canSelect = selectedElements.length < 3 || isSelected
                const categorySelected = selectedElements.some(el => el.category === category)
                
                return (
                  <button
                    key={element.id}
                    onClick={() => handleElementToggle(element)}
                    disabled={!canSelect && !categorySelected}
                    className={`p-2 border rounded text-left text-sm transition-colors ${
                      isSelected 
                        ? 'border-green-500 bg-green-50 text-green-800' 
                        : canSelect || categorySelected
                        ? 'border-gray-300 hover:border-green-300'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-medium">{element.label}</div>
                    <div className="text-xs text-gray-600">{element.description}</div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 選択結果プレビュー */}
      {selectedElements.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">🎯 選択結果</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedElements.map(element => (
              <span 
                key={element.id}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {element.label}
              </span>
            ))}
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm font-mono text-gray-700">
              {generateSunoVocalText(selectedElements, gender)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}