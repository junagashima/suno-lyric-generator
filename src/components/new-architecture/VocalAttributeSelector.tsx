import React from 'react'
import { VocalAttribute } from '@/types/analysis'

interface VocalAttributeSelectorProps {
  selectedAttribute?: VocalAttribute
  onSelect: (attribute: VocalAttribute) => void
  isLoading: boolean
}

export function VocalAttributeSelector({ selectedAttribute, onSelect, isLoading }: VocalAttributeSelectorProps) {
  const vocalAttributeOptions: VocalAttribute[] = [
    '女性（ソロ）', '男性（ソロ）', '中性的（ソロ）',
    '男女デュエット', '女性デュエット', '男性デュエット',
    '女性グループ（3人以上）', '男性グループ（3人以上）', '男女混合グループ',
    'コーラス重視（複数ボーカル）'
  ]

  return (
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
              checked={selectedAttribute === option}
              onChange={(e) => onSelect(e.target.value as VocalAttribute)}
              className="mr-2"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  )
}