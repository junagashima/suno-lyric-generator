import React, { useState } from 'react'

// 🎯 Phase 2A: 新アーキテクチャ用楽曲情報入力コンポーネント

interface MusicInputStepProps {
  onAnalyze: (artist: string, song: string) => Promise<void>
  isLoading: boolean
}

export function MusicInputStep({ onAnalyze, isLoading }: MusicInputStepProps) {
  const [artist, setArtist] = useState('')
  const [song, setSong] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (artist.trim() && song.trim() && !isLoading) {
      await onAnalyze(artist.trim(), song.trim())
    }
  }

  const isValid = artist.trim() !== '' && song.trim() !== ''

  // サンプル楽曲データ
  const sampleSongs = [
    { artist: 'あいみょん', song: 'マリーゴールド' },
    { artist: 'Official髭男dism', song: 'Pretender' },
    { artist: 'King Gnu', song: '白日' },
    { artist: 'YOASOBI', song: '夜に駆ける' }
  ]

  const fillSample = (sampleArtist: string, sampleSong: string) => {
    setArtist(sampleArtist)
    setSong(sampleSong)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          🎵 楽曲情報入力
        </h2>
        <p className="text-gray-600 text-sm">
          分析したい楽曲のアーティスト名と楽曲名を入力してください
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* アーティスト名 */}
        <div>
          <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-2">
            アーティスト名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="例: あいみょん"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            required
          />
        </div>

        {/* 楽曲名 */}
        <div>
          <label htmlFor="song" className="block text-sm font-medium text-gray-700 mb-2">
            楽曲名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="song"
            value={song}
            onChange={(e) => setSong(e.target.value)}
            placeholder="例: マリーゴールド"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            required
          />
        </div>

        {/* サンプル楽曲 */}
        <div className="bg-gray-50 rounded-md p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">サンプル楽曲:</p>
          <div className="grid grid-cols-2 gap-2">
            {sampleSongs.map((sample, index) => (
              <button
                key={index}
                type="button"
                onClick={() => fillSample(sample.artist, sample.song)}
                className="text-left p-2 text-sm bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <div className="font-medium text-gray-800">{sample.song}</div>
                <div className="text-gray-500">{sample.artist}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 分析ボタン */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              分析中...
            </>
          ) : (
            <>
              🔍 楽曲分析を開始
            </>
          )}
        </button>
      </form>

      {/* 例示表示への案内 */}
      <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-400 rounded">
        <h3 className="text-sm font-medium text-green-800 mb-2">🎯 楽曲例示・サンプル選択</h3>
        <p className="text-sm text-green-700 mb-2">
          右側の「楽曲例示・サンプル選択」から人気楽曲を選んで分析することもできます。
        </p>
        <div className="text-xs text-green-600">
          ジャンル別に整理されたサンプル楽曲から、分析したい楽曲の系統を参考にできます
        </div>
      </div>

      {/* 説明 */}
      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <h3 className="text-sm font-medium text-blue-800 mb-2">💡 新アーキテクチャについて</h3>
        <p className="text-sm text-blue-700">
          この新システムでは、楽曲分析 → 要素分解 → 個人設定 → 最終生成の段階的なフローで、
          より精密で高品質な歌詞・スタイル指示を生成します。
        </p>
      </div>

      {/* 機能説明 */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">🎯</span>
          精密な楽曲分析とSUNO要素への分解
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">⚙️</span>
          カスタマイズ可能なユーザー設定
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">🔄</span>
          英語スタイル指示の自動品質チェック・再生成
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">✨</span>
          日本語混入問題の根本的解決
        </div>
      </div>
    </div>
  )
}