
// Ensure NEXT_PUBLIC_SUPABASE_URL in Vercel is just: https://secfkoihrqmdvimqduzj.supabase.co
import { createClient } from '@supabase/supabase-js'

// No /rest/v1 here!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! 
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

export async function insertOrder(data: {
  customer_name: string
  customer_email: string
  customer_phone?: string | null
  delivery_address?: string | null
  notes?: string | null
  items: OrderItem[]
  total_amount: number
}) {
  return await supabase
    .from('orders')
    .insert([{ ...data, status: 'pending' }])
    .select()
    .single()
}