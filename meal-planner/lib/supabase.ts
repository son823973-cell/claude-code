import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Meal = {
  id: string
  household_code: string
  date: string
  name: string
  memo: string | null
  created_at: string
}

export type ShoppingItem = {
  id: string
  household_code: string
  name: string
  quantity: string | null
  checked: boolean
  created_at: string
}
