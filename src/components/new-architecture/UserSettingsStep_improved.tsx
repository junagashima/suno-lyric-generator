import React, { useState } from 'react'
import { UserSettings, VocalAttribute, SUNO_ELEMENTS, SunoElementId } from '@/types/analysis'

// 🎯 Step 3: 改良版ユーザー設定コンポーネント
// ボーカル属性選択 + SUNO要素選択 + 既存機能保持

interface UserSettingsStepProps {
  settings: UserSettings
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void
  onGenerate: () => Promise<void>
  isLoading: boolean
}

export function UserSettingsStepImproved({ settings, onUpdateSettings, onGenerate, isLoading }: UserSettingsStepProps) {
  // SUNO要素選択の状態管理
  const [selectedSunoElements, setSelectedSunoElements] = useState<string[]>(
    settings.sunoElements || []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (settings.lyricsContent.trim() && settings.theme.trim() && !isLoading) {
      // 選択されたSUNO要素を設定に反映
      onUpdateSettings({ sunoElements: selectedSunoElements })
      await onGenerate()
    }
  }

  const isValid = settings.lyricsContent.trim() !== '' && settings.theme.trim() !== ''

  // 選択肢の定義
  const vocalAttributeOptions: VocalAttribute[] = [
    '女性（ソロ）', '男性（ソロ）', '中性的（ソロ）',
    '男女デュエット', '女性デュエット', '男性デュエット',
    '女性グループ（3人以上）', '男性グループ（3人以上）', '男女混合グループ',
    'コーラス重視（複数ボーカル）'
  ]

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

  // SUNO要素選択の処理
  const handleSunoElementToggle = (elementId: string) => {
    setSelectedSunoElements(prev => {
      if (prev.includes(elementId)) {
        return prev.filter(id => id !== elementId)
      } else if (prev.length < 3) {
        return [...prev, elementId]
      } else {
        // 3つまでの制限
        return prev
      }
    })
  }

  // カテゴリ別のSUNO要素取得
  const getSunoElementsByCategory = (category: string) => {
    return SUNO_ELEMENTS.filter(element => element.category === category)
  }

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
        {/* Step 3追加: ボーカル属性選択 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            🎤 ボーカル属性選択
            <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">重要</span>
          </h3>
          <p className="text-sm text-blue-600 mb-4">
            歌い手の性別・人数構成を選択してください
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {vocalAttributeOptions.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="vocalAttribute"
                  value={option}
                  checked={settings.vocalAttribute === option}
                  onChange={(e) => onUpdateSettings({ vocalAttribute: e.target.value as VocalAttribute })}
                  className="mr-2"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Step 3追加: SUNO最適化要素選択 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            ⚡ SUNO最適化要素選択
            <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
              {selectedSunoElements.length}/3選択
            </span>
          </h3>
          <p className="text-sm text-green-600 mb-4">
            ボーカルの特徴を3つまで選択してください（SUNOの音質向上に効果的）
          </p>

          {/* カテゴリ別表示 */}
          <div className="space-y-4">
            {['tone', 'delivery', 'emotion', 'pronunciation'].map(category => {
              const categoryElements = getSunoElementsByCategory(category)
              const categoryLabels = {
                tone: '🎨 トーン系',
                delivery: '🎵 歌唱法系', 
                emotion: '💫 感情表現系',
                pronunciation: '🔤 発音系'
              }

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
                          onClick={() => handleSunoElementToggle(element.id)}
                          disabled={isLoading || (!selectedSunoElements.includes(element.id) && selectedSunoElements.length >= 3)}
                          className={`w-full text-left p-3 rounded-md border transition-colors ${
                            selectedSunoElements.includes(element.id)
                              ? 'bg-green-100 border-green-300 text-green-800'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          } ${(!selectedSunoElements.includes(element.id) && selectedSunoElements.length >= 3) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-sm">{element.label}</div>
                              <div className="text-xs text-gray-600 mt-1">{element.description}</div>
                            </div>
                            {selectedSunoElements.includes(element.id) && (
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

          {selectedSunoElements.length === 3 && (
            <div className="mt-3 text-sm text-green-600 bg-green-100 p-2 rounded">
              ✅ 3つの要素が選択されました。これでSUNO最適化が有効になります。
            </div>
          )}
        </div>

        {/* 既存の設定項目 */}
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