'use client'

import { useState } from 'react'

interface Props {
  onGenerate: (data: any) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function SongGeneratorForm({ onGenerate, isLoading, setIsLoading }: Props) {
  const [mode, setMode] = useState<'simple' | 'custom'>('simple')
  const [referenceArtist, setReferenceArtist] = useState('')
  const [referenceSong, setReferenceSong] = useState('')
  const [mood, setMood] = useState('')
  const [musicStyle, setMusicStyle] = useState('')
  const [theme, setTheme] = useState('')
  const [content, setContent] = useState('')
  const [songLength, setSongLength] = useState('3-4分')
  
  // Step B: 内容反映度の状態管理
  const [contentReflection, setContentReflection] = useState('literal')
  
  // Step H: 楽曲分析結果の構造情報
  const [analyzedStructure, setAnalyzedStructure] = useState<any>(null)
  
  // 新4要素分析結果（安全な追加実装）
  const [analyzedDetails, setAnalyzedDetails] = useState<{
    tempo?: string
    rhythm?: string  
    instruments?: string
    forbidden?: string
  } | null>(null)
  
  // ラップモード選択の状態管理（拡張版）
  const [rapMode, setRapMode] = useState<'none' | 'partial' | 'full'>('none')
  
  // ボーカル設定
  const [vocalGender, setVocalGender] = useState('女性')
  const [vocalAge, setVocalAge] = useState('20代')
  const [vocalNationality, setVocalNationality] = useState('日本')
  const [vocalTechniques, setVocalTechniques] = useState<string[]>([])

  const vocalTechniqueOptions = [
    { value: 'smooth', label: 'スムースな歌声（滑らかで聞きやすい）' },
    { value: 'powerful', label: 'パワフルな歌声（力強く迫力がある）' },
    { value: 'breathy', label: 'ブレッシーな歌声（息っぽく柔らかい）' },
    { value: 'vibrato', label: 'ビブラート（声を震わせる技法）' },
    { value: 'falsetto', label: 'ファルセット（裏声）' },
    { value: 'whistle', label: 'ウィスルトーン（口笛のような高音）' },
    { value: 'growl', label: 'グロウル（低く唸るような声）' },
    { value: 'melisma', label: 'メリスマ（一つの音節を複数の音で歌う）' }
  ]

  const handleVocalTechniqueChange = (technique: string) => {
    setVocalTechniques(prev => 
      prev.includes(technique)
        ? prev.filter(t => t !== technique)
        : [...prev, technique]
    )
  }

  const handleAnalyzeReference = async () => {
    if (!referenceArtist || !referenceSong) {
      alert('アーティスト名と楽曲名を入力してください')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artist: referenceArtist,
          song: referenceSong,
        }),
      })

      if (!response.ok) {
        throw new Error('楽曲分析に失敗しました')
      }

      const data = await response.json()
      setMood(data.mood || '')
      setMusicStyle(data.style || '')
      // Step H: 楽曲構造情報を保存
      setAnalyzedStructure(data.structure || null)
      
      // 新4要素の安全な保存（フォールバック付き）
      console.log('🔍 診断: APIレスポンス全体:', data)
      console.log('🔍 診断: 新4要素抽出:', {
        tempo: data.tempo,
        rhythm: data.rhythm, 
        instruments: data.instruments,
        forbidden: data.forbidden
      })
      
      const newDetails = {
        tempo: data.tempo || null,
        rhythm: data.rhythm || null,
        instruments: data.instruments || null,
        forbidden: data.forbidden || null
      }
      
      console.log('🔍 診断: state保存値:', newDetails)
      setAnalyzedDetails(newDetails)
    } catch (error) {
      console.error('Error analyzing reference song:', error)
      alert('楽曲分析中にエラーが発生しました。手動で設定してください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!theme || !content) {
      alert('テーマと歌詞の内容は必須です')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          mood,
          musicStyle,
          theme,
          content,
          contentReflection, // Step C: 安全に追加
          songLength,
          vocal: {
            gender: vocalGender,
            age: vocalAge,
            nationality: vocalNationality,
            techniques: vocalTechniques
          },
          // ラップモード選択（拡張版）
          rapMode,
          // Step H: 楽曲構造情報を歌詞生成に渡す
          analyzedStructure
        }),
      })

      if (!response.ok) {
        throw new Error('歌詞生成に失敗しました')
      }

      const data = await response.json()
      onGenerate(data)
    } catch (error) {
      console.error('Error generating lyrics:', error)
      alert('歌詞生成中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">歌詞・スタイル生成</h2>

      {/* モード選択 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">生成モード</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="simple"
              checked={mode === 'simple'}
              onChange={(e) => setMode(e.target.value as 'simple' | 'custom')}
              className="mr-2"
            />
            簡単モード
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="custom"
              checked={mode === 'custom'}
              onChange={(e) => setMode(e.target.value as 'simple' | 'custom')}
              className="mr-2"
            />
            こだわりモード
          </label>
        </div>
      </div>

      {/* 参考楽曲（簡単モードのみ） */}
      {mode === 'simple' && (
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            📚 参考楽曲（簡単モード専用）
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            こだわりモードの方は、この設定は不要です。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                アーティスト名
              </label>
              <input
                type="text"
                value={referenceArtist}
                onChange={(e) => setReferenceArtist(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: あいみょん"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                楽曲名
              </label>
              <input
                type="text"
                value={referenceSong}
                onChange={(e) => setReferenceSong(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: マリーゴールド"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAnalyzeReference}
            disabled={isLoading || !referenceArtist || !referenceSong}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            楽曲を分析して自動入力
          </button>
        </div>
      )}

      {/* 雰囲気・感情 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          雰囲気・感情
        </label>
        <textarea
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: 切なく温かい、希望に満ちた、メランコリックだが美しい"
        />
        {mode === 'simple' && (
          <p className="text-xs text-gray-500 mt-1">
            ※ 簡単モードでは楽曲分析により自動入力されますが、追加・変更可能です
          </p>
        )}
      </div>

      {/* 音楽スタイル */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          音楽スタイル
        </label>
        <textarea
          value={musicStyle}
          onChange={(e) => setMusicStyle(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: J-POPバラード, 85BPM, アコースティックギター, ピアノ, ストリングス, オーガニックなプロダクション"
        />
        {mode === 'simple' && (
          <p className="text-xs text-gray-500 mt-1">
            ※ 簡単モードでは楽曲分析により詳細に自動入力されますが、追加・変更可能です
          </p>
        )}
        {mode === 'custom' && (
          <p className="text-xs text-gray-500 mt-1">
            ※ ジャンル、テンポ、楽器編成、プロダクション手法などを詳しく記述してください
          </p>
        )}
      </div>

      {/* 新4要素表示（安全な追加実装） */}
      {mode === 'simple' && analyzedDetails && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            🔍 詳細分析結果 (Suno AI最適化)
          </h3>
          
          {/* 診断表示（一時的） */}
          <div className="bg-yellow-100 p-2 mb-2 rounded text-xs">
            <strong>診断:</strong> analyzedDetails = {JSON.stringify(analyzedDetails)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {analyzedDetails.tempo && (
              <div className="bg-white p-2 rounded border">
                <strong className="text-blue-700">テンポ:</strong>
                <div className="text-gray-700 mt-1">{analyzedDetails.tempo}</div>
              </div>
            )}
            {analyzedDetails.rhythm && (
              <div className="bg-white p-2 rounded border">
                <strong className="text-blue-700">リズム:</strong>
                <div className="text-gray-700 mt-1">{analyzedDetails.rhythm}</div>
              </div>
            )}
            {analyzedDetails.instruments && (
              <div className="bg-white p-2 rounded border">
                <strong className="text-blue-700">楽器構成:</strong>
                <div className="text-gray-700 mt-1">{analyzedDetails.instruments}</div>
              </div>
            )}
            {analyzedDetails.forbidden && (
              <div className="bg-white p-2 rounded border">
                <strong className="text-blue-700">禁止要素:</strong>
                <div className="text-gray-700 mt-1">{analyzedDetails.forbidden}</div>
              </div>
            )}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            💡 この詳細情報はSuno AIでより正確な楽曲生成に活用されます
          </p>
        </div>
      )}

      {/* ボーカル設定 */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🎤 ボーカル設定</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ボーカル構成</label>
            <select
              value={vocalGender}
              onChange={(e) => setVocalGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="女性">女性（ソロ）</option>
              <option value="男性">男性（ソロ）</option>
              <option value="中性的">中性的（ソロ）</option>
              <option value="男女デュエット">男女デュエット</option>
              <option value="女性デュエット">女性デュエット</option>
              <option value="男性デュエット">男性デュエット</option>
              <option value="女性グループ">女性グループ（3人以上）</option>
              <option value="男性グループ">男性グループ（3人以上）</option>
              <option value="男女混合グループ">男女混合グループ</option>
              <option value="コーラス重視">コーラス重視（複数ボーカル）</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
            <select
              value={vocalAge}
              onChange={(e) => setVocalAge(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="10代">10代</option>
              <option value="20代">20代</option>
              <option value="30代">30代</option>
              <option value="40代">40代</option>
              <option value="50代以上">50代以上</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">国籍</label>
            <select
              value={vocalNationality}
              onChange={(e) => setVocalNationality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="日本">日本</option>
              <option value="アメリカ">アメリカ</option>
              <option value="イギリス">イギリス</option>
              <option value="韓国">韓国</option>
              <option value="その他">その他</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">楽曲の長さ</label>
            <select
              value={songLength}
              onChange={(e) => setSongLength(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="2-3分">2-3分</option>
              <option value="3-4分">3-4分</option>
              <option value="4-5分">4-5分</option>
              <option value="5分以上">5分以上</option>
            </select>
          </div>
        </div>

        {/* 歌唱技法（複数選択） */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            歌唱技法（複数選択可）
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {vocalTechniqueOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={vocalTechniques.includes(option.value)}
                  onChange={() => handleVocalTechniqueChange(option.value)}
                  className="rounded border-gray-300 focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ラップ調選択（安全追加） */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🎤 ラップ調オプション</h3>
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-700 mb-3">
            <strong>ラップ要素の設定</strong>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="rapMode"
                value="none"
                checked={rapMode === 'none'}
                onChange={(e) => setRapMode('none')}
                className="w-4 h-4 text-purple-600 border-2 border-gray-300 focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                <strong>ラップなし</strong> - 通常のメロディー楽曲
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="rapMode"
                value="partial"
                checked={rapMode === 'partial'}
                onChange={(e) => setRapMode('partial')}
                className="w-4 h-4 text-purple-600 border-2 border-gray-300 focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                <strong>一部ラップ</strong> - [Rap Verse]セクションを含む（Dragon Ash風）
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="rapMode"
                value="full"
                checked={rapMode === 'full'}
                onChange={(e) => setRapMode('full')}
                className="w-4 h-4 text-purple-600 border-2 border-gray-300 focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                <strong>全面ラップ</strong> - 完全なヒップホップ・ラップ楽曲
              </span>
            </label>
          </div>

          {rapMode === 'partial' && (
            <div className="bg-purple-100 p-3 rounded border-l-4 border-purple-400">
              <p className="text-sm text-purple-800">
                ✅ <strong>一部ラップモード</strong><br/>
                • メロディーセクション + [Rap Verse]セクションの組み合わせ<br/>
                • 日本語ラップ技法（母音韻、脚韻、パンチライン）を使用<br/>
                • Dragon Ash、RIP SLYME等のスタイルに最適
              </p>
            </div>
          )}

          {rapMode === 'full' && (
            <div className="bg-orange-100 p-3 rounded border-l-4 border-orange-400">
              <p className="text-sm text-orange-800">
                🔥 <strong>全面ラップモード</strong><br/>
                • 楽曲全体がラップで構成（歌メロディーなし）<br/>
                • SUNO「rap-only」最適化指示を適用<br/>
                • フリースタイル・ヒップホップ楽曲として生成
              </p>
            </div>
          )}
        </div>
      </div>

      {/* テーマ・使用場面 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          テーマ・使用場面 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: 卒業式、恋愛の始まり、友情、家族の絆"
          required
        />
      </div>

      {/* 歌詞に盛り込みたい内容 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          歌詞に盛り込みたい内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="歌詞に表現したい感情、情景、メッセージなどを自由に記述してください。長文でも構いません。"
          required
        />
      </div>

      {/* 内容反映度調整（Step A: 表示のみ） */}
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📝 内容反映度設定</h3>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            上記内容の歌詞への反映方法
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="contentReflection"
                value="literal"
                checked={contentReflection === 'literal'}
                onChange={(e) => setContentReflection(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">
                <strong>忠実反映</strong>：専門用語・固有名詞をそのまま歌詞に使用
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="contentReflection"
                value="metaphorical"
                checked={contentReflection === 'metaphorical'}
                onChange={(e) => setContentReflection(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">
                <strong>比喩的表現</strong>：内容を詩的・象徴的に表現
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="contentReflection"
                value="balanced"
                checked={contentReflection === 'balanced'}
                onChange={(e) => setContentReflection(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">
                <strong>バランス型</strong>：重要部分は忠実、他は比喩的に
              </span>
            </label>
          </div>
          <p className="text-xs text-green-600 bg-green-100 p-2 rounded">
            ✅ 内容反映度機能が実装されました。選択した方法で歌詞生成に反映されます。
          </p>
        </div>
      </div>

      {/* 生成ボタン */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '生成中...' : '🎵 歌詞・スタイルを生成する'}
      </button>
    </form>
  )
}