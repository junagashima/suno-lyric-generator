'use client'

import React, { useState } from 'react'

interface Props {
  data: any
  isLoading: boolean
  onUpdateData?: (updatedData: any) => void
}

export function EditableResultDisplay({ data, isLoading, onUpdateData }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedLyrics, setEditedLyrics] = useState('')
  const [editedStyleInstruction, setEditedStyleInstruction] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // データが更新された時に編集フィールドを同期
  React.useEffect(() => {
    if (data?.lyrics) setEditedLyrics(data.lyrics)
    if (data?.styleInstruction) setEditedStyleInstruction(data.styleInstruction)
  }, [data])

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
      alert('コピーに失敗しました')
    }
  }

  const handleSaveEdit = () => {
    if (onUpdateData) {
      onUpdateData({
        ...data,
        lyrics: editedLyrics,
        styleInstruction: editedStyleInstruction
      })
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedLyrics(data?.lyrics || '')
    setEditedStyleInstruction(data?.styleInstruction || '')
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">生成中...</p>
        <p className="text-sm text-gray-500">
          AI分析と歌詞生成には少々時間がかかります
        </p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-6xl mb-4">🎵</div>
        <h3 className="text-lg font-semibold mb-2">生成結果がここに表示されます</h3>
        <p className="text-sm text-center">
          楽曲分析から始まる新アーキテクチャフローで<br/>
          高品質な歌詞とスタイル指示を生成しましょう
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">🎤 生成結果</h2>
        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              ✏️ 編集
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveEdit}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                ✅ 保存
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                ❌ キャンセル
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* タイトル候補ウィンドウ */}
        {data.titles && data.titles.length > 0 && (
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                ✨ タイトル候補
              </h3>
              <span className="text-sm text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                {data.titles.length}個の候補
              </span>
            </div>
            <div className="space-y-3">
              {data.titles.map((title: string, index: number) => (
                <div key={index} className="flex items-center justify-between bg-white p-4 rounded-md border border-yellow-200 hover:bg-yellow-25 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-800 text-lg">{title}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(title, `title-${index}`)}
                    className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    {copiedField === `title-${index}` ? '✓ コピー済み' : 'コピー'}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-yellow-700 mt-3 bg-yellow-100 p-2 rounded">
              💡 お気に入りのタイトルをコピーしてSuno AIで使用してください
            </p>
          </div>
        )}

        {/* 歌詞セクション */}
        {data.lyrics && (
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                🎵 生成された歌詞
              </h3>
              <button
                onClick={() => copyToClipboard(isEditing ? editedLyrics : data.lyrics, 'lyrics')}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {copiedField === 'lyrics' ? '✓ コピー済み' : '📋 歌詞をコピー'}
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={editedLyrics}
                onChange={(e) => setEditedLyrics(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm bg-white border border-blue-300 rounded-md resize-y"
                placeholder="歌詞を編集してください..."
              />
            ) : (
              <div className="bg-white p-4 rounded border border-blue-200">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                  {data.lyrics}
                </pre>
              </div>
            )}

            <p className="text-xs text-blue-700 mt-3 bg-blue-100 p-2 rounded">
              💡 この歌詞をSuno AIの「歌詞」欄にそのままコピー&ペーストしてください
            </p>
          </div>
        )}

        {/* 英語スタイル指示セクション */}
        {data.styleInstruction && (
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                🌍 英語スタイル指示
              </h3>
              <button
                onClick={() => copyToClipboard(isEditing ? editedStyleInstruction : data.styleInstruction, 'style')}
                className="text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                {copiedField === 'style' ? '✓ コピー済み' : '📋 スタイル指示をコピー'}
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={editedStyleInstruction}
                onChange={(e) => setEditedStyleInstruction(e.target.value)}
                className="w-full h-32 p-4 font-mono text-sm bg-white border border-green-300 rounded-md resize-y"
                placeholder="スタイル指示を編集してください..."
              />
            ) : (
              <div className="bg-white p-4 rounded border border-green-200">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                  {data.styleInstruction}
                </pre>
              </div>
            )}

            <div className="text-xs text-green-700 mt-3 bg-green-100 p-2 rounded">
              🔧 <strong>使用方法:</strong> このテキストをSuno AIの「Style of Music」欄にコピー&ペーストしてください
            </div>
          </div>
        )}

        {/* SUNOタグセクション */}
        {data.sunoTags && (
          <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                🏷️ SUNOタグ
              </h3>
              <button
                onClick={() => copyToClipboard(data.sunoTags, 'suno-tags')}
                className="text-sm bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                {copiedField === 'suno-tags' ? '✓ コピー済み' : '📋 タグをコピー'}
              </button>
            </div>

            <div className="bg-white p-4 rounded border border-purple-200">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                {data.sunoTags}
              </pre>
            </div>

            <p className="text-xs text-purple-700 mt-3 bg-purple-100 p-2 rounded">
              💡 これらのタグは歌詞と一緒にSUNO AIに入力してください（正しいSUNOタグ形式）
            </p>
          </div>
        )}
      </div>

      {/* 編集モード時の注意事項 */}
      {isEditing && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 text-lg">⚠️</span>
            <div className="text-sm text-yellow-800">
              <strong>編集モード:</strong> 
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>歌詞とスタイル指示を自由に編集できます</li>
                <li>「保存」で変更を適用、「キャンセル」で元に戻します</li>
                <li>編集後もSUNOタグは自動で更新されません</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}