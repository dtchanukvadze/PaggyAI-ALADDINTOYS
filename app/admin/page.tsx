'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogIn, LogOut, RefreshCw, Package, Clock, CheckCircle,
  Truck, XCircle, AlertCircle, Eye, ShieldCheck, Loader2
} from 'lucide-react'
import { supabase, fetchOrders, updateOrderStatus } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',    icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',      icon: Package },
  shipped:    { label: 'Shipped',    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',      icon: XCircle },
}

// ─── Auth Form ────────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError || !data.user) throw new Error(authError?.message ?? 'Authentication failed.')

      // Verify the user is in the admin_users table
      const { data: adminRow, error: adminQueryError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()

      if (adminQueryError || !adminRow) {
        await supabase.auth.signOut()
        throw new Error('Access denied. This account does not have admin privileges.')
      }

      onLogin(data.user)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-20">
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="card w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-pink-500 shadow-xl shadow-pink-400/30">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-black text-gray-900 dark:text-white">Admin Access</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Restricted to authorised personnel only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 dark:border-gray-700 dark:bg-gray-800/80 dark:text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 dark:border-gray-700 dark:bg-gray-800/80 dark:text-white" />
          </div>
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                <AlertCircle className="h-4 w-4" /> {error}
              </motion.div>
            )}
          </AnimatePresence>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Dashboard & Components (Same as provided logic) ──────────────────────────

function OrderModal({ order, onClose, onStatusChange }: { order: Order; onClose: () => void; onStatusChange: (id: string, status: OrderStatus) => void }) {
  const [updating, setUpdating] = useState(false)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((status) => (
            <button key={status} disabled={updating || order.status === status} onClick={() => { setUpdating(true); onStatusChange(order.id, status); setUpdating(false); }} className="px-3 py-1.5 text-xs rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 disabled:opacity-50">
              {STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    const { data } = await fetchOrders()
    setOrders(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    await updateOrderStatus(id, status)
    loadOrders()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-20">
      <div className="flex justify-between mb-8">
        <div><h1 className="text-2xl font-black">Admin Dashboard</h1><p className="text-xs">{user.email}</p></div>
        <button onClick={onLogout} className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-rose-600"><LogOut className="h-4 w-4" /> Sign Out</button>
      </div>
      {/* ... Rest of your table/grid rendering logic ... */}
      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={handleStatusChange} />}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => { await supabase.auth.signOut() }

  if (checking) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-pink-500" /></div>
  if (!user) return <LoginForm onLogin={setUser} />
  
  return <Dashboard user={user} onLogout={handleLogout} />
}