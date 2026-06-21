'use client'

import { useState } from 'react'
import { supabase, Meal } from '@/lib/supabase'
import { format, addDays, startOfToday } from 'date-fns'
import { ja } from 'date-fns/locale'

const DAYS = 7

export default function MealPlan({ code, meals, onRefresh }: {
  code: string
  meals: Meal[]
  onRefresh: () => void
}) {
  const [addingDate, setAddingDate] = useState<string | null>(null)
  const [newMeal, setNewMeal] = useState('')
  const [newMemo, setNewMemo] = useState('')
  const [saving, setSaving] = useState(false)

  const today = startOfToday()
  const days = Array.from({ length: DAYS }, (_, i) => addDays(today, i))

  function mealsForDate(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd')
    return meals.filter((m) => m.date === dateStr)
  }

  async function addMeal(date: Date) {
    if (!newMeal.trim()) return
    setSaving(true)
    await supabase.from('meals').insert({
      household_code: code,
      date: format(date, 'yyyy-MM-dd'),
      name: newMeal.trim(),
      memo: newMemo.trim() || null,
    })
    setNewMeal('')
    setNewMemo('')
    setAddingDate(null)
    setSaving(false)
    onRefresh()
  }

  async function deleteMeal(id: string) {
    await supabase.from('meals').delete().eq('id', id)
    onRefresh()
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-base font-semibold text-gray-700">今週の献立</h2>
      {days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const dayMeals = mealsForDate(day)
        const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        const isAdding = addingDate === dateStr

        return (
          <div key={dateStr} className={`bg-white rounded-2xl shadow-sm p-4 ${isToday ? 'ring-2 ring-orange-400' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className={`text-sm font-bold ${isToday ? 'text-orange-600' : 'text-gray-700'}`}>
                  {format(day, 'M/d (E)', { locale: ja })}
                </span>
                {isToday && <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">今日</span>}
              </div>
              <button
                onClick={() => { setAddingDate(isAdding ? null : dateStr); setNewMeal(''); setNewMemo('') }}
                className="text-orange-500 hover:text-orange-700 text-xl leading-none"
              >
                {isAdding ? '✕' : '+'}
              </button>
            </div>

            {dayMeals.length === 0 && !isAdding && (
              <p className="text-xs text-gray-400">未定</p>
            )}

            {dayMeals.map((meal) => (
              <div key={meal.id} className="flex items-start justify-between py-1 group">
                <div>
                  <p className="text-sm font-medium text-gray-800">{meal.name}</p>
                  {meal.memo && <p className="text-xs text-gray-400">{meal.memo}</p>}
                </div>
                <button
                  onClick={() => deleteMeal(meal.id)}
                  className="text-gray-300 hover:text-red-400 text-sm ml-2 opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}

            {isAdding && (
              <div className="mt-2 space-y-2">
                <input
                  autoFocus
                  value={newMeal}
                  onChange={(e) => setNewMeal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMeal(day)}
                  placeholder="料理名（例：カレーライス）"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <input
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  placeholder="メモ（任意）"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <button
                  onClick={() => addMeal(day)}
                  disabled={saving || !newMeal.trim()}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-xl disabled:opacity-50 transition"
                >
                  追加
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
