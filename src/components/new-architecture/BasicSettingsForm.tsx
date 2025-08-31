import React from 'react'
import { UserSettings } from '@/types/analysis'

interface BasicSettingsFormProps {
  settings: UserSettings
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void
  isLoading: boolean
}

export function BasicSettingsForm({ settings, onUpdateSettings, isLoading }: BasicSettingsFormProps) {
  const songLengthOptions = ['2-3分', '3-4分', '4-5分', '5分以上'] as const

  const rapModeOptions = [
    { value: 'none', label: 'ラップなし', description: '通常の歌唱のみ' },
    { value: 'partial', label: '一部ラップ', description: 'ラップセクションを含む' },
    { value: 'full', label: '全面ラップ', description: '完全なヒップホップ楽曲' }
  ] as const

  const languageOptions = [
    { value: 'japanese', label: '日本語', description: '日本語メインの歌詞' },
    { value: 'english', label: '英語', description: '英語メインの歌詞' }
  ] as const

  const englishMixLevels = [
    { value: 'none', label: 'なし', description: '完全に日本語のみ' },
    { value: 'light', label: '軽度', description: '10-20%程度の英語混在' },
    { value: 'moderate', label: '中程度', description: '30-50%程度の英語混在' },
    { value: 'heavy', label: '高度', description: '50-70%程度の英語混在' }
  ] as const

  return (
    <div className="space-y-6">
      {/* 楽曲の長さ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          楽曲の長さ
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {songLengthOptions.map((option) => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name="songLength"
                value={option}
                checked={settings.songLength === option}
                onChange={(e) => onUpdateSettings({ songLength: e.target.value as typeof option })}
                className="mr-2"
                disabled={isLoading}
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ラップモード */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ラップ要素
        </label>
        <div className="space-y-2">
          {rapModeOptions.map((option) => (
            <label key={option.value} className="flex items-start">
              <input
                type="radio"
                name="rapMode"
                value={option.value}
                checked={settings.rapMode === option.value}
                onChange={(e) => onUpdateSettings({ rapMode: e.target.value as typeof option.value })}
                className="mr-3 mt-1"
                disabled={isLoading}
              />
              <div>
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 言語設定 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          基本言語
        </label>
        <div className="space-y-2 mb-4">
          {languageOptions.map((option) => (
            <label key={option.value} className="flex items-start">
              <input
                type="radio"
                name="primaryLanguage"
                value={option.value}
                checked={settings.language.primary === option.value}
                onChange={(e) => onUpdateSettings({ 
                  language: { 
                    ...settings.language, 
                    primary: e.target.value as 'japanese' | 'english' 
                  } 
                })}
                className="mr-3 mt-1"
                disabled={isLoading}
              />
              <div>
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </div>
            </label>
          ))}
        </div>

        {/* 英語混在レベル */}
        {settings.language.primary === 'japanese' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              英語混在レベル
            </label>
            <div className="space-y-2">
              {englishMixLevels.map((option) => (
                <label key={option.value} className="flex items-start">
                  <input
                    type="radio"
                    name="englishMixLevel"
                    value={option.value}
                    checked={settings.language.englishMixLevel === option.value}
                    onChange={(e) => onUpdateSettings({ 
                      language: { 
                        ...settings.language, 
                        englishMixLevel: e.target.value as typeof option.value 
                      } 
                    })}
                    className="mr-3 mt-1"
                    disabled={isLoading}
                  />
                  <div>
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 内容反映度設定 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          内容反映度設定
        </label>
        <div className="space-y-2">
          <label className="flex items-start">
            <input
              type="radio"
              name="contentReflection"
              value="literal"
              checked={settings.contentReflection === 'literal'}
              onChange={(e) => onUpdateSettings({ contentReflection: e.target.value as 'literal' | 'metaphorical' | 'balanced' })}
              className="mr-3 mt-1"
              disabled={isLoading}
            />
            <div>
              <div className="text-sm font-medium">忠実反映</div>
              <div className="text-xs text-gray-500">専門用語・固有名詞をそのまま歌詞に使用</div>
            </div>
          </label>
          <label className="flex items-start">
            <input
              type="radio"
              name="contentReflection"
              value="metaphorical"
              checked={settings.contentReflection === 'metaphorical'}
              onChange={(e) => onUpdateSettings({ contentReflection: e.target.value as 'literal' | 'metaphorical' | 'balanced' })}
              className="mr-3 mt-1"
              disabled={isLoading}
            />
            <div>
              <div className="text-sm font-medium">比喩的表現</div>
              <div className="text-xs text-gray-500">内容を詩的・象徴的に表現</div>
            </div>
          </label>
          <label className="flex items-start">
            <input
              type="radio"
              name="contentReflection"
              value="balanced"
              checked={settings.contentReflection === 'balanced'}
              onChange={(e) => onUpdateSettings({ contentReflection: e.target.value as 'literal' | 'metaphorical' | 'balanced' })}
              className="mr-3 mt-1"
              disabled={isLoading}
            />
            <div>
              <div className="text-sm font-medium">バランス型</div>
              <div className="text-xs text-gray-500">重要部分は忠実、他は比喩的に</div>
            </div>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">歌詞内容への反映方法を選択してください</p>
      </div>

      {/* 歌詞テーマ */}
      <div>
        <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
          歌詞テーマ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="theme"
          value={settings.theme}
          onChange={(e) => onUpdateSettings({ theme: e.target.value })}
          placeholder="例: 青春、恋愛、友情、成長"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
          required
        />
        <p className="text-xs text-gray-500 mt-1">楽曲全体のテーマや使用シーンを入力</p>
      </div>

      {/* 歌詞内容 */}
      <div>
        <label htmlFor="lyricsContent" className="block text-sm font-medium text-gray-700 mb-2">
          歌詞に含めたい具体的な内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="lyricsContent"
          value={settings.lyricsContent}
          onChange={(e) => onUpdateSettings({ lyricsContent: e.target.value })}
          placeholder="具体的な歌詞の内容、メッセージ、ストーリーを入力してください"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
          required
        />
        <p className="text-xs text-gray-500 mt-1">歌詞に盛り込みたい具体的なメッセージや物語</p>
      </div>
    </div>
  )
}