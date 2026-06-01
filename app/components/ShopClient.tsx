'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogIn, LogOut, RefreshCw, Package, Clock, CheckCircle,
  Truck, XCircle, AlertCircle, Eye, ShieldCheck, Loader2,
  Plus, Pencil, Trash2, X, ShoppingBag, ToggleLeft, ToggleRight,
  Search,
} from 'lucide-react'
import { supabase, fetchOrders, updateOrderStatus } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// ─── Product Type ─────────────────────────────────────────────────────────────

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  image_url: string | null
  in_stock: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

const EMPTY_FORM: Omit<Product, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  description: '',
  price: 0,
  category: '',
  image_url: '',
  in_stock: true,
  metadata: {},
}

// ─── Supabase helpers for products ───────────────────────────────────────────

async function fetchProducts(): Promise<{ data: Product[]; error: string | null }> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: data as Product[], error: null }
}

async function createProduct(
  payload: Omit<Product, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Product | null; error: string | null }> {
  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Product, error: null }
}

async function updateProduct(
  id: string,
  payload: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Product | null; error: string | null }> {
  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Product, error: null }
}

async function deleteProduct(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  return { error: error ? error.message : null }
}

// ─── Status Config (Orders) ──────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',       icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',           icon: Package },
  shipped:    { label: 'Shipped',    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',   icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',           icon: XCircle },
}

