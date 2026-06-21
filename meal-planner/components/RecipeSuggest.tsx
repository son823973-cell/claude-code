'use client'

import { useState } from 'react'
import { supabase, ShoppingItem } from '@/lib/supabase'

export default function RecipeSuggest({ code, items, onRefresh }: {
  code: string
  items: ShoppingItem[]
  onRefresh: () => void
}) {
  const [mode, setMode] = useState<'ingredients' | 'freetext'>('ingredients')
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [customIngredient, setCustomIngredient] = useState('')
  const [freeText, setFreeText] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(false)

  const shoppingIngredients = items.map((i) => i.name)
  const allIngredients = [...new Set([...shoppingIngredients])]

  function toggleIngredient(name: string) {
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    )
  }

  function addCustomIngredient() {
    if (!customIngredient.trim()) return
    if (!selectedIngredients.includes(customIngredient.trim())) {
      setSelectedIngredients((prev) => [...prev, customIngredient.trim()])
    }
    setCustomIngredient('')
  }

  async function getSuggestion() {
    setLoading(true)
    setSuggestion('')
    const res = await fetch('/api/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        mode === 'freetext'
          ? { freeText }
          : { ingredients: selectedIngredients }
      ),
    })
    const data = await res.json()
    setSuggestion(data.suggestion)
    setLoading(false)
  }

  async function addToShopping(ingredient: string) {
    await supabase.from('shopping_items').insert({
      household_code: code,
      name: ingredient,
      quantity: null,
      checked: false,
    })
    onRefresh()
  }

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-base font-semibold text-gray-700 mb-3">✨ AIレシピ提案</h2>

        {/* Mode toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          <button
            onClick={() => setMode('ingredients')}
            className={`flex-1 text-sm py-1.5 rounded-lg transition ${
              mode === 'ingredients' ? 'bg-white shadow text-orange-600 font-semibold' : 'text-gray-500'
            }`}
          >
            食材から探す
          </button>
          <button
            onClick={() => setMode('freetext')}
            className={`flex-1 text-sm py-1.5 rounded-lg transition ${
              mode === 'freetext' ? 'bg-white shadow text-orange-600 font-semibold' : 'text-gray-500'
            }`}
          >
            自由に質問
          </button>
        </div>

        {mode === 'ingredients' && (
          <div className="space-y-3">
            {allIngredients.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">買い物リストから選択</p>
                <div className="flex flex-wrap gap-2">
                  {allIngredients.map((name) => (
                    <button
                      key={name}
                      onClick={() => toggleIngredient(name)}
                      className={`text-sm px-3 py-1 rounded-full border transition ${
                        selectedIngredients.includes(name)
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={customIngredient}
                onChange={(e) => setCustomIngredient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomIngredient()}
                placeholder="食材を追加（例：豚肉）"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button
                onClick={addCustomIngredient}
                className="bg-orange-100 text-orange-600 px-3 py-2 rounded-xl text-sm font-semibold"
              >
                +
              </button>
            </div>

            {selectedIngredients.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">選択中の食材</p>
                <div className="flex flex-wrap gap-1">
                  {selectedIngredients.map((name) => (
                    <span
                      key={name}
                      className="text-sm bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1"
                    >
                      {name}
                      <button onClick={() => toggleIngredient(name)} className="text-orange-400 hover:text-orange-600">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={getSuggestion}
              disabled={loading || selectedIngredients.length === 0}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl disabled:opacity-50 transition"
            >
              {loading ? '考え中...' : 'レシピを提案してもらう'}
            </button>
          </div>
        )}

        {mode === 'freetext' && (
          <div className="space-y-3">
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="例：豚肉と玉ねぎで作れる簡単な料理を教えて&#10;例：子供が喜ぶ野菜料理を3つ提案して"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
            <button
              onClick={getSuggestion}
              disabled={loading || !freeText.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl disabled:opacity-50 transition"
            >
              {loading ? '考え中...' : '提案してもらう'}
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-8 text-orange-400">
          <p className="text-3xl animate-bounce mb-2">🍳</p>
          <p className="text-sm">AIがレシピを考えています...</p>
        </div>
      )}

      {suggestion && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">💡 提案レシピ</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{suggestion}</p>
        </div>
      )}
    </div>
  )
}
