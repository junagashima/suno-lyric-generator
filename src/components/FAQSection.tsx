'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

export function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      question: "簡単モードとこだわりモードの違いは何ですか？",
      answer: "簡単モードでは既存楽曲を参考にAIが雰囲気と音楽スタイルを自動分析・入力します。音楽の専門知識がなくても手軽に利用できます。こだわりモードでは全て手動で設定するため、より細かい調整やオリジナリティを追求したい方に適しています。"
    },
    {
      question: "参考楽曲の分析がうまくいかない場合はどうすればよいですか？",
      answer: "楽曲分析は完璧ではありません。分析結果が期待と異なる場合は、手動で雰囲気・音楽スタイル欄を修正してください。分析結果はあくまで参考として、最終的にはご自身で調整することをお勧めします。"
    },
    {
      question: "生成された歌詞の長さはどの程度ですか？",
      answer: "楽曲の長さ設定に基づいて調整されますが、一般的には標準的なJ-POP楽曲（3-4分）の構成（イントロ、Aメロ、Bメロ、サビを繰り返し、アウトロ）に沿った歌詞が生成されます。生成後に必要に応じて調整してください。"
    },
    {
      question: "Sunoタグとは何ですか？",
      answer: "Sunoタグは角括弧[]で囲まれたAI指示です。[Verse]（Aメロ）、[Chorus]（サビ）、[Bridge]（Cメロ）などの楽曲構成や、[Outro]（アウトロ）、[Fade out]（フェードアウト）などの演出効果を指定できます。これらにより、より精密な楽曲制作が可能になります。"
    },
    {
      question: "英語のスタイル指示はなぜ必要ですか？",
      answer: "Suno AIは英語での指示により高い精度で動作するため、日本語の設定内容を効果的な英語表現に変換しています。これにより、ジャンル、楽器編成、ボーカル特性などがより正確にAIに伝わります。"
    },
    {
      question: "生成結果が気に入らない場合はどうすればよいですか？",
      answer: "以下の方法をお試しください：1) フォーム内容をより具体的に記述する、2) 歌唱技法の選択を変更する、3) 雰囲気・感情の表現を調整する、4) 楽曲の長さ設定を変える。また、Suno AI側でも複数回生成を試すことで、より好みに近い結果が得られる場合があります。"
    },
    {
      question: "商用利用は可能ですか？",
      answer: "このツール自体は歌詞と指示文の生成を支援するものです。商用利用については、Suno AIの利用規約を必ずご確認ください。また、生成された楽曲の著作権や使用権についても、Suno AIのポリシーに従ってください。"
    },
    {
      question: "OpenAI APIキーは必要ですか？",
      answer: "このアプリケーションは内部でOpenAI APIを使用していますが、ユーザー側でAPIキーを用意する必要はありません。サーバー側で処理を行っているため、そのまま利用できます。"
    }
  ]

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        ❓ よくある質問（FAQ）
      </h2>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleExpand(index)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <h3 className="text-sm font-medium text-gray-800 pr-4">
                Q{index + 1}. {faq.question}
              </h3>
              <span className="text-gray-500 flex-shrink-0">
                {expandedIndex === index ? '▲' : '▼'}
              </span>
            </button>
            
            {expandedIndex === index && (
              <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-700 leading-relaxed pt-3">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 追加のヒント */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 さらなるヒント</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Suno AIで楽曲生成後、気に入らない場合は設定を微調整して再生成してみてください</li>
          <li>• 歌詞の一部分だけを変更したい場合は、Sunoの編集機能を活用してください</li>
          <li>• 複数のバリエーションを生成して、最も気に入ったものを選ぶ方法も効果的です</li>
          <li>• このツールの結果は出発点として、最終的にはあなたの創造性で仕上げてください</li>
        </ul>
      </div>
    </div>
  )
}
