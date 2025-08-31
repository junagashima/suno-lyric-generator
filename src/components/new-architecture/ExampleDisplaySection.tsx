import React, { useState } from 'react'

interface ExampleSong {
  artist: string
  song: string
  genre: string
  description: string
  features: string[]
}

// サンプル楽曲データ
const exampleSongs: ExampleSong[] = [
  {
    artist: "あいみょん",
    song: "マリーゴールド",
    genre: "J-POPバラード",
    description: "温かく優しい雰囲気のバラード。アコースティックギター中心の楽器構成",
    features: ["女性ソロボーカル", "アコースティック", "温かい雰囲気", "日本語歌詞"]
  },
  {
    artist: "Official髭男dism",
    song: "Pretender",
    genre: "J-ROCKポップス",
    description: "エモーショナルなロックバラード。ピアノとギターの組み合わせが印象的",
    features: ["男性ソロボーカル", "ピアノロック", "感情的", "英語混在"]
  },
  {
    artist: "YOASOBI",
    song: "夜に駆ける",
    genre: "エレクトロポップ",
    description: "現代的なエレクトロポップサウンド。高いBPMとデジタル楽器が特徴",
    features: ["女性ソロボーカル", "エレクトロニック", "アップテンポ", "ストーリー性"]
  },
  {
    artist: "米津玄師",
    song: "Lemon",
    genre: "オルタナティブポップ",
    description: "独特の世界観を持つポップス。オーケストラ要素も含む壮大な楽曲",
    features: ["男性ソロボーカル", "オーケストラ", "切ない雰囲気", "映画的"]
  },
  {
    artist: "King Gnu",
    song: "白日",
    genre: "オルタナティブロック",
    description: "ジャズ要素を含むロック。複雑な楽曲構成と高い演奏技術",
    features: ["男性ソロボーカル", "ジャズロック", "技巧的", "複雑な構成"]
  },
  {
    artist: "Dragon Ash",
    song: "Grateful Days",
    genre: "ロック/ラップフュージョン",
    description: "ロックとヒップホップの融合。一部ラップセクションを含む楽曲の代表例",
    features: ["男性ソロボーカル", "ラップ要素", "ロック", "混合スタイル"]
  }
]

interface ExampleDisplaySectionProps {
  onSelectExample?: (artist: string, song: string) => void
  isLoading?: boolean
}

export function ExampleDisplaySection({ onSelectExample, isLoading = false }: ExampleDisplaySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // デバッグ用ログ
  console.log('🎯 ExampleDisplaySection レンダリング中', { onSelectExample: !!onSelectExample, isLoading })

  const categories = [
    { value: 'all', label: '全て', icon: '🎵' },
    { value: 'ballad', label: 'バラード', icon: '💝' },
    { value: 'rock', label: 'ロック', icon: '🎸' },
    { value: 'pop', label: 'ポップス', icon: '✨' },
    { value: 'fusion', label: 'フュージョン', icon: '🎭' }
  ]

  const filteredSongs = exampleSongs.filter(song => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'ballad') return song.genre.includes('バラード')
    if (selectedCategory === 'rock') return song.genre.includes('ロック') || song.genre.includes('ROCK')
    if (selectedCategory === 'pop') return song.genre.includes('ポップ') || song.genre.includes('エレクトロ')
    if (selectedCategory === 'fusion') return song.genre.includes('フュージョン') || song.genre.includes('オルタナティブ') || song.features.includes('ラップ要素')
    return false
  })

  const handleSelectSong = (artist: string, song: string) => {
    if (onSelectExample && !isLoading) {
      onSelectExample(artist, song)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          🎯 楽曲例示・サンプル選択
        </h3>
        <p className="text-sm text-gray-600">
          分析したい楽曲の参考として、人気楽曲から選択できます
        </p>
      </div>

      {/* カテゴリフィルター */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                selectedCategory === category.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
              disabled={isLoading}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* 楽曲リスト */}
      <div className="space-y-3">
        {filteredSongs.map((song, index) => (
          <div
            key={`${song.artist}-${song.song}`}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-gray-900">
                    {song.artist} - 「{song.song}」
                  </h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {song.genre}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {song.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {song.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelectSong(song.artist, song.song)}
                className="ml-4 bg-blue-500 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                {isLoading ? '処理中...' : '🎯 分析開始'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSongs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-2xl mb-2">🔍</div>
          <p className="text-sm">該当する楽曲が見つかりませんでした</p>
        </div>
      )}

      {/* 使用方法ガイド */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-md p-3">
          <div className="text-sm text-blue-800">
            <strong>💡 例示表示の使い方:</strong>
            <ul className="mt-1 ml-4 list-disc space-y-1">
              <li>カテゴリで楽曲を絞り込めます</li>
              <li>「分析開始」で選択した楽曲の分析を実行</li>
              <li>楽曲特徴を参考に、似た系統の楽曲を手動入力することも可能</li>
              <li>分析結果を元に、オリジナル歌詞・スタイルを生成します</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}