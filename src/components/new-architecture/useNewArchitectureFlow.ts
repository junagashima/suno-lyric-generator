import { useState, useCallback } from 'react'
import { AppFlowState, RawAnalysisResult, DecomposedElements, UserSettings, FinalOutput } from '@/types/analysis'

// 🎯 Phase 2A: 新アーキテクチャ用状態管理フック

export function useNewArchitectureFlow() {
  const [flowState, setFlowState] = useState<AppFlowState>({
    currentStep: 'input',
    analysisResult: null,
    decomposedElements: null,
    userSettings: {
      songLength: '3-4分',
      rapMode: 'none',
      language: {
        primary: 'japanese',
        englishMixLevel: 'none'
      },
      lyricsContent: '',
      theme: ''
    },
    finalOutput: null,
    isEditing: false,
    isLoading: false,
    error: null
  })

  // Step 1: 楽曲分析実行
  const executeAnalysis = useCallback(async (artist: string, song: string) => {
    setFlowState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      currentStep: 'analysis' 
    }))

    try {
      console.log('🔍 新アーキテクチャ: 楽曲分析開始')
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artist, song })
      })

      if (!response.ok) {
        throw new Error(`分析APIエラー: ${response.status}`)
      }

      const data = await response.json()
      
      // rawAnalysisフィールドが存在することを確認
      if (!data.rawAnalysis) {
        console.warn('⚠️ rawAnalysisフィールドが見つかりません - 旧APIレスポンス形式')
        throw new Error('新アーキテクチャに対応していない分析結果です')
      }

      console.log('✅ 楽曲分析完了:', data.rawAnalysis)

      setFlowState(prev => ({
        ...prev,
        analysisResult: data.rawAnalysis as RawAnalysisResult,
        isLoading: false,
        currentStep: 'decompose'
      }))

      return data.rawAnalysis as RawAnalysisResult

    } catch (error) {
      console.error('楽曲分析エラー:', error)
      setFlowState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '楽曲分析中にエラーが発生しました'
      }))
      throw error
    }
  }, [])

  // Step 2: 要素分解実行
  const executeDecomposition = useCallback(async (rawAnalysis: RawAnalysisResult) => {
    setFlowState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('🔧 新アーキテクチャ: 要素分解開始')

      const response = await fetch('/api/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawAnalysis })
      })

      if (!response.ok) {
        throw new Error(`分解APIエラー: ${response.status}`)
      }

      const data = await response.json()
      
      console.log('✅ 要素分解完了:', data.decomposedElements)

      setFlowState(prev => ({
        ...prev,
        decomposedElements: data.decomposedElements as DecomposedElements,
        isLoading: false,
        currentStep: 'settings'
      }))

      return data.decomposedElements as DecomposedElements

    } catch (error) {
      console.error('要素分解エラー:', error)
      setFlowState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '要素分解中にエラーが発生しました'
      }))
      throw error
    }
  }, [])

  // Step 3: ユーザー設定更新
  const updateUserSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setFlowState(prev => ({
      ...prev,
      userSettings: { ...prev.userSettings, ...newSettings }
    }))
  }, [])

  // Step 4: 最終生成実行
  const executeFinalGeneration = useCallback(async (
    decomposedElements: DecomposedElements, 
    userSettings: UserSettings
  ) => {
    setFlowState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('🚀 新アーキテクチャ: 最終生成開始')

      const response = await fetch('/api/generate-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          useNewArchitecture: true,
          decomposedElements,
          userSettings,
          // フォールバック用の基本フィールド（後方互換性）
          mode: 'simple',
          mood: decomposedElements.mood,
          musicStyle: decomposedElements.genre,
          theme: userSettings.theme,
          content: userSettings.lyricsContent,
          songLength: userSettings.songLength
        })
      })

      if (!response.ok) {
        throw new Error(`生成APIエラー: ${response.status}`)
      }

      const data = await response.json()
      
      console.log('✅ 最終生成完了:', data)

      const finalOutput: FinalOutput = {
        titles: data.titles || ['生成されたタイトル1', '生成されたタイトル2', '生成されたタイトル3'],
        lyrics: data.lyrics || '[Intro]\n生成された歌詞\n[Outro]',
        styleInstruction: data.styleInstruction || 'Generated style instruction',
        editableStyle: data.editableStyle !== undefined ? data.editableStyle : true,
        regenerationSupported: data.regenerationSupported !== undefined ? data.regenerationSupported : true,
        qualityCheck: data.qualityCheck || {
          hasJapanese: userSettings.language.primary === 'japanese',
          confidence: 'medium',
          issues: []
        }
      }

      setFlowState(prev => ({
        ...prev,
        finalOutput,
        isLoading: false,
        currentStep: 'output'
      }))

      return finalOutput

    } catch (error) {
      console.error('最終生成エラー:', error)
      setFlowState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '最終生成中にエラーが発生しました'
      }))
      throw error
    }
  }, [])

  // スタイル再生成実行
  const regenerateStyle = useCallback(async (
    currentStyleInstruction: string,
    regenerationReason: 'japanese_detected' | 'quality_improvement' | 'user_request' | 'optimization',
    issueDetails: string[] = []
  ) => {
    setFlowState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('🔄 スタイル再生成開始')

      const response = await fetch('/api/regenerate-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStyleInstruction,
          regenerationReason,
          issueDetails,
          decomposedElements: flowState.decomposedElements,
          enhancementLevel: 'major',
          preserveOriginalStructure: true
        })
      })

      if (!response.ok) {
        throw new Error(`再生成APIエラー: ${response.status}`)
      }

      const data = await response.json()
      
      console.log('✅ スタイル再生成完了:', data.newStyleInstruction)

      // finalOutputを更新
      setFlowState(prev => ({
        ...prev,
        finalOutput: prev.finalOutput ? {
          ...prev.finalOutput,
          styleInstruction: data.newStyleInstruction,
          qualityCheck: data.qualityCheck
        } : null,
        isLoading: false
      }))

      return {
        newStyleInstruction: data.newStyleInstruction,
        regenerationReason: data.regenerationReason,
        qualityCheck: data.qualityCheck
      }

    } catch (error) {
      console.error('スタイル再生成エラー:', error)
      setFlowState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'スタイル再生成中にエラーが発生しました'
      }))
      throw error
    }
  }, [flowState.decomposedElements])

  // フロー初期化
  const resetFlow = useCallback(() => {
    setFlowState({
      currentStep: 'input',
      analysisResult: null,
      decomposedElements: null,
      userSettings: {
        songLength: '3-4分',
        rapMode: 'none',
        language: {
          primary: 'japanese',
          englishMixLevel: 'none'
        },
        lyricsContent: '',
        theme: ''
      },
      finalOutput: null,
      isEditing: false,
      isLoading: false,
      error: null
    })
  }, [])

  // 編集モード切り替え
  const toggleEditingMode = useCallback(() => {
    setFlowState(prev => ({
      ...prev,
      isEditing: !prev.isEditing
    }))
  }, [])

  return {
    // 状態
    flowState,
    
    // アクション
    executeAnalysis,
    executeDecomposition,
    updateUserSettings,
    executeFinalGeneration,
    regenerateStyle,
    resetFlow,
    toggleEditingMode,
    
    // 便利なゲッター
    isReady: flowState.currentStep === 'output' && flowState.finalOutput !== null,
    canProceed: {
      toDecompose: flowState.analysisResult !== null,
      toSettings: flowState.decomposedElements !== null,
      toOutput: flowState.decomposedElements !== null && flowState.userSettings.lyricsContent.trim() !== ''
    }
  }
}