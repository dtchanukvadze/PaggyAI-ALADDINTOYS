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
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',       icon: Package },
  shipped:    { label: 'Shipped',    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',       icon: XCircle },
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

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError(authError?.message ?? 'Authentication failed.')
      setLoading(false)
      return
    }

    // Verify the user is an admin
    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', data.user.id)
      .single()

    if (!adminRow) {
      await supabase.auth.signOut()
      setError('Access denied. This account does not have admin privileges.')
      setLoading(false)
      return
    }

    onLogin(data.user)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="card w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-pink-500 shadow-xl shadow-pink-400/30">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-black text-gray-900 dark:text-white">
            Admin Access
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Restricted to authorised personnel only
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 dark:border-gray-700 dark:bg-gray-800/80 dark:text-white dark:focus:border-pink-500 dark:focus:ring-pink-900/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 dark:border-gray-700 dark:bg-gray-800/80 dark:text-white dark:focus:border-pink-500 dark:focus:ring-pink-900/30"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderModal({ order, onClose, onStatusChange }: {
  order: Order
  onClose: () => void
  onStatusChange: (id: string, status: OrderStatus) => void
}) {
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (status: OrderStatus) => {
    setUpdating(true)
    await onStatusChange(order.id, status)
    setUpdating(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
              Order Details
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Customer</p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white">{order.customer_name}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Date</p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email</p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white break-all">{order.customer_email}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Phone</p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white">{order.customer_phone ?? '—'}</p>
            </div>
          </div>

          {order.delivery_address && (
            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Address</p>
              <p className="mt-1 text-gray-900 dark:text-white">{order.delivery_address}</p>
            </div>
          )}

          {order.notes && (
            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Notes</p>
              <p className="mt-1 text-gray-700 dark:text-gray-300">{order.notes}</p>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Items Ordered
            </p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-fuchsia-50 px-3 py-2 dark:bg-fuchsia-900/20"
                >
                  <span className="text-gray-900 dark:text-white font-medium">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400">x{item.quantity}</span>
                    <span className="font-bold text-pink-600 dark:text-pink-400">
                      ₾{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <span className="font-display text-xl font-black text-pink-600 dark:text-pink-400">
                Total: ₾{order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Status update */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Update Status
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((status) => {
                const cfg = STATUS_CONFIG[status]
                const Icon = cfg.icon
                return (
                  <button
                    key={status}
                    disabled={updating || order.status === status}
                    onClick={() => handleStatusChange(status)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      order.status === status
                        ? cfg.color + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  const loadOrders = useCallback(async () => {
    setLoading(true)
    const { data } = await fetchOrders()
    setOrders(data)
    setLoading(false)
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    const { error } = await updateOrderStatus(id, status)
    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      )
      if (selectedOrder?.id === id) {
        setSelectedOrder((o) => (o ? { ...o, status } : o))
      }
    }
  }

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter)

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    revenue: orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0),
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-pink-500 shadow-lg shadow-pink-400/30">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-pink-600 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: Package, color: 'from-fuchsia-500 to-pink-600' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-amber-400 to-orange-500' },
          { label: 'Revenue', value: `₾${stats.revenue.toFixed(2)}`, icon: CheckCircle, color: 'from-emerald-400 to-teal-500' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <div className="font-display text-2xl font-black text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            statusFilter === 'all'
              ? 'bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white shadow-lg shadow-pink-400/30'
              : 'bg-white/70 text-gray-600 hover:text-pink-600 dark:bg-gray-800/70 dark:text-gray-300'
          }`}
        >
          All ({orders.length})
        </button>
        {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((status) => {
          const count = orders.filter((o) => o.status === status).length
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white shadow-lg shadow-pink-400/30'
                  : 'bg-white/70 text-gray-600 hover:text-pink-600 dark:bg-gray-800/70 dark:text-gray-300'
              }`}
            >
              {STATUS_CONFIG[status].label} ({count})
            </button>
          )
        })}
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-gray-500 dark:text-gray-400">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-900/50">
                  {['Order ID', 'Customer', 'Items', 'Total', 'Date', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const cfg = STATUS_CONFIG[order.status]
                  const Icon = cfg.icon
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-100 transition-colors hover:bg-pink-50/50 dark:border-gray-800 dark:hover:bg-pink-900/10"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 dark:text-white">{order.customer_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{order.customer_email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 font-bold text-pink-600 dark:text-pink-400">
                        ₾{order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-pink-600 hover:bg-pink-50 dark:text-pink-400 dark:hover:bg-pink-900/20"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setChecking(false)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-pink-500" />
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={setUser} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}
