'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { ShoppingCart, Check, Star, Filter, Sparkles } from 'lucide-react'
import { useCartStore, useLang } from '@/components/CartProvider'

// ─── Product Data ─────────────────────────────────────────────────────────────

const products = [
  {
    id: 'prod-1',
    name: 'LEGO Classic Bricks Set',
    nameGe: 'LEGO კლასიკური კუბიკების ნაკრები',
    category: 'building',
    price: 89.99,
    rating: 5,
    reviews: 128,
    badge: 'Bestseller',
    badgeGe: 'ბესტსელერი',
    description: 'Creative building set with 1000+ classic bricks in vibrant colors.',
    descriptionGe: '1000+ კუბიკი ნათელ ფერებში — შემოქმედებისთვის.',
    image: '🧱',
    gradient: 'from-orange-400 to-amber-500',
  },
  {
    id: 'prod-2',
    name: 'Magic Princess Castle',
    nameGe: 'ჯადოსნური პრინცესას სასახლე',
    category: 'dolls',
    price: 124.99,
    rating: 5,
    reviews: 86,
    badge: 'New',
    badgeGe: 'სიახლე',
    description: 'A magical 3-story castle with lights, sounds, and 5 princess figures.',
    descriptionGe: '3-სართულიანი სასახლე შუქებით, ხმებით და 5 პრინცესას ფიგურით.',
    image: '🏰',
    gradient: 'from-fuchsia-400 to-pink-500',
  },
  {
    id: 'prod-3',
    name: 'RC Racing Car Pro',
    nameGe: 'RC სარბოლო მანქანა Pro',
    category: 'vehicles',
    price: 64.99,
    rating: 4,
    reviews: 52,
    badge: 'Popular',
    badgeGe: 'პოპულარული',
    description: 'High-speed remote-control racing car with 2.4GHz control and LED lights.',
    descriptionGe: '2.4GHz სიჩქარის RC მანქანა LED შუქებით.',
    image: '🚗',
    gradient: 'from-red-400 to-rose-500',
  },
  {
    id: 'prod-4',
    name: 'Science Discovery Kit',
    nameGe: 'მეცნიერების აღმოჩენების ნაკრები',
    category: 'educational',
    price: 49.99,
    rating: 5,
    reviews: 74,
    badge: 'Educational',
    badgeGe: 'სასწავლო',
    description: '50+ experiments in chemistry, physics, and biology for curious minds.',
    descriptionGe: '50+ ექსპერიმენტი ქიმიაში, ფიზიკასა და ბიოლოგიაში.',
    image: '🔬',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'prod-5',
    name: 'Wooden Puzzle World Map',
    nameGe: 'ხის პაზლი — მსოფლიო რუკა',
    category: 'educational',
    price: 34.99,
    rating: 5,
    reviews: 61,
    badge: 'Eco-Friendly',
    badgeGe: 'ეკო',
    description: 'Hand-crafted wooden world map puzzle with country names and capitals.',
    descriptionGe: 'ხელნაკეთი ხის მსოფლიო რუკა ქვეყნების სახელებით.',
    image: '🌍',
    gradient: 'from-sky-400 to-blue-500',
  },
  {
    id: 'prod-6',
    name: 'Plush Unicorn XL',
    nameGe: 'პლუშის უნიკორნი XL',
    category: 'plush',
    price: 29.99,
    rating: 5,
    reviews: 203,
    badge: 'Fan Favorite',
    badgeGe: 'საყვარელი',
    description: 'Super-soft giant unicorn plush toy with rainbow mane, 60cm tall.',
    descriptionGe: 'სუპერ რბილი უნიკორნი ცისარტყელა ფაფხუნით, 60სმ.',
    image: '🦄',
    gradient: 'from-violet-400 to-purple-500',
  },
]

const categories = [
  { id: 'all', label: 'All', labelGe: 'ყველა' },
  { id: 'building', label: 'Building', labelGe: 'კუბიკები' },
  { id: 'dolls', label: 'Dolls', labelGe: 'თოჯინები' },
  { id: 'vehicles', label: 'Vehicles', labelGe: 'მანქანები' },
  { id: 'educational', label: 'Educational', labelGe: 'სასწავლო' },
  { id: 'plush', label: 'Plush', labelGe: 'პლუში' },
]

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, index }: { product: typeof products[0]; index: number }) {
  const { t } = useLang()
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      nameGe: product.nameGe,
      price: product.price,
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="card group flex flex-col overflow-hidden"
    >
      {/* Product image area */}
      <div
        className={`relative mb-4 flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br ${product.gradient} text-7xl shadow-inner`}
      >
        {product.image}
        {/* Badge */}
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-gray-800 shadow">
          {t(product.badge, product.badgeGe)}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col">
        <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white leading-snug">
          {t(product.name, product.nameGe)}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t(product.description, product.descriptionGe)}
        </p>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-1.5">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < product.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-200 dark:text-gray-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">({product.reviews})</span>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          {/* Price */}
          <span className="font-display text-2xl font-black text-pink-600 dark:text-pink-400">
            ₾{product.price.toFixed(2)}
          </span>

          {/* Add to Cart */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleAdd}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              added
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-400/30'
                : 'bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white shadow-lg shadow-pink-400/30 hover:shadow-xl hover:shadow-pink-400/40'
            }`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                {t('Added!', 'დამატებულია!')}
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                {t('Add', 'დამატება')}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShopPage() {
  const { t } = useLang()
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
      {/* Header */}
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
        <h1 className="section-heading">{t('Magical Toy Shop', 'ჯადოსნური სათამაშო')}</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          {t(
            'Hand-picked toys for curious, creative, and joyful kids',
            'შერჩეული სათამაშოები ცნობისმოყვარე, შემოქმედებითი ბავშვებისთვის'
          )}
        </p>
      </motion.div>

      {/* Category Filter */}
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
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white shadow-lg shadow-pink-400/30'
                : 'bg-white/70 text-gray-600 hover:text-pink-600 dark:bg-gray-800/70 dark:text-gray-300 dark:hover:text-pink-400'
            }`}
          >
            {t(cat.label, cat.labelGe)}
          </button>
        ))}
      </motion.div>

      {/* Product Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-24 text-center text-gray-500">
          {t('No products in this category yet.', 'ამ კატეგორიაში პროდუქტი ჯერ არ არის.')}
        </div>
      )}
    </div>
  )
}
