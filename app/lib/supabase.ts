import { createClient } from '@supabase/supabase-js'

// 1. Initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://secfkoihrqmdvimqduzj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 2. Types
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

// 3. Database Helpers
export async function insertOrder(
  data: Omit<Order, 'id' | 'created_at' | 'status'>
): Promise<{ data: Order | null; error: any }> {
  const { data: order, error } = await supabase
    .from('orders')
    .insert([{ ...data, status: 'pending' }])
    .select()
    .single()

  return { data: order as Order | null, error }
}

export async function fetchOrders(): Promise<{ data: Order[]; error: any }> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: (data as Order[]) ?? [], error }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    
  return { error }
}