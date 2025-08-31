import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { RegenerateStyleApiResponse } from '../../../types/analysis'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// 🎯 Phase 1-4: /api/regenerate-style新規作成
// 英語スタイル指示の再生成専用API

interface RegenerateStyleRequest {
  // 再生成の基となる情報
  currentStyleInstruction: string
  
  // 再生成理由・要求
  regenerationReason: 'japanese_detected' | 'quality_improvement' | 'user_request' | 'optimization'
  issueDetails?: string[]  // 具体的な問題点
  
  // 楽曲要素（再生成で使用）
  decomposedElements?: {
    instruments: string
    tempo: string
    rhythm: string
    mood: string
    genre: string
    forbidden: string
    vocal: {
      attribute: string
      sunoElements: string[]
    }
  }
  
  // 再生成設定
  enhancementLevel: 'minor' | 'major' | 'complete'  // 改善レベル
  preserveOriginalStructure?: boolean  // 元構造の保持
}

export async function POST(request: NextRequest) {
  try {
    const {
      currentStyleInstruction,
      regenerationReason,
      issueDetails = [],
      decomposedElements,
      enhancementLevel = 'minor',
      preserveOriginalStructure = true
    }: RegenerateStyleRequest = await request.json()

    if (!currentStyleInstruction) {
      return NextResponse.json(
        { error: 'スタイル指示が必要です' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' },
        { status: 500 }
      )
    }

    console.log('🔄 英語スタイル再生成開始:', {
      reason: regenerationReason,
      enhancementLevel,
      preserveOriginalStructure,
      issuesCount: issueDetails.length
    })

    // 再生成理由に基づくプロンプト調整
    const getRegenerationPrompt = () => {
      const basePrompt = `You are a Suno AI optimization specialist. Regenerate the English style instruction to fix identified issues while maintaining effectiveness.`
      
      switch (regenerationReason) {
        case 'japanese_detected':
          return `${basePrompt}
          
**CRITICAL ISSUE**: Japanese characters detected in English style instruction.
**PRIMARY GOAL**: Complete removal of all Japanese characters while preserving musical intent.

**Current problematic instruction:**
"${currentStyleInstruction}"

**Specific issues found:**
${issueDetails.map(issue => `- ${issue}`).join('\n')}

**Requirements:**
1. Replace ALL Japanese characters with appropriate English equivalents
2. Maintain the exact same musical structure and intent
3. Keep technical specifications (tempo, instruments, mood)
4. Use standard Suno AI formatting
5. Ensure 100% English-only output

**Output format:** Pure English Suno AI instruction only, no explanations.`

        case 'quality_improvement':
          return `${basePrompt}
          
**GOAL**: Improve the quality and effectiveness of Suno AI instruction.

**Current instruction to improve:**
"${currentStyleInstruction}"

**Enhancement level:** ${enhancementLevel}
**Preserve structure:** ${preserveOriginalStructure ? 'Yes' : 'No'}

**Quality issues to address:**
${issueDetails.length > 0 ? issueDetails.map(issue => `- ${issue}`).join('\n') : '- General optimization and clarity improvement'}

${decomposedElements ? `
**Available musical elements for reference:**
- Instruments: ${decomposedElements.instruments}
- Tempo: ${decomposedElements.tempo}  
- Rhythm: ${decomposedElements.rhythm}
- Mood: ${decomposedElements.mood}
- Genre: ${decomposedElements.genre}
- Vocals: ${decomposedElements.vocal.attribute} (${decomposedElements.vocal.sunoElements.join(', ')})
- Forbidden: ${decomposedElements.forbidden}` : ''}

**Requirements:**
1. ${enhancementLevel === 'minor' ? 'Minor improvements only - fix obvious issues' :
     enhancementLevel === 'major' ? 'Significant improvements - restructure for clarity' :
     'Complete rewrite - optimize for maximum Suno AI effectiveness'}
2. Maintain musical intent and core elements
3. Use proven Suno AI formatting patterns
4. Technical and specific language only

**Output format:** Improved English Suno AI instruction only.`

        case 'user_request':
          return `${basePrompt}
          
**GOAL**: Regenerate based on specific user feedback and requirements.

**Current instruction:**
"${currentStyleInstruction}"

**User feedback/requirements:**
${issueDetails.length > 0 ? issueDetails.map(issue => `- ${issue}`).join('\n') : '- General regeneration requested'}

**Requirements:**
1. Address all user-specified concerns
2. Maintain Suno AI compatibility
3. Preserve essential musical elements unless specifically requested to change
4. Use clear, technical language

**Output format:** Modified English Suno AI instruction based on user requirements.`

        default: // optimization
          return `${basePrompt}
          
**GOAL**: General optimization of Suno AI instruction for better performance.

**Current instruction:**
"${currentStyleInstruction}"

**Optimization targets:**
- Clarity and specificity
- Suno AI best practices compliance
- Remove redundancy and improve structure
- Enhance technical precision

${decomposedElements ? `
**Musical elements for reference:**
- Instruments: ${decomposedElements.instruments}
- Style: ${decomposedElements.genre}
- Mood: ${decomposedElements.mood}` : ''}

**Requirements:**
1. Optimize for Suno AI effectiveness
2. Maintain all essential musical information
3. Use proven formatting patterns
4. Technical and concise language

**Output format:** Optimized English Suno AI instruction only.`
      }
    }

    // OpenAI API呼び出し
    const regenerationCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert Suno AI optimization specialist. You generate precise, technical English style instructions that follow proven best practices. Always output pure English instructions without explanations or additional text."
        },
        {
          role: "user", 
          content: getRegenerationPrompt()
        }
      ],
      temperature: 0.3, // 低めの温度で一貫性を重視
      max_tokens: 400
    })

    const regeneratedStyle = regenerationCompletion.choices[0]?.message?.content || ''
    
    // 品質チェック実行
    const qualityCheck = performStyleQualityCheck(regeneratedStyle)
    
    // 再生成理由の説明文生成
    const getRegenerationReasonText = () => {
      switch (regenerationReason) {
        case 'japanese_detected':
          return `日本語文字を検出したため、完全な英語スタイル指示に再生成しました。${issueDetails.length > 0 ? `検出された問題: ${issueDetails.join(', ')}` : ''}`
        case 'quality_improvement':
          return `スタイル指示の品質向上のため再生成しました。改善レベル: ${enhancementLevel === 'minor' ? '軽微な修正' : enhancementLevel === 'major' ? '大幅な改善' : '完全な再構築'}`
        case 'user_request':
          return `ユーザーの要求に基づいて再生成しました。${issueDetails.length > 0 ? `対応した要求: ${issueDetails.join(', ')}` : ''}`
        default:
          return 'Suno AI最適化のため自動再生成しました。'
      }
    }

    const response: RegenerateStyleApiResponse = {
      newStyleInstruction: regeneratedStyle.replace(/^["']|["']$/g, '').trim(),
      regenerationReason: getRegenerationReasonText(),
      qualityCheck
    }

    console.log('✅ 英語スタイル再生成完了:', {
      originalLength: currentStyleInstruction.length,
      newLength: response.newStyleInstruction.length,
      quality: response.qualityCheck?.confidence,
      issues: response.qualityCheck?.issues?.length || 0
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('英語スタイル再生成エラー:', error)
    return NextResponse.json(
      { error: 'スタイル再生成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 🔍 スタイル品質チェック関数
function performStyleQualityCheck(styleText: string) {
  const issues: string[] = []
  
  // 日本語文字検出
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/
  const hasJapanese = japaneseRegex.test(styleText)
  
  if (hasJapanese) {
    const japaneseMatches = styleText.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g)
    issues.push(`日本語検出: ${japaneseMatches?.join(', ')}`)
  }
  
  // 必須要素チェック
  const requiredElements = ['Purpose', 'Mood', 'Tempo', 'Instruments']
  const missingElements = requiredElements.filter(element => 
    !styleText.toLowerCase().includes(element.toLowerCase())
  )
  
  if (missingElements.length > 0) {
    issues.push(`必須要素不足: ${missingElements.join(', ')}`)
  }
  
  // 長さチェック
  if (styleText.length < 50) {
    issues.push('スタイル指示が短すぎます')
  } else if (styleText.length > 500) {
    issues.push('スタイル指示が長すぎます')
  }
  
  // 禁止表現チェック  
  const forbiddenPhrases = ['musical journey', 'soundscape', 'evoke', 'infuse']
  const foundForbidden = forbiddenPhrases.filter(phrase => 
    styleText.toLowerCase().includes(phrase.toLowerCase())
  )
  
  if (foundForbidden.length > 0) {
    issues.push(`禁止表現検出: ${foundForbidden.join(', ')}`)
  }

  return {
    hasJapanese,
    confidence: issues.length === 0 ? 'high' as const : 
                issues.length <= 2 ? 'medium' as const : 'low' as const,
    issues
  }
}