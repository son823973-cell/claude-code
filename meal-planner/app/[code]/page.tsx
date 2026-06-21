'use client'

import { useState, useEffect, use } from 'react'
import { supabase, Meal, ShoppingItem } from '@/lib/supabase'
import MealPlan from '@/components/MealPlan'
import ShoppingList from '@/components/ShoppingList'
import RecipeSuggest from '@/components/RecipeSuggest'

type Tab = 'meals' | 'shopping' | 'suggest'

export default function MainPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const [tab, setTab] = useState<Tab>('meals')
  const [meals, setMeals] = useState<Meal[]>([])
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchMeals()
    fetchItems()

    const mealSub = supabase
      .channel('meals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meals', filter: `household_code=eq.${code}` }, fetchMeals)
      .subscribe()

    const itemSub = supabase
      .channel('shopping_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items', filter: `household_code=eq.${code}` }, fetchItems)
      .subscribe()

    return () => {
      supabase.removeChannel(mealSub)
      supabase.removeChannel(itemSub)
    }
  }, [code])

  async function fetchMeals() {
    const { data } = await supabase
      .from('meals')
      .select('*')
      .eq('household_code', code)
      .order('date', { ascending: true })
    if (data) setMeals(data)
  }

  async function fetchItems() {
    const { data } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('household_code', code)
      .order('created_at', { ascending: true })
    if (data) setItems(data)
  }

  function copyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'meals', label: '献立', icon: '🍱' },
    { key: 'shopping', label: '買い物', icon: '🛒' },
    { key: 'suggest', label: 'AI提案', icon: '✨' },
  ]

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-orange-800">🍽️ こんだてノート</h1>
        <button
          onClick={copyCode}
          className="flex items-center gap-1 bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-mono px-3 py-1.5 rounded-lg transition"
        >
          <span>{code}</span>
          <span className="text-xs">{copied ? '✓' : '📋'}</span>
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {tab === 'meals' && <MealPlan code={code} meals={meals} onRefresh={fetchMeals} />}
        {tab === 'shopping' && <ShoppingList code={code} items={items} onRefresh={fetchItems} />}
        {tab === 'suggest' && <RecipeSuggest code={code} items={items} onRefresh={fetchItems} />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs transition ${
              tab === t.key ? 'text-orange-600 font-semibold' : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            <span>{t.label}</span>
            {tab === t.key && <span className="absolute bottom-0 w-8 h-0.5 bg-orange-500 rounded-t-full" />}
          </button>
        ))}
      </nav>
    </div>
  )
}
