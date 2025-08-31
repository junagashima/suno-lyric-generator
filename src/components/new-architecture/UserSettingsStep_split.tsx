import React, { useState } from 'react'
import { UserSettings, VocalAttribute } from '@/types/analysis'
import { VocalAttributeSelector } from './VocalAttributeSelector'
import { SunoElementsSelector } from './SunoElementsSelector'
import { BasicSettingsForm } from './BasicSettingsForm'

interface UserSettingsStepProps {
  settings: UserSettings
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void
  onGenerate: () => Promise<void>
  isLoading: boolean
}

export function UserSettingsStep({ settings, onUpdateSettings, onGenerate, isLoading }: UserSettingsStepProps) {
  const [selectedSunoElements, setSelectedSunoElements] = useState(() => 
    settings.sunoElements || []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (settings.lyricsContent.trim() && settings.theme.trim() && !isLoading) {
      onUpdateSettings({ sunoElements: selectedSunoElements })
      await onGenerate()
    }
  }

  const handleSunoElementToggle = (elementId: string) => {
    setSelectedSunoElements(prev => {
      if (prev.includes(elementId)) {
        return prev.filter(id => id !== elementId)
      } else if (prev.length < 3) {
        return [...prev, elementId]
      } else {
        return prev
      }
    })
  }

  const handleVocalAttributeSelect = (attribute: VocalAttribute) => {
    onUpdateSettings({ vocalAttribute: attribute })
  }

  const isValid = settings.lyricsContent.trim() !== '' && settings.theme.trim() !== ''

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          ⚙️ ユーザー設定・カスタマイズ
        </h2>
        <p className="text-gray-600 text-sm">
          歌詞の内容や楽曲の詳細設定をカスタマイズしてください
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ボーカル属性選択 */}
        <VocalAttributeSelector
          selectedAttribute={settings.vocalAttribute}
          onSelect={handleVocalAttributeSelect}
          isLoading={isLoading}
        />

        {/* SUNO最適化要素選択 */}
        <SunoElementsSelector
          selectedElements={selectedSunoElements}
          onToggle={handleSunoElementToggle}
          isLoading={isLoading}
        />

        {/* 基本設定 */}
        <BasicSettingsForm
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          isLoading={isLoading}
        />

        {/* 生成ボタン */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                生成中...
              </>
            ) : (
              <>
                🎵 タイトル・歌詞・スタイル指示を生成
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-2">
            全ての設定を元に、SUNOで使用可能な楽曲要素を生成します
          </p>
        </div>
      </form>
    </div>
  )
}