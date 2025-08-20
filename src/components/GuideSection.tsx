'use client'

import { useState } from 'react'

export function GuideSection() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          📖 はじめて利用する方へ - 使い方ガイド
        </h2>
        <button className="text-blue-600 hover:text-blue-800">
          {isExpanded ? '▲ 閉じる' : '▼ 開く'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* 2つのモードの説明 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 簡単モード */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                😊 簡単モード
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p><strong>🎯 こんな方におすすめ：</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>音楽の専門知識がない</li>
                  <li>好きな楽曲の雰囲気を参考にしたい</li>
                  <li>手軽に始めたい</li>
                </ul>
                
                <p><strong>📝 使い方：</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>「参考楽曲」でアーティストと楽曲名を指定</li>
                  <li>「楽曲を分析して自動入力」ボタンをクリック</li>
                  <li>AIが分析した雰囲気・音楽スタイルが自動入力される</li>
                  <li>必要に応じて内容を追加・修正</li>
                  <li>テーマと歌詞の内容を入力して生成</li>
                </ol>

                <div className="bg-blue-100 p-3 rounded-md mt-3">
                  <p className="text-xs text-blue-800">
                    <strong>💡 ポイント:</strong> 
                    「参考楽曲」は必須ではありません。手動で雰囲気・音楽スタイルを入力することも可能です。
                  </p>
                </div>
              </div>
            </div>

            {/* こだわりモード */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                🎨 こだわりモード
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p><strong>🎯 こんな方におすすめ：</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>音楽に詳しい</li>
                  <li>オリジナリティを重視したい</li>
                  <li>細かく設定したい</li>
                </ul>
                
                <p><strong>📝 使い方：</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>「参考楽曲」は使用しない</li>
                  <li>「雰囲気・感情」を自分で詳しく記述</li>
                  <li>「音楽スタイル」を自分で詳しく記述</li>
                  <li>ボーカル設定を細かく調整</li>
                  <li>テーマと歌詞の内容を入力して生成</li>
                </ol>

                <div className="bg-green-100 p-3 rounded-md mt-3">
                  <p className="text-xs text-green-800">
                    <strong>💡 ポイント:</strong> 
                    「参考楽曲」セクションは表示されますが、こだわりモードでは設定する必要がありません。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 生成のコツ */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">
              ✨ より良い楽曲を生成するためのコツ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">雰囲気・感情の書き方</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>具体的な感情を複数組み合わせる</li>
                  <li>例: 「切ないけれど温かい」「希望に満ちているが不安もある」</li>
                  <li>色彩や季節のイメージも効果的</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">音楽スタイルの書き方</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>ジャンル名を明確に（J-POP、フォーク、ロック等）</li>
                  <li>楽器編成を指定（アコギ、ピアノ、ストリングス等）</li>
                  <li>テンポ感も記述（スローバラード、ミドルテンポ等）</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ボーカル設定のガイド */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">
              🎤 ボーカル設定ガイド
            </h3>
            <div className="text-sm text-gray-700">
              <p className="mb-3">
                <strong>歌唱技法の選び方（複数選択可）：</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>
                  <p><strong>スムースな歌声:</strong> 聞きやすく安定感がある（ポップス向け）</p>
                  <p><strong>パワフルな歌声:</strong> 力強い表現力（ロック・R&B向け）</p>
                  <p><strong>ブレッシーな歌声:</strong> 優しく親しみやすい（バラード向け）</p>
                  <p><strong>ビブラート:</strong> 情感豊かな表現（演歌・クラシック向け）</p>
                </div>
                <div>
                  <p><strong>ファルセット:</strong> 透明感のある裏声（感動的な部分で効果的）</p>
                  <p><strong>ウィスルトーン:</strong> 超高音域（印象的なアクセント）</p>
                  <p><strong>グロウル:</strong> 男性の低音部分で迫力を演出</p>
                  <p><strong>メリスマ:</strong> 1つの音節を複数の音で歌う（R&B・ゴスペル風）</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
