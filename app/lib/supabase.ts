import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Types ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  created_at: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  delivery_address: string | null
  notes: string | null
  items: OrderItem[]
  total_amount: number
  status: OrderStatus
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

export async function insertOrder(
  data: Omit<Order, 'id' | 'created_at' | 'status'>
): Promise<{ data: Order | null; error: Error | null }> {
  const { data: order, error } = await supabase
    .from('orders')
    .insert([{ ...data, status: 'pending' }])
    .select()
    .single()

  return { data: order, error }
}

export async function fetchOrders(): Promise<{ data: Order[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  return { error }
}
