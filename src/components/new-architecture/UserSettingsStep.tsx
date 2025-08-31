import React from 'react'
import { UserSettings, VocalAttribute } from '@/types/analysis'

// 🎯 Phase 2B: 新アーキテクチャ用ユーザー設定コンポーネント

interface UserSettingsStepProps {
  settings: UserSettings
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void
  onGenerate: () => Promise<void>
  isLoading: boolean
}

export function UserSettingsStep({ settings, onUpdateSettings, onGenerate, isLoading }: UserSettingsStepProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (settings.lyricsContent.trim() && settings.theme.trim() && !isLoading) {
      await onGenerate()
    }
  }

  const isValid = settings.lyricsContent.trim() !== '' && settings.theme.trim() !== ''

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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          ⚙️ ユーザー設定
        </h2>
        <p className="text-gray-600 text-sm">
          歌詞の内容や楽曲の詳細設定をカスタマイズしてください
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            placeholder="例: 卒業式での友達との別れ、新しい挑戦への決意、大切な人への感謝の気持ち"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            disabled={isLoading}
            required
          />
          <p className="text-xs text-gray-500 mt-1">歌詞に必ず反映させたい具体的な内容やメッセージ</p>
        </div>

        {/* 楽曲長さ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            楽曲の長さ
          </label>
          <div className="grid grid-cols-2 gap-3">
            {songLengthOptions.map((length) => (
              <button
                key={length}
                type="button"
                onClick={() => onUpdateSettings({ songLength: length })}
                className={`p-3 text-sm rounded-md border-2 transition-colors ${
                  settings.songLength === length
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
                disabled={isLoading}
              >
                {length}
              </button>
            ))}
          </div>
        </div>

        {/* ラップモード */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ラップモード
          </label>
          <div className="space-y-2">
            {rapModeOptions.map((mode) => (
              <label key={mode.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="rapMode"
                  value={mode.value}
                  checked={settings.rapMode === mode.value}
                  onChange={(e) => onUpdateSettings({ rapMode: e.target.value as typeof mode.value })}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">{mode.label}</div>
                  <div className="text-xs text-gray-500">{mode.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 言語設定 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              基本言語
            </label>
            <div className="grid grid-cols-2 gap-3">
              {languageOptions.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => onUpdateSettings({ 
                    language: { ...settings.language, primary: lang.value }
                  })}
                  className={`p-3 text-sm rounded-md border-2 transition-colors ${
                    settings.language.primary === lang.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <div className="font-medium">{lang.label}</div>
                  <div className="text-xs text-gray-500">{lang.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 英語混在レベル（日本語選択時のみ表示） */}
          {settings.language.primary === 'japanese' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                英語混在レベル
              </label>
              <div className="grid grid-cols-2 gap-3">
                {englishMixLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => onUpdateSettings({ 
                      language: { ...settings.language, englishMixLevel: level.value }
                    })}
                    className={`p-3 text-sm rounded-md border-2 transition-colors ${
                      settings.language.englishMixLevel === level.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <div className="font-medium">{level.label}</div>
                    <div className="text-xs text-gray-500">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 設定確認 */}
        <div className="bg-gray-50 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">📋 設定内容確認</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• <strong>楽曲長:</strong> {settings.songLength}</div>
            <div>• <strong>ラップ:</strong> {rapModeOptions.find(m => m.value === settings.rapMode)?.label}</div>
            <div>• <strong>言語:</strong> {languageOptions.find(l => l.value === settings.language.primary)?.label}
              {settings.language.primary === 'japanese' && settings.language.englishMixLevel !== 'none' && 
                ` (英語${englishMixLevels.find(l => l.value === settings.language.englishMixLevel)?.label})`}
            </div>
            <div>• <strong>テーマ:</strong> {settings.theme || '未入力'}</div>
            <div>• <strong>内容:</strong> {settings.lyricsContent ? `${settings.lyricsContent.substring(0, 30)}...` : '未入力'}</div>
          </div>
        </div>

        {/* 生成ボタン */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              歌詞・スタイル生成中...
            </>
          ) : (
            <>
              🎤 歌詞・スタイル指示を生成
            </>
          )}
        </button>
      </form>

      {/* ヒント */}
      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <h3 className="text-sm font-medium text-blue-800 mb-2">💡 設定のコツ</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• テーマは楽曲の使用シーンや雰囲気を表現</li>
          <li>• 歌詞内容は具体的で感情的な表現を含める</li>
          <li>• 英語混在レベルはターゲット層に合わせて調整</li>
          <li>• ラップモードは楽曲のジャンルに応じて選択</li>
        </ul>
      </div>
    </div>
  )
}