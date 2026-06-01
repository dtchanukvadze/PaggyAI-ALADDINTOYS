'use client'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  shop/page.tsx  —  Dynamic product shop, data fetched from Supabase
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  SUPABASE CONTRACT
 *  The page reads from the `products` table created in the previous step.
 *  Expected columns used here:
 *    id          uuid
 *    name        text
 *    description text | null
 *    price       numeric
 *    category    text | null
 *    image_url   text | null    ← URL  OR  a single emoji character
 *    in_stock    boolean
 *    metadata    jsonb          ← optional shape: { badge?: string, badgeGe?: string,
 *                                                    nameGe?: string, descriptionGe?: string,
 *                                                    gradient?: string, rating?: number,
 *                                                    reviews?: number }
 *
 *  All metadata fields are OPTIONAL — the card degrades gracefully when absent.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import {
  ShoppingCart, Check, Star, Filter, Sparkles,
  PackageSearch, RefreshCw, AlertCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCartStore, useLang } from '@/components/CartProvider'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductMeta {
  badge?:        string
  badgeGe?:      string
  nameGe?:       string
  descriptionGe?: string
  gradient?:     string
  rating?:       number   // 1-5
  reviews?:      number
}

export interface DbProduct {
  id:          string
  name:        string
  description: string | null
  price:       number
  category:    string | null
  image_url:   string | null
  in_stock:    boolean
  metadata:    ProductMeta
}

// ─── Supabase fetch ───────────────────────────────────────────────────────────

async function loadProducts(): Promise<{ data: DbProduct[]; error: string | null }> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, category, image_url, in_stock, metadata')
    .order('created_at', { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as DbProduct[], error: null }
}

// ─── Derived category list from live data ─────────────────────────────────────

function buildCategories(products: DbProduct[], t: (en: string, ge: string) => string) {
  const seen = new Set<string>()
  const cats: { id: string; label: string }[] = [
    { id: 'all', label: t('All', 'ყველა') },
  ]
  products.forEach((p) => {
    if (p.category && !seen.has(p.category)) {
      seen.add(p.category)
      cats.push({ id: p.category, label: p.category })
    }
  })
  return cats
}

// ─── Gradient palette — assigned by index when no gradient in metadata ─────────

const GRADIENT_PALETTE = [
  'from-orange-400 to-amber-500',
  'from-fuchsia-400 to-pink-500',
  'from-red-400 to-rose-500',
  'from-emerald-400 to-teal-500',
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-blue-500 to-indigo-600',
  'from-cyan-400 to-blue-500',
  'from-yellow-400 to-orange-500',
  'from-pink-300 to-rose-400',
  'from-amber-600 to-orange-700',
  'from-indigo-800 to-purple-900',
]

function gradientFor(product: DbProduct, index: number): string {
  return product.metadata?.gradient ?? GRADIENT_PALETTE[index % GRADIENT_PALETTE.length]
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="card flex flex-col overflow-hidden animate-pulse">
      <div className="mb-4 h-44 rounded-2xl bg-gray-200 dark:bg-gray-700" />
      <div className="h-5 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="mt-2 h-4 w-full rounded-lg bg-gray-100 dark:bg-gray-800" />
      <div className="mt-1 h-4 w-2/3 rounded-lg bg-gray-100 dark:bg-gray-800" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-7 w-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 w-24 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  )
}

// ─── Image renderer — URL or emoji fallback ───────────────────────────────────

