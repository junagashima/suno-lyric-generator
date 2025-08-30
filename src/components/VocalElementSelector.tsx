import React, { useState, useEffect, useRef } from 'react'
import { 
  VocalElement, 
  VocalConfiguration,
  AnalyzedVocalResult,
  VocalistAge,
  SunoOptimizationSettings
} from '../types/vocal'
import { 
  vocalElementsByCategory, 
  vocalPresets,
  generateSunoVocalText,
  allVocalElements,
  vocalistAges,
  songLengthOptimizations,
  getRecommendedElementsForVocalistAge,
  generateOptimizedSunoText
} from '../data/sunoVocalElements'

interface VocalElementSelectorProps {
  gender: string
  mode: 'simple' | 'custom'
  analyzedResult?: AnalyzedVocalResult | null
  onSelectionChange: (configuration: VocalConfiguration) => void
  // 段階3: SUNO最適化モード対応
  enableSunoOptimization?: boolean
  onOptimizationChange?: (settings: SunoOptimizationSettings) => void
}

export default function VocalElementSelector({ 
  gender, 
  mode, 
  analyzedResult,
  onSelectionChange,
  // 段階3: SUNO最適化モード対応
  enableSunoOptimization = false,
  onOptimizationChange
}: VocalElementSelectorProps) {
  const [selectedElements, setSelectedElements] = useState<VocalElement[]>([])
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  
  // 段階2: 簡単モードでの推奨設定編集機能
  const [isEditingRecommended, setIsEditingRecommended] = useState(false)
  const [originalRecommended, setOriginalRecommended] = useState<VocalElement[] | null>(null)
  
  // 段階2改良: 編集中の一時状態管理（確定まで親に反映しない）
  const [tempEditingElements, setTempEditingElements] = useState<VocalElement[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // 段階3: SUNO最適化モード設定（修正版）
  const [selectedVocalistAge, setSelectedVocalistAge] = useState<VocalistAge | null>(null)
  const [selectedSongLength, setSelectedSongLength] = useState<string>('') // 既存のsongLength値を使用
  
  // 編集モード状態の前回値を記憶
  const prevEditingModeRef = useRef(isEditingRecommended)

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

  // 🔥 完全分離版useEffect（編集モード中は絶対に実行されない）
  useEffect(() => {
    // 編集モード中は一切実行しない（early return）
    if (isEditingRecommended) {
      return
    }
    
    const generatedText = generateSunoVocalText(selectedElements, gender)
    console.log('🎤 VocalElementSelector更新（通常モードのみ）:', { selectedElements, generatedText })
    onSelectionChange({
      selectedElements,
      generatedText
    })
  }, [selectedElements, gender, onSelectionChange])  // isEditingRecommendedを依存関係から完全削除
  
  // 編集モード管理用の別useEffect
  useEffect(() => {
    prevEditingModeRef.current = isEditingRecommended
  }, [isEditingRecommended])

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

  // 個別要素選択ハンドラー（完全分離版）
  const handleElementToggle = (element: VocalElement) => {
    setSelectedPreset('') // プリセット選択を解除

    // 🔥 CRITICAL: 編集モード中はselectedElementsに絶対に触らない
    if (isEditingRecommended) {
      // 編集モード中は一時状態のみ操作
      const currentElements = tempEditingElements
      
      // 既に選択されている場合は選択解除
      const isAlreadySelected = currentElements.some(el => el.id === element.id)
      if (isAlreadySelected) {
        const newElements = currentElements.filter(el => el.id !== element.id)
        setTempEditingElements(newElements)
        setHasUnsavedChanges(true)
        return
      }

      // 同じカテゴリの他の要素を除去
      let newElements = currentElements.filter(
        el => el.category !== element.category
      )
      
      // 新要素を追加
      newElements.push(element)

      // 3要素を超える場合は最古の要素を削除
      if (newElements.length > 3) {
        const oldestElement = currentElements.find(el => 
          el.category !== element.category && 
          !newElements.some(newEl => newEl.id === el.id)
        )
        if (oldestElement) {
          newElements = newElements.filter(el => el.id !== oldestElement.id)
        }
      }

      const finalElements = newElements.slice(0, 3)
      setTempEditingElements(finalElements)
      setHasUnsavedChanges(true)
      
      console.log('🔥 編集モード中：tempEditingElementsのみ更新', { finalElements })
      return
    }
    
    // 通常モード：selectedElementsを直接操作
    const currentElements = selectedElements
    
    // 既に選択されている場合は選択解除
    const isAlreadySelected = currentElements.some(el => el.id === element.id)
    if (isAlreadySelected) {
      const newElements = currentElements.filter(el => el.id !== element.id)
      setSelectedElements(newElements)
      return
    }

    // 同じカテゴリの他の要素を除去
    let newElements = currentElements.filter(
      el => el.category !== element.category
    )
    
    // 新要素を追加
    newElements.push(element)

    // 3要素を超える場合は最古の要素を削除
    if (newElements.length > 3) {
      const oldestElement = currentElements.find(el => 
        el.category !== element.category && 
        !newElements.some(newEl => newEl.id === el.id)
      )
      if (oldestElement) {
        newElements = newElements.filter(el => el.id !== oldestElement.id)
      }
    }

    const finalElements = newElements.slice(0, 3)
    setSelectedElements(finalElements)
    
    console.log('🟢 通常モード：selectedElements更新', { finalElements })
  }

  // 段階2: 編集モード開始ハンドラー
  const handleStartEditing = () => {
    setIsEditingRecommended(true)
    // 現在の選択状態を一時編集用にコピー
    setTempEditingElements([...selectedElements])
    setHasUnsavedChanges(false)
  }

  // 段階2: 編集完了ハンドラー（変更を確定）
  const handleFinishEditing = () => {
    setIsEditingRecommended(false)
    
    // 一時編集内容を正式に確定
    setSelectedElements([...tempEditingElements])
    setHasUnsavedChanges(false)
    
    // 確定後に親コンポーネントに反映
    const generatedText = generateSunoVocalText(tempEditingElements, gender)
    onSelectionChange({
      selectedElements: tempEditingElements,
      generatedText
    })
  }

  // 段階2: 編集キャンセルハンドラー
  const handleCancelEditing = () => {
    setIsEditingRecommended(false)
    // 元の状態に戻す（変更を破棄）
    setTempEditingElements([])
    setHasUnsavedChanges(false)
  }

  // 段階2: 元の推奨設定に戻すハンドラー
  const handleResetToOriginal = () => {
    if (originalRecommended) {
      setSelectedElements(originalRecommended)
      setSelectedPreset('')
    }
  }

  // 段階3: ボーカリスト年齢選択ハンドラー（修正版）
  const handleVocalistAgeChange = (vocalistAge: VocalistAge) => {
    setSelectedVocalistAge(vocalistAge)
    
    // ボーカリスト年齢に基づく推奨要素の自動適用
    const recommendedElements = getRecommendedElementsForVocalistAge(vocalistAge)
    if (mode === 'simple' && !isEditingRecommended) {
      setSelectedElements(recommendedElements)
    }
    
    // 親コンポーネントに通知
    if (onOptimizationChange) {
      onOptimizationChange({
        vocalistAge,
        songLength: selectedSongLength,
        vocalElements: isEditingRecommended ? tempEditingElements : selectedElements
      })
    }
  }

  // 段階3: 楽曲長選択ハンドラー（修正版）
  const handleSongLengthChange = (songLength: string) => {
    setSelectedSongLength(songLength)
    
    // 親コンポーネントに通知
    if (onOptimizationChange) {
      onOptimizationChange({
        vocalistAge: selectedVocalistAge,
        songLength,
        vocalElements: isEditingRecommended ? tempEditingElements : selectedElements
      })
    }
  }

  // シンプルモードの表示
  if (mode === 'simple') {
    // デバッグログ追加
    console.log('🔍 Debug - Simple Mode State:', {
      mode,
      hasAnalyzedResult: !!analyzedResult,
      isEditingRecommended,
      selectedElementsLength: selectedElements.length,
      analyzedResultElements: analyzedResult?.recommendedElements?.length
    })
    
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
                    type="button"
                    onClick={handleStartEditing}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 border border-blue-700 font-semibold shadow-sm"
                    style={{ minWidth: '80px' }}
                  >
                    ⚙️ 編集する
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleResetToOriginal}
                      className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      ↻ 元に戻す
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditing}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ✕ 取消
                    </button>
                    <button
                      type="button"
                      onClick={handleFinishEditing}
                      className={`px-3 py-1 text-xs rounded font-semibold ${
                        hasUnsavedChanges 
                          ? 'bg-green-600 text-white hover:bg-green-700 border border-green-700' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-700'
                      }`}
                    >
                      ✓ {hasUnsavedChanges ? '保存' : '完了'}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {(isEditingRecommended ? tempEditingElements : selectedElements).map(element => (
                <span 
                  key={element.id}
                  className={`px-3 py-1 rounded-full text-sm ${
                    isEditingRecommended 
                      ? hasUnsavedChanges
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {element.label}
                  {isEditingRecommended && hasUnsavedChanges && <span className="ml-1">*</span>}
                </span>
              ))}
            </div>
            
            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-mono text-gray-700">
                {generateSunoVocalText(isEditingRecommended ? tempEditingElements : selectedElements, gender)}
              </p>
              {isEditingRecommended && hasUnsavedChanges && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ 未保存の変更があります
                </p>
              )}
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
            
            {/* 緊急テスト：分析結果なしでも編集ボタンを表示 */}
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-700 mb-2">🧪 テスト版: 編集機能確認</p>
              <button
                type="button"
                onClick={handleStartEditing}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 border border-blue-700"
              >
                ⚙️ テスト編集
              </button>
            </div>
          </div>
        )}
        
        {/* 段階2: 編集モード時の個別選択 UI */}
        {isEditingRecommended && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="text-md font-medium mb-3">
              🎵 個別選択編集 
              <span className="text-sm font-normal text-gray-600">
                （{tempEditingElements.length}/3）
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
                    // 編集モード中は tempEditingElements を参照
                    const currentElements = isEditingRecommended ? tempEditingElements : selectedElements
                    const isSelected = currentElements.some(el => el.id === element.id)
                    const canSelect = currentElements.length < 3 || isSelected
                    const categorySelected = currentElements.some(el => el.category === category)
                    
                    return (
                      <button
                        type="button"
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
        )}
        
        {/* 段階3: SUNO最適化モード設定（シンプルモード用） */}
        {enableSunoOptimization && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="text-md font-semibold mb-3 flex items-center">
              🚀 SUNO最適化設定 
              <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Stage 3</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ボーカリスト年齢選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ボーカリストの年齢
                </label>
                <div className="space-y-2">
                  {vocalistAges.map(vocalistAge => (
                    <label key={vocalistAge.id} className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="vocalistAge"
                        value={vocalistAge.id}
                        checked={selectedVocalistAge?.id === vocalistAge.id}
                        onChange={() => handleVocalistAgeChange(vocalistAge)}
                        className="mt-1 w-4 h-4 text-purple-600 border-2 border-gray-300 focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{vocalistAge.label}</div>
                        <div className="text-xs text-gray-600">{vocalistAge.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* 楽曲長選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  楽曲の長さ
                </label>
                <div className="space-y-2">
                  {['2-3分', '3-4分', '4-5分', '5分以上'].map(length => (
                    <label key={length} className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="songLength"
                        value={length}
                        checked={selectedSongLength === length}
                        onChange={() => handleSongLengthChange(length)}
                        className="mt-1 w-4 h-4 text-purple-600 border-2 border-gray-300 focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{length}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 最適化プレビュー */}
            {selectedVocalistAge && selectedSongLength && (
              <div className="mt-4 bg-white p-3 rounded border border-purple-200">
                <h5 className="text-sm font-medium text-purple-800 mb-2">🎯 最適化プレビュー</h5>
                <div className="text-xs space-y-1">
                  <div><strong>ボーカリスト特徴:</strong> {selectedVocalistAge.sunoKeywords.join(', ')}</div>
                  <div><strong>楽曲長最適化:</strong> {songLengthOptimizations[selectedSongLength]?.join(', ') || 'なし'}</div>
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <strong>SUNO最適化テキスト:</strong>
                    <div className="font-mono text-gray-700 mt-1">
                      {generateOptimizedSunoText(
                        isEditingRecommended ? tempEditingElements : selectedElements,
                        gender,
                        selectedVocalistAge,
                        selectedSongLength
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-3 text-xs text-gray-600">
              💡 ボーカリストの年齢と楽曲長を選択すると、SUNO AIでより最適化された楽曲が生成されます
            </div>
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
              type="button"
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
                    type="button"
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
      
      {/* 段階3: SUNO最適化モード設定（こだわりモード用） */}
      {enableSunoOptimization && (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="text-md font-semibold mb-3 flex items-center">
            🚀 SUNO最適化設定 
            <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Stage 3</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ボーカリスト年齢選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ボーカリストの年齢
              </label>
              <div className="space-y-2">
                {vocalistAges.map(vocalistAge => (
                  <label key={vocalistAge.id} className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="vocalistAge"
                      value={vocalistAge.id}
                      checked={selectedVocalistAge?.id === vocalistAge.id}
                      onChange={() => handleVocalistAgeChange(vocalistAge)}
                      className="mt-1 w-4 h-4 text-purple-600 border-2 border-gray-300 focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{vocalistAge.label}</div>
                      <div className="text-xs text-gray-600">{vocalistAge.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* 楽曲長選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                楽曲の長さ
              </label>
              <div className="space-y-2">
                {['2-3分', '3-4分', '4-5分', '5分以上'].map(length => (
                  <label key={length} className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="songLength"
                      value={length}
                      checked={selectedSongLength === length}
                      onChange={() => handleSongLengthChange(length)}
                      className="mt-1 w-4 h-4 text-purple-600 border-2 border-gray-300 focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{length}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* 最適化プレビュー */}
          {selectedVocalistAge && selectedSongLength && (
            <div className="mt-4 bg-white p-3 rounded border border-purple-200">
              <h5 className="text-sm font-medium text-purple-800 mb-2">🎯 最適化プレビュー</h5>
              <div className="text-xs space-y-1">
                <div><strong>ボーカリスト特徴:</strong> {selectedVocalistAge.sunoKeywords.join(', ')}</div>
                <div><strong>楽曲長最適化:</strong> {songLengthOptimizations[selectedSongLength]?.join(', ') || 'なし'}</div>
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <strong>SUNO最適化テキスト:</strong>
                  <div className="font-mono text-gray-700 mt-1">
                    {generateOptimizedSunoText(
                      selectedElements,
                      gender,
                      selectedVocalistAge,
                      selectedSongLength
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-600">
            💡 ボーカリストの年齢と楽曲長を選択すると、SUNO AIでより最適化された楽曲が生成されます
          </div>
        </div>
      )}
    </div>
  )
}