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

  // 個別要素選択ハンドラー（改善版）
  const handleElementToggle = (element: VocalElement) => {
    setSelectedPreset('') // プリセット選択を解除

    // 既に選択されている場合は選択解除
    const isAlreadySelected = selectedElements.some(el => el.id === element.id)
    if (isAlreadySelected) {
      setSelectedElements(selectedElements.filter(el => el.id !== element.id))
      return
    }

    // 同じカテゴリの他の要素を除去
    let newElements = selectedElements.filter(
      el => el.category !== element.category
    )
    
    // 新要素を追加
    newElements.push(element)

    // 3要素を超える場合は最古の要素を削除（FIFO方式）
    if (newElements.length > 3) {
      // 最初に選択された要素を特定するため、元の配列の順序を考慮
      const oldestElement = selectedElements.find(el => 
        el.category !== element.category && 
        !newElements.some(newEl => newEl.id === el.id)
      )
      if (oldestElement) {
        newElements = newElements.filter(el => el.id !== oldestElement.id)
      }
    }

    setSelectedElements(newElements.slice(0, 3)) // 安全のため3要素に制限
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
    // デバッグ: UX修正版
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">🎵 ボーカルスタイル</h3>
        
        {analyzedResult ? (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-600">
                📊 楽曲分析に基づく推奨設定
              </p>
              <div className="flex gap-2 items-center">
                
                {!isEditingRecommended ? (
                  <button
                    onClick={handleStartEditing}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 border border-blue-700 font-semibold shadow-sm"
                    style={{ minWidth: '80px' }}
                  >
                    ⚙️ 編集する
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleResetToOriginal}
                      className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 border border-gray-600 font-semibold"
                    >
                      ↻ 元に戻す
                    </button>
                    <button
                      onClick={handleFinishEditing}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 border border-green-700 font-semibold"
                    >
                      ✓ 完了
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedElements.map(element => (
                <span 
                  key={element.id}
                  className={`px-3 py-1 rounded-full text-sm ${
                    isEditingRecommended 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}
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
            
            {!isEditingRecommended && (
              <p className="text-xs text-gray-500 mt-2">
                💡 {analyzedResult.reasoning}
              </p>
            )}
            
            {isEditingRecommended && (
              <p className="text-xs text-green-600 mt-2">
                ✏️ 編集モード: 下記の個別選択で推奨設定をカスタマイズできます
              </p>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              楽曲分析を実行すると、最適なボーカルスタイルが自動選択されます
            </p>

          </div>
        )}
        
        {/* 段階2: 編集モード時の個別選択 UI */}
        {isEditingRecommended && analyzedResult && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-medium">
                🎵 個別選択編集 
                <span className="text-sm font-normal text-gray-600">
                  （{selectedElements.length}/3）
                </span>
              </h4>
              
              {/* 選択クリアボタン追加 */}
              {selectedElements.length > 0 && (
                <button
                  onClick={() => setSelectedElements([])}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  🗑️ 全クリア
                </button>
              )}
            </div>
            
            {/* 現在の選択状況を上部に表示 */}
            {selectedElements.length > 0 && (
              <div className="mb-4 p-3 bg-white rounded border">
                <p className="text-xs text-gray-600 mb-2">現在の選択:</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedElements.map(element => (
                    <button
                      key={element.id}
                      onClick={() => handleElementToggle(element)}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-red-100 hover:text-red-800 transition-colors"
                      title="クリックして選択解除"
                    >
                      {element.label} ❌
                    </button>
                  ))}
                </div>
                <div className="text-xs font-mono text-gray-700 bg-gray-50 p-2 rounded">
                  {generateSunoVocalText(selectedElements, gender)}
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  💡 選択した要素をクリックすると解除できます
                </p>
              </div>
            )}
            
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
                    const categorySelected = selectedElements.some(el => el.category === category)
                    
                    return (
                      <button
                        key={element.id}
                        onClick={() => handleElementToggle(element)}
                        className={`p-2 border rounded text-left text-sm transition-colors ${
                          isSelected 
                            ? 'border-green-500 bg-green-50 text-green-800 hover:border-red-500 hover:bg-red-50 hover:text-red-800' 
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                        title={isSelected ? 'クリックして選択解除' : 'クリックして選択（3要素まで）'}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium">
                            {element.label}
                            {isSelected && <span className="ml-1 text-green-600">✓</span>}
                          </div>
                          {selectedElements.length >= 3 && !isSelected && (
                            <span className="text-xs text-orange-600 bg-orange-100 px-1 rounded">
                              入替
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">{element.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
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