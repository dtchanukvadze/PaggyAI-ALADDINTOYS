'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from '@formspree/react'
import {
  ShoppingCart, Trash2, Plus, Minus, Send, CheckCircle,
  User, Mail, Phone, MapPin, MessageSquare, Sparkles, Package
} from 'lucide-react'
import { useCartStore, useLang } from '@/components/CartProvider'
import { insertOrder } from '@/lib/supabase'

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? 'YOUR_FORM_ID'

// ─── Cart Summary ─────────────────────────────────────────────────────────────

function CartSummary() {
  const { t } = useLang()
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center gap-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-700" />
        <p className="text-gray-500 dark:text-gray-400">
          {t('Your cart is empty.', 'კალათა ცარიელია.')}
        </p>
        <a href="/shop" className="btn-primary text-sm">
          {t('Browse Shop', 'ნახე კატალოგი')}
        </a>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="mb-4 font-display text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-pink-500" />
        {t('Your Cart', 'შენი კალათა')} ({items.reduce((s, i) => s + i.quantity, 0)})
      </h2>

      <div className="space-y-3">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-100 to-pink-100 text-2xl dark:from-fuchsia-900/40 dark:to-pink-900/40">
              {item.image}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {t(item.name, item.nameGe)}
              </p>
              <p className="text-sm font-bold text-pink-600 dark:text-pink-400">
                ₾{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:text-pink-600 dark:bg-gray-700 dark:text-gray-300"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-white">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:text-pink-600 dark:bg-gray-700 dark:text-gray-300"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-rose-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-fuchsia-50 to-pink-50 px-4 py-3 dark:from-fuchsia-900/20 dark:to-pink-900/20">
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {t('Total', 'სულ')}
        </span>
        <span className="font-display text-2xl font-black text-pink-600 dark:text-pink-400">
          ₾{totalPrice().toFixed(2)}
        </span>
      </div>
    </div>
  )
}

// ─── Input Component ──────────────────────────────────────────────────────────

