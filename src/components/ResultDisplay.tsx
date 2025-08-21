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

      {/* デバッグ情報（開発時のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-3 rounded text-xs text-gray-600">
          <strong>Debug:</strong> titles = {JSON.stringify(data.titles)}, length = {data.titles?.length || 0}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* タイトル候補ウィンドウ */}
        {data.titles && data.titles.length > 0 ? (
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

        {/* 歌詞ウィンドウ（Sunoタグ付き） */}
        {data.lyrics && (
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                📝 歌詞（Sunoタグ付き）
              </h3>
              <button
                onClick={() => copyToClipboard(data.lyrics, 'lyrics')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                {copiedField === 'lyrics' ? '✓ コピー済み' : '歌詞をコピー'}
              </button>
            </div>
            <div className="bg-white p-5 rounded-md border-2 border-gray-200 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                {data.lyrics}
              </pre>
            </div>
            <div className="mt-3 p-3 bg-blue-100 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>📋 使用方法:</strong> このテキストをそのままSuno AIの「Lyrics」欄にコピー＆ペーストしてください
              </p>
            </div>
          </div>
        ) : (
          /* タイトル候補が見つからない場合の表示 */
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ タイトル候補が生成されませんでした</h3>
            <p className="text-sm text-red-700">
              AI応答からタイトルを抽出できませんでした。手動でタイトルを設定してください。
            </p>
          </div>
        )}

        {/* スタイル指示ウィンドウ */}
        {data.styleInstruction && (
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                🌍 英語スタイル指示
              </h3>
              <button
                onClick={() => copyToClipboard(data.styleInstruction, 'style')}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                {copiedField === 'style' ? '✓ コピー済み' : 'スタイル指示をコピー'}
              </button>
            </div>
            <div className="bg-white p-5 rounded-md border-2 border-gray-200">
              <p className="text-sm text-gray-800 leading-relaxed font-medium">
                {data.styleInstruction}
              </p>
            </div>
            <div className="mt-3 p-3 bg-green-100 rounded-md">
              <p className="text-sm text-green-800">
                <strong>🎛️ 使用方法:</strong> このテキストをSuno AIの「Style of Music」欄にコピー＆ペーストしてください
              </p>
            </div>

            {/* 設定要素の確認表示 */}
            {data.settings && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">🔧 反映された設定要素:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                  <div><strong>雰囲気:</strong> {data.settings.mood ? '✓' : '✗'}</div>
                  <div><strong>音楽スタイル:</strong> {data.settings.musicStyle ? '✓' : '✗'}</div>
                  <div><strong>テーマ:</strong> {data.settings.theme ? '✓' : '✗'}</div>
                  <div><strong>ボーカル設定:</strong> {data.settings.vocal ? '✓' : '✗'}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sunoでの使い方ガイド */}
      <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200 shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          🚀 Suno AIでの使用方法
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-4 rounded-md border border-purple-200">
            <div className="text-2xl mb-2">1️⃣</div>
            <h4 className="font-semibold text-purple-800 mb-2">準備</h4>
            <p className="text-sm text-gray-700">Suno AIのサイト（suno.ai）にアクセスし、「Custom」モードを選択</p>
          </div>
          <div className="bg-white p-4 rounded-md border border-purple-200">
            <div className="text-2xl mb-2">2️⃣</div>
            <h4 className="font-semibold text-purple-800 mb-2">スタイル設定</h4>
            <p className="text-sm text-gray-700">「Style of Music」欄に<strong>英語スタイル指示</strong>をペースト</p>
          </div>
          <div className="bg-white p-4 rounded-md border border-purple-200">
            <div className="text-2xl mb-2">3️⃣</div>
            <h4 className="font-semibold text-purple-800 mb-2">歌詞設定</h4>
            <p className="text-sm text-gray-700">「Lyrics」欄に<strong>歌詞（Sunoタグ付き）</strong>をペースト</p>
          </div>
        </div>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 bg-purple-100 p-4 rounded-md">
          <li>「Song Description」欄は空欄のまま</li>
          <li>タイトルは候補から選んで入力（または自由に変更）</li>
          <li>「Create」ボタンをクリックして楽曲を生成</li>
        </ol>
        <div className="mt-4 p-3 bg-purple-100 rounded-md">
          <p className="text-sm text-purple-800">
            <strong>💡 ヒント:</strong> 
            初回生成で思った通りの結果にならない場合は、スタイル指示を微調整したり、
            歌詞の一部を変更して再生成してみてください。
          </p>
        </div>
      </div>

      {/* 再生成案内 */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-600 mb-2">
          結果に満足できない場合は、フォームの内容を調整して再生成してください
        </p>
        <p className="text-xs text-gray-500">
          ※ 各ウィンドウは独立しているため、必要な部分だけをコピーして使用できます
        </p>
      </div>
    </div>
  )
}