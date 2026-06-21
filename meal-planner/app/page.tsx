'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function Home() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createNew() {
    setLoading(true)
    setError('')
    const newCode = generateCode()
    const { error } = await supabase.from('households').insert({ code: newCode })
    if (error) {
      setError('エラーが発生しました。もう一度お試しください。')
      setLoading(false)
      return
    }
    router.push(`/${newCode}`)
  }

  async function joinExisting() {
    if (!code.trim()) {
      setError('コードを入力してください')
      return
    }
    setLoading(true)
    setError('')
    const { data } = await supabase
      .from('households')
      .select('code')
      .eq('code', code.toUpperCase())
      .single()

    if (!data) {
      setError('コードが見つかりません。確認してお試しください。')
      setLoading(false)
      return
    }
    router.push(`/${code.toUpperCase()}`)
  }

  return (
    <main className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🍽️</div>
          <h1 className="text-2xl font-bold text-orange-800">こんだてノート</h1>
          <p className="text-sm text-orange-600 mt-1">家族で共有できる献立・買い物管理</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <button
            onClick={createNew}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition disabled:opacity-50"
          >
            {loading ? '作成中...' : '新しく始める'}
          </button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-3 text-gray-400 text-sm">または</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 font-medium">家族のコードで参加</p>
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError('') }}
              placeholder="例：ABC123"
              maxLength={6}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={joinExisting}
              disabled={loading}
              className="w-full bg-white hover:bg-orange-50 text-orange-600 font-semibold py-3 px-4 rounded-xl border-2 border-orange-400 transition disabled:opacity-50"
            >
              参加する
            </button>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
      </div>
    </main>
  )
}
