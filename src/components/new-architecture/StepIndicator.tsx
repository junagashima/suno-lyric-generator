import React from 'react'
import { AppFlowState } from '@/types/analysis'

// 🎯 Phase 2A: 新アーキテクチャ用ステップインジケーター

interface StepIndicatorProps {
  currentStep: AppFlowState['currentStep']
  isLoading: boolean
}

const steps = [
  { id: 'input', label: '楽曲情報入力', icon: '🎵' },
  { id: 'analysis', label: '楽曲分析', icon: '🔍' },
  { id: 'decompose', label: '要素分解', icon: '🔧' },
  { id: 'settings', label: 'ユーザー設定', icon: '⚙️' },
  { id: 'output', label: '最終出力', icon: '🎤' }
] as const

export function StepIndicator({ currentStep, isLoading }: StepIndicatorProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        🚀 新アーキテクチャフロー
      </h2>
      
      <div className="flex items-center justify-between relative">
        {/* プログレスライン */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 -z-10">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ 
              width: currentStepIndex >= 0 ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%' 
            }}
          />
        </div>

        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = index < currentStepIndex
          const isPending = index > currentStepIndex

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              {/* ステップアイコン */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-300
                  ${isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white animate-pulse' :
                    'bg-gray-200 text-gray-500'}
                `}
              >
                {isCompleted ? '✓' : 
                 isActive && isLoading ? '⏳' : 
                 step.icon}
              </div>

              {/* ステップラベル */}
              <span
                className={`
                  mt-2 text-xs font-medium text-center max-w-20
                  ${isActive ? 'text-blue-600' :
                    isCompleted ? 'text-green-600' :
                    'text-gray-400'}
                `}
              >
                {step.label}
              </span>

              {/* ローディング状態表示 */}
              {isActive && isLoading && (
                <div className="mt-1 text-xs text-blue-500 animate-pulse">
                  処理中...
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 現在のステップ説明 */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {getCurrentStepDescription(currentStep, isLoading)}
        </p>
      </div>
    </div>
  )
}

function getCurrentStepDescription(currentStep: AppFlowState['currentStep'], isLoading: boolean): string {
  if (isLoading) {
    switch (currentStep) {
      case 'analysis': return 'AIが楽曲を分析しています...'
      case 'decompose': return 'SUNO要素に分解しています...'
      case 'output': return '歌詞とスタイルを生成しています...'
      default: return '処理中...'
    }
  }

  switch (currentStep) {
    case 'input':
      return 'アーティスト名と楽曲名を入力してください'
    case 'analysis':
      return '楽曲分析が完了しました。次のステップに進んでください'
    case 'decompose':
      return '楽曲をSUNO要素に分解しました。設定を確認してください'
    case 'settings':
      return 'お好みの設定を選択してください'
    case 'output':
      return '歌詞とスタイル指示の生成が完了しました'
    default:
      return ''
  }
}