'use client'

import { motion, useInView, Variants } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import {
  MapPin, Clock, Phone, ShoppingBag, Package, Truck,
  Star, Sparkles, ArrowRight, Gift, Heart
} from 'lucide-react'
import { useLang } from '@/components/CartProvider'

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6, 
      delay: i * 0.1, 
      ease: [0.25, 0.46, 0.45, 0.94] as any 
    },
  }),
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

// ─── Reusable Scroll Component ────────────────────────────────────────────────
function ScrollReveal({ 
  children, 
  className = '', 
  custom = 0 
}: { 
  children: React.ReactNode; 
  className?: string; 
  custom?: number 
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={custom}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default function HomePage() {
  const { t } = useLang()

  const reviews = [
    { name: 'Tamari Buchukuri', rating: 5, en: 'Incredible selection...', ge: 'წარმოუდგენელი არჩევანი...', avatar: 'T', color: 'from-rose-400 to-pink-600' },
    { name: 'Bakuri Bakuradze', rating: 5, en: 'The quality is exceptional...', ge: 'ხარისხი გამორჩეულია...', avatar: 'B', color: 'from-amber-400 to-orange-500' },
    { name: 'Noe Tedoradze', rating: 5, en: 'Amazing variety...', ge: 'გასაოცარი მრავალფეროვნება...', avatar: 'N', color: 'from-violet-400 to-purple-600' },
  ]

  return (
    <div className="overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl">
          <motion.div variants={fadeUp} className="mb-6 flex justify-center">
            <span className="glow-badge"><Sparkles className="h-4 w-4" /> {t('Tbilisi\'s Magical Toy Store', 'თბილისის ჯადოსნური სათამაშო მაღაზია')}</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-6xl font-black text-gray-900 dark:text-white md:text-8xl">
            <span className="block">{t('Magic', 'ჯადო')}</span>
            <span className="block bg-gradient-to-r from-fuchsia-600 to-rose-500 bg-clip-text text-transparent">ალადინი</span>
          </motion.h1>

          <motion.div variants={fadeUp} className="mt-10 flex gap-4 justify-center">
            <Link href="/shop" className="btn-primary">{t('Shop Now', 'ახლავე შეიძინე')}</Link>
          </motion.div>
        </motion.div>
      </section>

      {/* INFO SECTION */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl grid gap-6 md:grid-cols-3">
          {[
            { icon: MapPin, title: 'Our Location', ge: 'ჩვენი მდებარეობა' },
            { icon: Clock, title: 'Opening Hours', ge: 'სამუშაო საათები' },
            { icon: Phone, title: 'Contact Us', ge: 'დაგვიკავშირდი' }
          ].map((item, i) => (
            <ScrollReveal key={i} custom={i}>
              <div className="card">
                <item.icon className="h-8 w-8 text-pink-600" />
                <h3 className="text-xl font-bold mt-4">{t(item.title, item.ge)}</h3>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.map((rev, i) => (
              <ScrollReveal key={i} custom={i}>
                <div className="card">
                  <p className="text-gray-600 dark:text-gray-400">"{t(rev.en, rev.ge)}"</p>
                  <p className="font-bold mt-4">{rev.name}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