// ─── Shared Component ────────────────────────────────────────────────────────

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label} {required && <span className="text-pink-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm ' +
  'focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 ' +
  'dark:border-gray-700 dark:bg-gray-800/80 dark:text-white ' +
  'dark:focus:border-pink-500 dark:focus:ring-pink-900/30'

// ─── Product Form Modal ──────────────────────────────────────────────────────

function ProductFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Product | null
  onClose: () => void
  onSave: (product: Product) => void
}) {
  const isEditing = Boolean(initial)
  const [form, setForm] = useState<Omit<Product, 'id' | 'created_at' | 'updated_at'>>(
    initial
      ? {
          name: initial.name,
          description: initial.description ?? '',
          price: initial.price,
          category: initial.category ?? '',
          image_url: initial.image_url ?? '',
          in_stock: initial.in_stock,
          metadata: initial.metadata ?? {},
        }
      : EMPTY_FORM
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Product name is required.')
    if (form.price < 0) return setError('Price cannot be negative.')

    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      description: form.description?.trim() || null,
      category:    form.category?.trim()    || null,
      image_url:   form.image_url?.trim()   || null,
    }

    if (isEditing && initial) {
      const { data, error: err } = await updateProduct(initial.id, payload)
      if (err || !data) { setError(err ?? 'Update failed.'); setSaving(false); return }
      onSave(data)
    } else {
      const { data, error: err } = await createProduct(payload)
      if (err || !data) { setError(err ?? 'Create failed.'); setSaving(false); return }
      onSave(data)
    }

    setSaving(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-900"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-pink-500 shadow-lg shadow-pink-400/30">
              {isEditing ? <Pencil className="h-4 w-4 text-white" /> : <Plus className="h-4 w-4 text-white" />}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Product' : 'New Product'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Product Name" required>
            <input className={inputCls} type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Rose Bouquet" />
          </Field>

          <Field label="Description">
            <textarea className={inputCls + ' resize-none'} rows={3} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="Short product description…" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₾)" required>
              <input className={inputCls} type="number" min="0" step="0.01" required value={form.price} onChange={(e) => set('price', parseFloat(e.target.value) || 0)} />
            </Field>
            <Field label="Category">
              <input className={inputCls} type="text" value={form.category ?? ''} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Flowers" />
            </Field>
          </div>

          <Field label="Image URL">
            <input className={inputCls} type="url" value={form.image_url ?? ''} onChange={(e) => set('image_url', e.target.value)} placeholder="https://…" />
          </Field>

          <Field label="Availability">
            <button
              type="button" onClick={() => set('in_stock', !form.in_stock)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
                form.in_stock
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {form.in_stock ? <><ToggleRight className="h-5 w-5" /> In Stock</> : <><ToggleLeft className="h-5 w-5" /> Out of Stock</>}
            </button>
          </Field>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-400/30 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteConfirmModal({
  product,
  onClose,
  onConfirm,
}: {
  product: Product
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await onConfirm()
    setDeleting(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm text-center bg-white rounded-3xl p-6 dark:bg-gray-900 shadow-xl"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/30">
          <Trash2 className="h-7 w-7 text-rose-600 dark:text-rose-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Product?</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-700 dark:text-gray-200">{product.name}</span> will be permanently removed. This cannot be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [formTarget, setFormTarget] = useState<Product | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await fetchProducts()
    if (error) showNotification(error, 'error')
    setProducts(data)
    setLoading(false)
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3500)
  }

  const handleSaved = (saved: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === saved.id)
      if (exists) return prev.map((p) => (p.id === saved.id ? saved : p))
      return [saved, ...prev]
    })
    showNotification(formTarget ? `"${saved.name}" updated.` : `"${saved.name}" added.`, 'success')
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const { error } = await deleteProduct(deleteTarget.id)
    if (error) { showNotification(error, 'error'); return }
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    showNotification(`"${deleteTarget.name}" deleted.`, 'success')
  }

  const filtered = products.filter((p) =>
    search === '' ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className={`fixed top-24 right-6 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl ${
              notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input className={inputCls + ' pl-9'} placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="flex gap-2">
          <button onClick={loadProducts} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-pink-600 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => setFormTarget(null)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-400/30 hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-600">
          <ShoppingBag className="h-10 w-10" />
          <p className="text-sm font-semibold">{search ? 'No products match your search.' : 'No products yet. Add one!'}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm dark:bg-gray-900 dark:border-gray-800 group relative flex flex-col gap-3">
              <span className={`absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                product.in_stock ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </span>

              <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/20 dark:to-pink-900/20">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <ShoppingBag className="h-10 w-10 text-pink-300 dark:text-pink-800" />
                )}
              </div>

              <div className="flex-1">
                <p className="font-bold text-gray-900 dark:text-white leading-tight">{product.name}</p>
                {product.category && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{product.category}</p>}
                {product.description && <p className="mt-1.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{product.description}</p>}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                <span className="text-lg font-black text-pink-600 dark:text-pink-400">₾{product.price.toFixed(2)}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => setFormTarget(product)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-fuchsia-600 hover:bg-fuchsia-50 dark:text-fuchsia-400 dark:hover:bg-fuchsia-900/20" title="Edit product">
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(product)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20" title="Delete product">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {formTarget !== undefined && <ProductFormModal initial={formTarget} onClose={() => setFormTarget(undefined)} onSave={handleSaved} />}
      </AnimatePresence>
      <AnimatePresence>
        {deleteTarget && <DeleteConfirmModal product={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
      </AnimatePresence>
    </div>
  )
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

    const { data: adminRow } = await supabase.from('admin_users').select('id').eq('id', data.user.id).single()
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
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-pink-500 shadow-xl shadow-pink-400/30">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admin Access</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Restricted to authorised personnel only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-400/30 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 dark:bg-gray-900 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Details</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">✕</button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Customer', val: order.customer_name },
              { label: 'Date',     val: new Date(order.created_at).toLocaleDateString() },
              { label: 'Email',    val: order.customer_email },
              { label: 'Phone',    val: order.customer_phone ?? '—' },
            ].map(({ label, val }) => (
              <div key={label} className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white break-all">{val}</p>
              </div>
            ))}
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

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Items Ordered</p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-fuchsia-50 px-3 py-2 dark:bg-fuchsia-900/20">
                  <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400">x{item.quantity}</span>
                    <span className="font-bold text-pink-600 dark:text-pink-400">₾{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <span className="text-xl font-black text-pink-600 dark:text-pink-400">Total: ₾{order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((status) => {
                const cfg = STATUS_CONFIG[status]
                const Icon = cfg.icon
                return (
                  <button key={status} disabled={updating || order.status === status} onClick={() => handleStatusChange(status)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      order.status === status
                        ? cfg.color + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <Icon className="h-3 w-3" /> {cfg.label}
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

type Tab = 'orders' | 'products'

function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true)
    const { data } = await fetchOrders()
    setOrders(data)
    setOrdersLoading(false)
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    const { error } = await updateOrderStatus(id, status)
    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
      if (selectedOrder?.id === id) setSelectedOrder((o) => (o ? { ...o, status } : o))
    }
  }
}