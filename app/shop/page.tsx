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
    descriptionGe: 'სუპერ რბილი უნიკორნი ცისარტყელა ფაფარით, 60სმ.',
    image: '🦄',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    id: 'prod-7',
    name: 'Monopoly Family Edition',
    nameGe: 'მონოპოლია — საოჯახო გამოცემა',
    category: 'games',
    price: 39.99,
    rating: 4,
    reviews: 312,
    badge: 'Classic',
    badgeGe: 'კლასიკა',
    description: 'The classic real estate trading board game for the whole family.',
    descriptionGe: 'კლასიკური სამაგიდო თამაში მთელი ოჯახისთვის.',
    image: '🎲',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'prod-8',
    name: 'Galaxy Guardian Action Figure',
    nameGe: 'გალაქტიკის მცველის ფიგურა',
    category: 'action-figures',
    price: 24.99,
    rating: 4,
    reviews: 89,
    badge: 'Trending',
    badgeGe: 'ტრენდული',
    description: 'Fully articulated superhero action figure with glowing accessories.',
    descriptionGe: 'მოძრავი სუპერგმირის ფიგურა მანათობელი აქსესუარებით.',
    image: '🦸‍♂️',
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    id: 'prod-9',
    name: 'Magnetic Building Tiles (100pc)',
    nameGe: 'მაგნიტური კონსტრუქტორი (100 ნაწილი)',
    category: 'building',
    price: 54.99,
    rating: 5,
    reviews: 415,
    badge: 'Award Winner',
    badgeGe: 'ჯილდოს მფლობელი',
    description: 'Colorful 3D magnetic building blocks that inspire creativity and logic.',
    descriptionGe: 'ფერადი 3D მაგნიტური კონსტრუქტორი ლოგიკისა და კრეატივისთვის.',
    image: '🧲',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    id: 'prod-10',
    name: 'Glamour Fashion Doll',
    nameGe: 'მოდური თოჯინა აქსესუარებით',
    category: 'dolls',
    price: 32.99,
    rating: 4,
    reviews: 156,
    badge: 'Popular',
    badgeGe: 'პოპულარული',
    description: 'Includes 10 outfit changes, stylish shoes, and a portable wardrobe.',
    descriptionGe: 'მოყვება 10 ტანსაცმელი, ფეხსაცმელი და პორტატული კარადა.',
    image: '👗',
    gradient: 'from-pink-300 to-rose-400',
  },
  {
    id: 'prod-11',
    name: 'Classic Wooden Train Track',
    nameGe: 'კლასიკური ხის მატარებელი',
    category: 'vehicles',
    price: 79.99,
    rating: 5,
    reviews: 210,
    badge: 'Bestseller',
    badgeGe: 'ბესტსელერი',
    description: '50-piece traditional wooden railway set with bridges and stations.',
    descriptionGe: '50-ნაწილიანი ტრადიციული ხის რკინიგზა ხიდებითა და სადგურით.',
    image: '🚂',
    gradient: 'from-amber-600 to-orange-700',
  },
  {
    id: 'prod-12',
    name: 'DIY Solar System Model',
    nameGe: 'მზის სისტემის მოდელი',
    category: 'educational',
    price: 22.99,
    rating: 4,
    reviews: 94,
    badge: 'STEM',
    badgeGe: 'STEM',
    description: 'Paint and assemble your own glowing planetarium model of the solar system.',
    descriptionGe: 'ააწყვე და გააფერადე მანათობელი მზის სისტემის მოდელი.',
    image: '🪐',
    gradient: 'from-indigo-800 to-purple-900',
  },
  {
    id: 'prod-13',
    name: 'Giant Teddy Bear (120cm)',
    nameGe: 'გიგანტური დათუნია (120სმ)',
    category: 'plush',
    price: 99.99,
    rating: 5,
    reviews: 342,
    badge: 'Gift Idea',
    badgeGe: 'საჩუქარი',
    description: 'Ultra-huggable, premium quality giant teddy bear. The perfect gift.',
    descriptionGe: 'უმაღლესი ხარისხის, გიგანტური პლუშის დათუნია. საუკეთესო საჩუქარი.',
    image: '🧸',
    gradient: 'from-amber-300 to-yellow-600',
  },
  {
    id: 'prod-14',
    name: 'Premium Wooden Chess Set',
    nameGe: 'პრემიუმ ხის ჭადრაკი',
    category: 'games',
    price: 45.99,
    rating: 5,
    reviews: 112,
    badge: 'Classic',
    badgeGe: 'კლასიკა',
    description: 'Hand-carved wooden chess and checkers set with a folding storage board.',
    descriptionGe: 'ხელით გამოთლილი ხის ჭადრაკი და შაში დასაკეცი დაფით.',
    image: '♟️',
    gradient: 'from-stone-600 to-stone-800',
  },
  {
    id: 'prod-15',
    name: 'Interactive Roaring T-Rex',
    nameGe: 'ინტერაქტიული დინოზავრი T-Rex',
    category: 'action-figures',
    price: 39.99,
    rating: 4,
    reviews: 205,
    badge: 'New',
    badgeGe: 'სიახლე',
    description: 'Walking, roaring T-Rex dinosaur with realistic sounds and glowing eyes.',
    descriptionGe: 'მოძრავი დინოზავრი რეალისტური ხმებით და მანათობელი თვალებით.',
    image: '🦖',
    gradient: 'from-lime-500 to-emerald-600',
  },
  {
    id: 'prod-16',
    name: 'Space Explorer Building Kit',
    nameGe: 'კოსმოსური სადგურის კონსტრუქტორი',
    category: 'building',
    price: 109.99,
    rating: 5,
    reviews: 67,
    badge: 'Premium',
    badgeGe: 'პრემიუმი',
    description: 'Highly detailed 800+ piece space station model with astronaut mini-figures.',
    descriptionGe: 'დეტალური 800+ ნაწილიანი კოსმოსური სადგური ასტრონავტებით.',
    image: '🚀',
    gradient: 'from-slate-700 to-slate-900',
  },
  {
    id: 'prod-17',
    name: 'Interactive Baby Doll & Stroller',
    nameGe: 'ჩვილი თოჯინა და ეტლი',
    category: 'dolls',
    price: 59.99,
    rating: 4,
    reviews: 124,
    badge: 'Bundle',
    badgeGe: 'ნაკრები',
    description: 'Lifelike baby doll that cries and laughs, includes a fully foldable stroller.',
    descriptionGe: 'რეალისტური ჩვილი, რომელიც ტირის და იცინის, დასაკეცი ეტლით.',
    image: '🍼',
    gradient: 'from-rose-200 to-pink-300',
  },
  {
    id: 'prod-18',
    name: 'Mini Quadcopter Drone',
    nameGe: 'მინი დრონი კვადროკოპტერი',
    category: 'vehicles',
    price: 89.99,
    rating: 4,
    reviews: 178,
    badge: 'Tech',
    badgeGe: 'ტექნიკა',
    description: 'Beginner-friendly mini drone with an HD camera, auto-hover, and flips.',
    descriptionGe: 'მარტივად მართვადი მინი დრონი HD კამერით და ავტომატური ბალანსით.',
    image: '🚁',
    gradient: 'from-zinc-400 to-zinc-600',
  }
]

// 🟢 Added 'Games' and 'Action Figures' to the filter list
const categories = [
  { id: 'all', label: 'All', labelGe: 'ყველა' },
  { id: 'building', label: 'Building', labelGe: 'კუბიკები' },
  { id: 'dolls', label: 'Dolls', labelGe: 'თოჯინები' },
  { id: 'vehicles', label: 'Vehicles', labelGe: 'მანქანები' },
  { id: 'educational', label: 'Educational', labelGe: 'სასწავლო' },
  { id: 'plush', label: 'Plush', labelGe: 'პლუში' },
  { id: 'games', label: 'Games', labelGe: 'თამაშები' },
  { id: 'action-figures', label: 'Figures', labelGe: 'ფიგურები' },
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
      transition={{ duration: 0.5, delay: (index % 10) * 0.08 }} // 🟢 Modulo prevents huge delays on lower rows
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
        <h1 className="section-heading">{t('Magical Toy Shop', 'ჯადოსნური სათამაშოები')}</h1>
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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