'use client'

import { useState } from 'react'
import { supabase, ShoppingItem } from '@/lib/supabase'

export default function ShoppingList({ code, items, onRefresh }: {
  code: string
  items: ShoppingItem[]
  onRefresh: () => void
}) {
  const [newItem, setNewItem] = useState('')
  const [newQty, setNewQty] = useState('')
  const [saving, setSaving] = useState(false)

  const unchecked = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)

  async function addItem() {
    if (!newItem.trim()) return
    setSaving(true)
    await supabase.from('shopping_items').insert({
      household_code: code,
      name: newItem.trim(),
      quantity: newQty.trim() || null,
      checked: false,
    })
    setNewItem('')
    setNewQty('')
    setSaving(false)
    onRefresh()
  }

  async function toggleItem(item: ShoppingItem) {
    await supabase.from('shopping_items').update({ checked: !item.checked }).eq('id', item.id)
    onRefresh()
  }

  async function deleteItem(id: string) {
    await supabase.from('shopping_items').delete().eq('id', id)
    onRefresh()
  }

  async function clearChecked() {
    const ids = checked.map((i) => i.id)
    await supabase.from('shopping_items').delete().in('id', ids)
    onRefresh()
  }

  return (
    <div className="p-4 space-y-4">
      {/* Add form */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
        <h2 className="text-base font-semibold text-gray-700 mb-1">買うものリスト</h2>
        <div className="flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="商品名（例：豚肉）"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <input
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="量"
            className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <button
          onClick={addItem}
          disabled={saving || !newItem.trim()}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-xl disabled:opacity-50 transition"
        >
          追加
        </button>
      </div>

      {/* Unchecked items */}
      {unchecked.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">未購入 ({unchecked.length})</h3>
          <ul className="space-y-2">
            {unchecked.map((item) => (
              <li key={item.id} className="flex items-center justify-between group">
                <button
                  onClick={() => toggleItem(item)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <span className="w-5 h-5 rounded-full border-2 border-orange-400 flex-shrink-0" />
                  <div>
                    <span className="text-sm text-gray-800">{item.name}</span>
                    {item.quantity && <span className="ml-2 text-xs text-gray-400">{item.quantity}</span>}
                  </div>
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-gray-300 hover:text-red-400 text-sm opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Checked items */}
      {checked.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4 opacity-60">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-500">購入済み ({checked.length})</h3>
            <button onClick={clearChecked} className="text-xs text-red-400 hover:text-red-600">
              削除
            </button>
          </div>
          <ul className="space-y-2">
            {checked.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <button onClick={() => toggleItem(item)} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-orange-400 flex-shrink-0 flex items-center justify-center text-white text-xs">✓</span>
                  <span className="text-sm text-gray-400 line-through">{item.name}</span>
                  {item.quantity && <span className="text-xs text-gray-300">{item.quantity}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">🛒</p>
          <p className="text-sm">まだアイテムがありません</p>
        </div>
      )}
    </div>
  )
}
