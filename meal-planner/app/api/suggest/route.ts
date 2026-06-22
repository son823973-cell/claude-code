import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { ingredients, freeText } = await req.json()

  const prompt = freeText
    ? freeText
    : `以下の食材を使って作れる夕食レシピを3つ提案してください：${ingredients.join('、')}。\n各レシピは「料理名」「材料」「簡単な作り方（3ステップ程度）」を含めてください。`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    system:
      '日本の家庭料理に詳しい料理アドバイザーです。簡単で美味しいレシピをわかりやすく提案します。マークダウンを使わず、シンプルなテキストで回答してください。',
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ suggestion: text })
}
