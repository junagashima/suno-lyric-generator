import React, { useState } from 'react'
import { FinalOutput } from '@/types/analysis'
import { StyleCustomizationGuide } from './StyleCustomizationGuide'

// 🎯 Phase 2B: 新アーキテクチャ用最終出力表示コンポーネント

interface FinalOutputDisplayProps {
  output: FinalOutput
  onRegenerateStyle: (reason: 'japanese_detected' | 'quality_improvement' | 'user_request' | 'optimization', issues?: string[]) => Promise<void>
  onReset: () => void
  isLoading: boolean
}

export function FinalOutputDisplay({ 
  output, 
  onRegenerateStyle, 
  onReset, 
  isLoading 
}: FinalOutputDisplayProps) {
  const [activeTab, setActiveTab] = useState<'titles' | 'lyrics' | 'style'>('titles')
  const [showRegenerateOptions, setShowRegenerateOptions] = useState(false)
  const [isEditingStyle, setIsEditingStyle] = useState(false)
  const [editedStyle, setEditedStyle] = useState(output.styleInstruction)
  const [showCustomizationGuide, setShowCustomizationGuide] = useState(false)
  // 🎯 Phase 2: 歌詞編集機能追加
  const [isEditingLyrics, setIsEditingLyrics] = useState(false)
  const [editedLyrics, setEditedLyrics] = useState(output.lyrics)

  // スタイル指示の品質チェック結果を表示
  const getQualityBadge = () => {
    if (!output.qualityCheck) return null

    const { confidence, hasJapanese, issues } = output.qualityCheck

    if (hasJapanese || issues.length > 0) {
      return (
        <div className="flex items-center space-x-2">
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            ⚠️ 問題検出
          </span>
          {hasJapanese && (
            <span className="text-xs text-red-600">日本語混入</span>
          )}
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-2">
        <span className={`text-xs px-2 py-1 rounded-full ${
          confidence === 'high' ? 'bg-green-100 text-green-800' :
          confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {confidence === 'high' ? '✅ 高品質' :
           confidence === 'medium' ? '🔍 標準' : '⚠️ 要改善'}
        </span>
      </div>
    )
  }

  // タイトルコピー機能
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // TODO: トースト通知を実装
      console.log(`${type}をコピーしました`)
    } catch (error) {
      console.error('コピーに失敗しました:', error)
    }
  }

  // スタイル更新処理
  const handleStyleUpdate = (newStyle: string) => {
    setEditedStyle(newStyle)
  }

  // スタイル編集保存
  const handleSaveStyleEdit = () => {
    // 編集されたスタイルで再生成をトリガー
    // 実際の実装では、編集されたスタイルを使って再生成APIを呼び出す
    console.log('スタイル更新:', editedStyle)
    setIsEditingStyle(false)
    // TODO: 編集されたスタイルでの再生成処理
  }

  // 🎯 Phase 2: 歌詞編集保存処理
  const handleSaveLyricsEdit = () => {
    // 編集された歌詞を保存（即座に反映）
    console.log('歌詞更新:', editedLyrics)
    setIsEditingLyrics(false)
    // 編集内容は状態に保存され、コピー機能で使用される
  }

  // スタイル再生成処理
  const handleRegenerateStyle = async (
    reason: 'japanese_detected' | 'quality_improvement' | 'user_request' | 'optimization',
    issues?: string[]
  ) => {
    setShowRegenerateOptions(false)
    await onRegenerateStyle(reason, issues)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            🎤 生成完了
          </h2>
          <div className="flex items-center space-x-3">
            {getQualityBadge()}
            <button
              onClick={onReset}
              className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              🔄 最初から
            </button>
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          歌詞とスタイル指示の生成が完了しました。タブを切り替えて内容を確認してください。
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'titles', label: 'タイトル候補', icon: '📝' },
            { id: 'lyrics', label: '歌詞', icon: '🎵' },
            { id: 'style', label: 'スタイル指示', icon: '🎨' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* タイトル候補表示 */}
      {activeTab === 'titles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">📝 タイトル候補</h3>
            <span className="text-sm text-gray-500">{output.titles.length}個生成</span>
          </div>
          <div className="space-y-3">
            {output.titles.map((title, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-gray-900 font-medium">{title}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(title, 'タイトル')}
                  className="text-xs text-blue-600 hover:text-blue-800 border border-blue-300 px-2 py-1 rounded"
                >
                  📋 コピー
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 歌詞表示 */}
      {activeTab === 'lyrics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">🎵 生成された歌詞</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditingLyrics(!isEditingLyrics)}
                className="text-sm text-green-600 hover:text-green-800 border border-green-300 px-3 py-1 rounded"
                disabled={isLoading}
              >
                ✏️ 編集
              </button>
              <button
                onClick={() => copyToClipboard(isEditingLyrics ? editedLyrics : output.lyrics, '歌詞')}
                className="text-sm text-blue-600 hover:text-blue-800 border border-blue-300 px-3 py-1 rounded"
              >
                📋 全体コピー
              </button>
            </div>
          </div>

          {/* 歌詞の表示・編集 */}
          <div className="bg-gray-50 rounded-md p-4">
            {isEditingLyrics ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    歌詞を編集
                  </label>
                  <textarea
                    value={editedLyrics}
                    onChange={(e) => setEditedLyrics(e.target.value)}
                    className="w-full h-64 p-3 border border-gray-300 rounded-md text-sm font-mono"
                    placeholder="[Intro]&#10;歌詞内容...&#10;&#10;[Verse]&#10;歌詞内容...&#10;&#10;[Chorus]&#10;歌詞内容..."
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSaveLyricsEdit}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                  >
                    ✅ 保存
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingLyrics(false)
                      setEditedLyrics(output.lyrics)
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                  >
                    ❌ キャンセル
                  </button>
                </div>
                
                {/* 編集時の注意事項 */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="text-sm text-blue-800">
                    <strong>⚠️ 歌詞編集時の注意:</strong>
                    <ul className="mt-1 ml-4 list-disc space-y-1">
                      <li>SUNOタグ（[Intro], [Verse], [Chorus]等）は英語で保持してください</li>
                      <li>歌詞本文は日本語で記述し、タグとの混在に注意してください</li>
                      <li>楽曲構造を大幅に変更すると生成された音楽と合わない可能性があります</li>
                      <li>改行とタグの配置に注意して、SUNOが正しく認識できる形式を保ってください</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono leading-relaxed">
                {editedLyrics}
              </pre>
            )}
          </div>
          
          {!isEditingLyrics && (
            <div className="text-xs text-gray-500">
              ※ Sunoタグ（[Intro], [Verse], [Chorus]等）が含まれています
            </div>
          )}
        </div>
      )}

      {/* スタイル指示表示 */}
      {activeTab === 'style' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">🎨 英語スタイル指示</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCustomizationGuide(!showCustomizationGuide)}
                className="text-sm text-purple-600 hover:text-purple-800 border border-purple-300 px-3 py-1 rounded"
              >
                📖 カスタマイズガイド
              </button>
              {output.editableStyle && (
                <button
                  onClick={() => setIsEditingStyle(!isEditingStyle)}
                  className="text-sm text-green-600 hover:text-green-800 border border-green-300 px-3 py-1 rounded"
                  disabled={isLoading}
                >
                  ✏️ 編集
                </button>
              )}
              {output.regenerationSupported && (
                <button
                  onClick={() => setShowRegenerateOptions(!showRegenerateOptions)}
                  className="text-sm text-orange-600 hover:text-orange-800 border border-orange-300 px-3 py-1 rounded"
                  disabled={isLoading}
                >
                  🔄 再生成
                </button>
              )}
              <button
                onClick={() => copyToClipboard(isEditingStyle ? editedStyle : output.styleInstruction, 'スタイル指示')}
                className="text-sm text-blue-600 hover:text-blue-800 border border-blue-300 px-3 py-1 rounded"
              >
                📋 コピー
              </button>
            </div>
          </div>

          {/* 再生成オプション */}
          {showRegenerateOptions && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-3">🔄 再生成理由を選択</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleRegenerateStyle('japanese_detected', output.qualityCheck?.issues)}
                  className="text-left p-2 text-sm bg-white border border-yellow-300 rounded hover:bg-yellow-50"
                  disabled={isLoading}
                >
                  <div className="font-medium">日本語混入修正</div>
                  <div className="text-xs text-gray-500">日本語を完全に英語化</div>
                </button>
                <button
                  onClick={() => handleRegenerateStyle('quality_improvement')}
                  className="text-left p-2 text-sm bg-white border border-yellow-300 rounded hover:bg-yellow-50"
                  disabled={isLoading}
                >
                  <div className="font-medium">品質向上</div>
                  <div className="text-xs text-gray-500">SUNO最適化を強化</div>
                </button>
                <button
                  onClick={() => handleRegenerateStyle('optimization')}
                  className="text-left p-2 text-sm bg-white border border-yellow-300 rounded hover:bg-yellow-50"
                  disabled={isLoading}
                >
                  <div className="font-medium">一般最適化</div>
                  <div className="text-xs text-gray-500">全般的な改善</div>
                </button>
                <button
                  onClick={() => setShowRegenerateOptions(false)}
                  className="text-left p-2 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                >
                  <div className="font-medium">キャンセル</div>
                  <div className="text-xs text-gray-500">再生成しない</div>
                </button>
              </div>
            </div>
          )}

          {/* カスタマイズガイド */}
          {showCustomizationGuide && (
            <StyleCustomizationGuide 
              currentStyle={isEditingStyle ? editedStyle : output.styleInstruction}
              onStyleUpdate={handleStyleUpdate}
            />
          )}

          {/* スタイル指示の表示・編集 */}
          <div className="bg-gray-50 rounded-md p-4">
            {isEditingStyle ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    英語スタイル指示を編集
                  </label>
                  <textarea
                    value={editedStyle}
                    onChange={(e) => setEditedStyle(e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 rounded-md text-sm"
                    placeholder="Purpose: track, about minutes, Japanese lyrics. Mood: . Tempo: . Rhythm: . Instruments: . Vocals: . Structure: . Genre: . Forbidden: ."
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSaveStyleEdit}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                  >
                    ✅ 保存
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingStyle(false)
                      setEditedStyle(output.styleInstruction)
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                  >
                    ❌ キャンセル
                  </button>
                </div>
                
                {/* 編集時の注意事項 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="text-sm text-yellow-800">
                    <strong>⚠️ 編集時の注意:</strong>
                    <ul className="mt-1 ml-4 list-disc space-y-1">
                      <li>日本語を含めるとSUNO AIが正しく認識しない可能性があります</li>
                      <li>大幅な変更は分析した楽曲イメージから離れる可能性があります</li>
                      <li>カスタマイズガイドを参考に適切な英語表現を使用してください</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-900 leading-relaxed">
                {editedStyle}
              </div>
            )}
          </div>

          {/* 品質チェック詳細 */}
          {output.qualityCheck && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">🔍 品質チェック結果</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>• <strong>信頼度:</strong> {output.qualityCheck.confidence}</div>
                <div>• <strong>日本語混入:</strong> {output.qualityCheck.hasJapanese ? 'あり' : 'なし'}</div>
                {output.qualityCheck.issues.length > 0 && (
                  <div>• <strong>検出された問題:</strong> {output.qualityCheck.issues.join(', ')}</div>
                )}
              </div>
            </div>
          )}

          {/* 使用方法ガイド */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-green-800 mb-2">📖 使用方法</h4>
            <div className="text-sm text-green-700 space-y-2">
              <div>
                <strong>🎵 このテキストをSuno AIの「Style of Music」欄にコピー&ペーストしてください</strong>
              </div>
              <div className="bg-white rounded p-2 text-xs font-mono text-gray-800">
                📋 コピーボタンでクリップボードにコピーできます
              </div>
              <div className="space-y-1 text-xs">
                <div>• <strong>カスタマイズ:</strong> 「✏️ 編集」で内容を調整可能</div>
                <div>• <strong>ガイド:</strong> 「📖 カスタマイズガイド」で英語表現の効果を確認</div>
                <div>• <strong>再生成:</strong> 「🔄 再生成」で品質改善や日本語除去</div>
                <div>• <strong>注意:</strong> 大幅な変更は元の楽曲イメージから逸脱する可能性があります</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新アーキテクチャ機能説明 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <details className="cursor-pointer">
          <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
            ✨ 新アーキテクチャの改善点
          </summary>
          <div className="mt-2 text-xs text-gray-600 space-y-1">
            <div>• <strong>段階的生成:</strong> 楽曲分析 → 要素分解 → ユーザー設定 → 最終生成</div>
            <div>• <strong>日本語混入防止:</strong> 英語スタイル指示の自動品質チェック・再生成</div>
            <div>• <strong>SUNO最適化:</strong> AI音楽生成に特化した8要素構造</div>
            <div>• <strong>カスタマイズ性:</strong> 詳細なユーザー設定とリアルタイム調整</div>
            <div>• <strong>品質保証:</strong> 各ステップでの検証と改善サイクル</div>
          </div>
        </details>
      </div>

      {/* ローディング状態 */}
      {isLoading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-700">処理中...</span>
          </div>
        </div>
      )}
    </div>
  )
}