function FormInput({
  label, name, type = 'text', required = false,
  icon: Icon, placeholder, value, onChange,
}: {
  label: string; name: string; type?: string; required?: boolean
  icon: React.ElementType; placeholder: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-pink-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-gray-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 backdrop-blur-sm transition-all focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 dark:border-gray-700 dark:bg-gray-800/80 dark:text-white dark:placeholder-gray-500 dark:focus:border-pink-500 dark:focus:ring-pink-900/30"
        />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { t } = useLang()
  const { items, totalPrice, clearCart } = useCartStore()
  const [formspreeState, submitToFormspree] = useForm(FORMSPREE_ID)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  })

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      setError(t('Please add items to your cart first.', 'გთხოვთ, ჯერ კალათაში დაამატეთ პროდუქტი.'))
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      // 1. Submit to Formspree (email notification)
      await submitToFormspree({
        ...form,
        items: JSON.stringify(items),
        total: totalPrice().toFixed(2),
      })

      // 2. Submit to Supabase (database record)
      const { error: dbError } = await insertOrder({
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone || null,
        delivery_address: form.address || null,
        notes: form.notes || null,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        total_amount: totalPrice(),
      })

      if (dbError) {
        console.error('Supabase error:', dbError)
        // Continue even if DB fails — Formspree email was sent
      }

      clearCart()
      setSuccess(true)
    } catch (err) {
      setError(t(
        'Something went wrong. Please try again or call us directly.',
        'შეცდომა დაფიქსირდა. სცადე ხელახლა ან დაგვიკავშირდი პირდაპირ.'
      ))
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success state ──
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="card max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-400/30"
          >
            <CheckCircle className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="font-display text-3xl font-black text-gray-900 dark:text-white">
            {t('Order Placed! 🎉', 'შეკვეთა მიღებულია! 🎉')}
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            {t(
              'Thank you! We\'ll contact you shortly to confirm your order and arrange delivery.',
              'გმადლობთ! მალე დაგიკავშირდებით შეკვეთის დასადასტურებლად.'
            )}
          </p>
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            📞 {t('Or call us at', 'ან დაგვირეკე')} <strong>+995 599 02 17 44</strong>
          </div>
          <a href="/shop" className="btn-primary mt-6 inline-flex">
            {t('Continue Shopping', 'გააგრძელე შოპინგი')}
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <span className="glow-badge mb-4 inline-flex">
          <Package className="h-4 w-4" />
          {t('Place Your Order', 'შეკვეთის განთავსება')}
        </span>
        <h1 className="section-heading">{t('Checkout', 'გადახდა')}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('Fill in your details and we\'ll take care of the rest', 'შეავსე დეტალები — დანარჩენს ჩვენ ვიზრუნებთ')}
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="card space-y-5">
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-500" />
              {t('Your Details', 'თქვენი დეტალები')}
            </h2>

            <FormInput
              label={t('Full Name', 'სახელი და გვარი')}
              name="name" required icon={User}
              placeholder={t('e.g. Tamara Beridze', 'მაგ. თამარ ბერიძე')}
              value={form.name} onChange={update}
            />
            <FormInput
              label={t('Email Address', 'ელ-ფოსტა')}
              name="email" type="email" required icon={Mail}
              placeholder="email@example.com"
              value={form.email} onChange={update}
            />
            <FormInput
              label={t('Phone Number', 'ტელეფონის ნომერი')}
              name="phone" type="tel" icon={Phone}
              placeholder="+995 5XX XX XX XX"
              value={form.phone} onChange={update}
            />
            <FormInput
              label={t('Delivery Address', 'მიწოდების მისამართი')}
              name="address" icon={MapPin}
              placeholder={t('Street, district, Tbilisi', 'ქუჩა, უბანი, თბილისი')}
              value={form.address} onChange={update}
            />

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('Notes / Special Requests', 'შენიშვნები')}
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <textarea
                  name="notes"
                  rows={3}
                  placeholder={t(
                    'Gift wrapping, specific colors, delivery time...',
                    'საჩუქრის შეფუთვა, კონკრეტული ფერები, მიწოდების დრო...'
                  )}
                  value={form.notes}
                  onChange={update}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 dark:border-gray-700 dark:bg-gray-800/80 dark:text-white dark:placeholder-gray-500 dark:focus:border-pink-500 dark:focus:ring-pink-900/30"
                />
              </div>
            </div>

            {/* Hidden fields for Formspree */}
            <input type="hidden" name="items" value={JSON.stringify(items.map(i => `${i.name} x${i.quantity}`))} />
            <input type="hidden" name="total" value={`₾${totalPrice().toFixed(2)}`} />

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full justify-center py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                  />
                  {t('Sending...', 'იგზავნება...')}
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  {t('Place Order', 'შეკვეთის განთავსება')}
                </>
              )}
            </motion.button>

            <p className="text-center text-xs text-gray-400 dark:text-gray-600">
              {t(
                'By submitting you agree to be contacted by our team.',
                'გაგზავნით ეთანხმები ჩვენი გუნდის მიერ დაკავშირებას.'
              )}
            </p>
          </form>
        </motion.div>

        {/* Cart Summary */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <CartSummary />

          {/* Info box */}
          <div className="mt-4 card bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/20 dark:to-pink-900/20">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">
              {t('Why order with us?', 'რატომ ჩვენ?')}
            </h3>
            {[
              { icon: '🏪', en: 'In-store pick-up available', ge: 'მაღაზიიდან გატანა შესაძლებელია' },
              { icon: '🚚', en: 'Fast Tbilisi delivery', ge: 'სწრაფი მიწოდება თბილისში' },
              { icon: '🎁', en: 'Free gift wrapping', ge: 'უფასო საჩუქრის შეფუთვა' },
              { icon: '📞', en: 'Personal support: +995 599 02 17 44', ge: 'პირდაპირი კავშირი: +995 599 02 17 44' },
            ].map((item) => (
              <div key={item.en} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>{item.icon}</span>
                <span>{t(item.en, item.ge)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
