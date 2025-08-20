'use client'

import { useState } from 'react'

interface Props {
  data: any
  isLoading: boolean
}

export function ResultDisplay({ data, isLoading }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

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
          左側のフォームに必要事項を入力して<br/>
          「歌詞・スタイルを生成する」ボタンをクリックしてください
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🎤 生成結果</h2>

      {/* タイトル候補 */}
      {data.titles && data.titles.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            ✨ タイトル候補
          </h3>
          <div className="space-y-2">
            {data.titles.map((title: string, index: number) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md">
                <span className="font-medium text-gray-800">{title}</span>
                <button
                  onClick={() => copyToClipboard(title, `title-${index}`)}
                  className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                >
                  {copiedField === `title-${index}` ? '✓ コピー済み' : 'コピー'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 歌詞（SUNOタグ付き） */}
      {data.lyrics && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              📝 歌詞（Sunoタグ付き）
            </h3>
            <button
              onClick={() => copyToClipboard(data.lyrics, 'lyrics')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {copiedField === 'lyrics' ? '✓ コピー済み' : 'コピー'}
            </button>
          </div>
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
              {data.lyrics}
            </pre>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            ※ このテキストをそのままSuno AIの歌詞欄にコピー＆ペーストしてください
          </p>
        </div>
      )}

      {/* 英語スタイル指示 */}
      {data.styleInstruction && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              🌍 英語スタイル指示
            </h3>
            <button
              onClick={() => copyToClipboard(data.styleInstruction, 'style')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {copiedField === 'style' ? '✓ コピー済み' : 'スタイル指示をコピー'}
            </button>
          </div>
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <p className="text-sm text-gray-800 leading-relaxed">
              {data.styleInstruction}
            </p>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            ※ このテキストをSuno AIの「Style of Music」欄にコピー＆ペーストしてください
          </p>
        </div>
      )}

      {/* Sunoでの使い方ガイド */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          🚀 Suno AIでの使用方法
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Suno AIのサイト（suno.ai）にアクセスし、「Custom」モードを選択</li>
          <li>「Song Description」欄は空欄のままにする</li>
          <li>「Style of Music」欄に<strong>英語スタイル指示</strong>をコピー＆ペースト</li>
          <li>「Lyrics」欄に<strong>歌詞（Sunoタグ付き）</strong>をコピー＆ペースト</li>
          <li>タイトルは候補から選んで入力するか、お好みで変更</li>
          <li>「Create」ボタンをクリックして楽曲を生成</li>
        </ol>
        <div className="mt-4 p-3 bg-purple-100 rounded-md">
          <p className="text-xs text-purple-800">
            <strong>💡 ヒント:</strong> 
            初回生成で思った通りの結果にならない場合は、スタイル指示を微調整したり、
            歌詞の一部を変更して再生成してみてください。
          </p>
        </div>
      </div>

      {/* 再生成ボタン */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          結果に満足できない場合は、フォームの内容を調整して再生成してください
        </p>
      </div>
    </div>
  )
}