function ProductImage({ src, name, gradient }: { src: string | null; name: string; gradient: string }) {
  const [failed, setFailed] = useState(false)

  // Detect single emoji / short non-URL strings as emoji display
  const isEmoji = src && src.length <= 4 && !src.startsWith('http')

  if (!src || failed || isEmoji) {
    return (
      <div className={`flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-7xl shadow-inner`}>
        {isEmoji ? src : '🎁'}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      className="h-full w-full rounded-2xl object-cover"
      onError={() => setFailed(true)}
    />
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, index }: { product: DbProduct; index: number }) {
  const { t } = useLang()
  const addItem   = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const meta     = product.metadata ?? {}
  const gradient = gradientFor(product, index)
  const rating   = meta.rating  ?? 5
  const reviews  = meta.reviews ?? 0
  const badge    = meta.badge   ?? null

  const displayName = t(product.name, meta.nameGe ?? product.name)
  const displayDesc = t(product.description ?? '', meta.descriptionGe ?? product.description ?? '')

  const handleAdd = () => {
    addItem({
      id:     product.id,
      name:   product.name,
      nameGe: meta.nameGe ?? product.name,
      price:  product.price,
      image:  product.image_url ?? '🎁',
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 10) * 0.07 }}
      whileHover={{ y: -6 }}
      className="card group relative flex flex-col overflow-hidden"
    >
      {/* Out-of-stock overlay */}
      {!product.in_stock && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-white/60 backdrop-blur-[2px] dark:bg-gray-900/60">
          <span className="rounded-full bg-gray-800/80 px-3 py-1 text-xs font-bold tracking-widest text-white dark:bg-white/20">
            {t('OUT OF STOCK', 'არ არის მარაგში')}
          </span>
        </div>
      )}

      {/* Image area */}
      <div className="relative mb-4 h-44 overflow-hidden rounded-2xl">
        <ProductImage src={product.image_url} name={product.name} gradient={gradient} />
        {badge && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-gray-800 shadow">
            {t(badge, meta.badgeGe ?? badge)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col">
        <h3 className="font-display text-lg font-bold leading-snug text-gray-900 dark:text-white">
          {displayName}
        </h3>

        {displayDesc && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {displayDesc}
          </p>
        )}

        {/* Category chip */}
        {product.category && (
          <span className="mt-2 w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {product.category}
          </span>
        )}

        {/* Stars */}
        {reviews > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-200 dark:text-gray-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">({reviews})</span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-display text-2xl font-black text-pink-600 dark:text-pink-400">
            ₾{product.price.toFixed(2)}
          </span>

          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleAdd}
            disabled={!product.in_stock}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
              added
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-400/30'
                : 'bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white shadow-lg shadow-pink-400/30 hover:shadow-xl hover:shadow-pink-400/40'
            }`}
          >
            {added ? (
              <><Check className="h-4 w-4" />{t('Added!', 'დამატებულია!')}</>
            ) : (
              <><ShoppingCart className="h-4 w-4" />{t('Add', 'დამატება')}</>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Category filter bar ──────────────────────────────────────────────────────

function CategoryBar({
  categories,
  active,
  onChange,
}: {
  categories: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-8 flex flex-wrap items-center justify-center gap-2"
    >
      <Filter className="h-4 w-4 text-gray-400" />
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-all ${
            active === cat.id
              ? 'bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white shadow-lg shadow-pink-400/30'
              : 'bg-white/70 text-gray-600 hover:text-pink-600 dark:bg-gray-800/70 dark:text-gray-300 dark:hover:text-pink-400'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </motion.div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ t }: { t: (en: string, ge: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4 py-24 text-center"
    >
      <PackageSearch className="h-16 w-16 text-gray-300 dark:text-gray-700" />
      <p className="text-lg font-semibold text-gray-400 dark:text-gray-600">
        {t('No products in this category yet.', 'ამ კატეგორიაში პროდუქტი ჯერ არ არის.')}
      </p>
    </motion.div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry, t }: {
  message: string
  onRetry: () => void
  t: (en: string, ge: string) => string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4 py-24 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/30">
        <AlertCircle className="h-8 w-8 text-rose-500" />
      </div>
      <p className="text-sm font-semibold text-rose-500">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-400/30"
      >
        <RefreshCw className="h-4 w-4" />
        {t('Try again', 'ხელახლა ცდა')}
      </button>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShopClient() {
  const { t } = useLang()

  const [products,       setProducts]       = useState<DbProduct[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')

  /** Fetch (or re-fetch) products from Supabase */
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await loadProducts()
    if (err) setError(err)
    else setProducts(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Derive category list from live data
  const categories = buildCategories(products, t)

  // Client-side filter
  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory)

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">

      {/* ── Page header ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <span className="glow-badge mb-4 inline-flex">
          <Sparkles className="h-4 w-4" />
          {t('Our Collection', 'ჩვენი კოლექცია')}
        </span>
        <h1 className="section-heading">
          {t('Magical Toy Shop', 'ჯადოსნური სათამაშოები')}
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          {t(
            'Hand-picked toys for curious, creative, and joyful kids',
            'შერჩეული სათამაშოები ცნობისმოყვარე, შემოქმედებითი ბავშვებისთვის'
          )}
        </p>
      </motion.div>

      {/* ── Category filter — hidden while loading ────── */}
      {!loading && !error && products.length > 0 && (
        <CategoryBar
          categories={categories}
          active={activeCategory}
          onChange={(id) => { setActiveCategory(id) }}
        />
      )}

      {/* ── Main content area ─────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Loading skeletons */}
        {loading && (
          <motion.div
            key="skeletons"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </motion.div>
        )}

        {/* Error state */}
        {!loading && error && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorState message={error} onRetry={fetchData} t={t} />
          </motion.div>
        )}

        {/* Product grid */}
        {!loading && !error && (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {filtered.length === 0 ? (
              <EmptyState t={t} />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
