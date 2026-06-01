'use client'

import { motion, useInView, Variants } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import {
  MapPin, Clock, Phone, ShoppingBag, Package, Truck,
  Star, Sparkles, ArrowRight, Gift, Heart, ShieldCheck, Quote
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

const floatAnimation = {
  y: [-10, 10, -10],
  rotate: [-2, 2, -2],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut" as const // 🟢 Added 'as const' to fix the TS error
  }
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
    { 
      name: 'Tamari Buchukuri', 
      role: t('Mother of 2', '2 შვილის დედა'),
      rating: 5, 
      en: 'Incredible selection! Found the perfect LEGO set for my son. Delivery was fast and the packaging was lovely.', 
      ge: 'წარმოუდგენელი არჩევანი! ჩემი შვილისთვის საუკეთესო LEGO ვიპოვე. მიტანა სწრაფი იყო და შეფუთვა ძალიან ლამაზი.', 
      avatar: 'T', 
      color: 'from-rose-400 to-pink-600' 
    },
    { 
      name: 'Bakuri Bakuradze', 
      role: t('Regular Customer', 'ერთგული მომხმარებელი'),
      rating: 5, 
      en: 'The quality of wooden toys is exceptional. Customer service is always helpful and friendly.', 
      ge: 'ხის სათამაშოების ხარისხი გამორჩეულია. მომსახურე პერსონალი ყოველთვის მზადაა დასახმარებლად.', 
      avatar: 'B', 
      color: 'from-amber-400 to-orange-500' 
    },
    { 
      name: 'Noe Tedoradze', 
      role: t('Gift Buyer', 'საჩუქრის მყიდველი'),
      rating: 5, 
      en: 'Amazing variety of educational toys. Bought a science kit for my niece and she absolutely loves it!', 
      ge: 'სასწავლო სათამაშოების გასაოცარი მრავალფეროვნებაა. დისშვილისთვის ვიყიდე მეცნიერების ნაკრები და აღფრთოვანებულია!', 
      avatar: 'N', 
      color: 'from-violet-400 to-purple-600' 
    },
  ]

  const features = [
    { icon: Truck, titleEn: 'Fast Delivery', titleGe: 'სწრაფი მიტანა', descEn: 'Anywhere in Georgia', descGe: 'საქართველოს მასშტაბით' },
    { icon: ShieldCheck, titleEn: 'Premium Quality', titleGe: 'პრემიუმ ხარისხი', descEn: 'Safe & certified toys', descGe: 'უსაფრთხო და სერტიფიცირებული' },
    { icon: Gift, titleEn: 'Gift Wrapping', titleGe: 'სასაჩუქრე შეფუთვა', descEn: 'Free for all orders', descGe: 'უფასო ყველა შეკვეთაზე' },
    { icon: Heart, titleEn: 'Made with Love', titleGe: 'სიყვარულით', descEn: 'Hand-picked selection', descGe: 'რჩეული კოლექცია' },
  ]

  return (
    <div className="overflow-x-hidden">
      
      {/* ─── HERO SECTION ──────────────────────────────────────────────── */}
      <section className="relative flex min-h-[90vh] items-center pt-20">
        <div className="mx-auto max-w-7xl px-4 w-full grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center lg:text-left z-10">
            <motion.div variants={fadeUp} className="mb-6 flex justify-center lg:justify-start">
              <span className="glow-badge">
                <Sparkles className="h-4 w-4" /> 
                {t('Welcome to Aladdin', 'მოგესალმებით ალადინში')}
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-6xl font-black text-gray-900 dark:text-white md:text-7xl lg:text-8xl leading-tight">
              <span className="block">{t('Where Magic', 'სადაც იწყება')}</span>
              <span className="block bg-gradient-to-r from-fuchsia-600 via-pink-500 to-rose-500 bg-clip-text text-transparent pb-2">
                {t('Begins', 'ჯადოსნობა')}
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0">
              {t(
                'Discover a world of imagination. From classic wooden trains to modern educational kits, we have the perfect toy for every child.',
                'აღმოაჩინე ფანტაზიის სამყარო. კლასიკური ხის სათამაშოებიდან თანამედროვე სასწავლო ნაკრებებამდე — ჩვენთან ყველა ბავშვისთვის მოიძებნება იდეალური საჩუქარი.'
              )}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 pb-15 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/shop" className="btn-primary py-4 px-8 text-lg">
                <ShoppingBag className="h-5 w-5" />
                {t('Shop Collection', 'კოლექციის ნახვა')}
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Visuals (Floating Cards) */}
          <div className="hidden lg:flex relative h-[600px] items-center justify-center">
            {/* Background blur circle */}
            <div className="absolute w-[400px] h-[400px] bg-pink-300/30 dark:bg-pink-900/20 rounded-full blur-[80px]" />
            
            <motion.div animate={floatAnimation} className="absolute z-20 -top-10 left-10">
              <div className="card !p-4 flex items-center gap-4 rotate-[-6deg]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl shadow-inner">🧸</div>
                <div>
                  <p className="font-bold text-sm">{t('Plush Toys', 'პლუშები')}</p>
                  <p className="text-xs text-gray-500">Premium Quality</p>
                </div>
              </div>
            </motion.div>

            {/* 🟢 Added 'as const' to fix the TS error here too */}
            <motion.div animate={{...floatAnimation, transition: { duration: 7, repeat: Infinity, ease: "easeInOut" as const }}} className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="card !p-8 border-2 border-pink-100 dark:border-pink-900/50 scale-125 shadow-2xl shadow-pink-500/20">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-fuchsia-400 to-pink-600 flex items-center justify-center text-7xl shadow-inner">🏰</div>
              </div>
            </motion.div>

            {/* 🟢 Added 'as const' to fix the TS error here too */}
            <motion.div animate={{...floatAnimation, transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const }}} className="absolute z-20 bottom-10 right-10">
              <div className="card !p-4 flex items-center gap-4 rotate-[8deg]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-4xl shadow-inner">🧩</div>
                <div>
                  <p className="font-bold text-sm">{t('Educational', 'სასწავლო')}</p>
                  <p className="text-xs text-gray-500">Smart Kids</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES BANNER ───────────────────────────────────────────── */}
      <section className="py-12 border-y border-gray-100 dark:border-gray-800/50 bg-white/50 dark:bg-gray-950/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feat, i) => (
            <ScrollReveal key={i} custom={i} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-4">
                <feat.icon className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">{t(feat.titleEn, feat.titleGe)}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t(feat.descEn, feat.descGe)}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ─── CATEGORIES TEASER ─────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="section-heading mb-4">{t('Explore by Category', 'აღმოაჩინე კატეგორიები')}</h2>
              <p className="text-gray-600 dark:text-gray-400">{t('Find exactly what they are dreaming of', 'იპოვე ზუსტად ის, რაზეც ოცნებობენ')}</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Building & LEGO', ge: 'კონსტრუქტორები', color: 'from-orange-400 to-amber-500', icon: '🧱' },
              { title: 'Dolls & Houses', ge: 'თოჯინები & სახლები', color: 'from-fuchsia-400 to-pink-500', icon: '👸' },
              { title: 'Vehicles & RC', ge: 'მანქანები', color: 'from-blue-400 to-indigo-500', icon: '🏎️' }
            ].map((cat, i) => (
              <ScrollReveal key={i} custom={i}>
                <Link href="/shop" className="group relative block overflow-hidden rounded-3xl aspect-[4/3]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90 transition-transform duration-500 group-hover:scale-105`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                    <span className="text-7xl mb-4 drop-shadow-md">{cat.icon}</span>
                    <h3 className="text-2xl font-bold font-display">{t(cat.title, cat.ge)}</h3>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                      {t('View All', 'ნახვა')} <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REVIEWS SECTION ───────────────────────────────────────────── */}
      <section className="py-24 bg-rose-50/50 dark:bg-gray-900/30">
        <div className="mx-auto max-w-7xl px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="glow-badge mb-4 inline-flex"><Heart className="h-4 w-4" /> {t('Testimonials', 'შეფასებები')}</span>
              <h2 className="section-heading">{t('Loved by Parents', 'მშობლების რჩეული')}</h2>
            </div>
          </ScrollReveal>

          <div className="grid gap-8 md:grid-cols-3">
            {reviews.map((rev, i) => (
              <ScrollReveal key={i} custom={i}>
                <div className="card relative h-full flex flex-col group hover:-translate-y-2 transition-transform duration-300">
                  <Quote className="absolute top-6 right-6 h-12 w-12 text-pink-100 dark:text-pink-900/30 -z-10 transform rotate-12 group-hover:scale-110 transition-transform" />
                  
                  <div className="flex gap-1 mb-6">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-8 italic flex-1 leading-relaxed">
                    "{t(rev.en, rev.ge)}"
                  </p>
                  
                  <div className="flex items-center gap-4 mt-auto">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${rev.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                      {rev.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{rev.name}</h4>
                      <p className="text-xs text-gray-500">{rev.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MAP & CONTACT SECTION ─────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="card !p-2 flex flex-col lg:flex-row gap-2 overflow-hidden shadow-2xl shadow-pink-900/5 border-0 bg-white dark:bg-gray-900">
            
            {/* Left: Contact Info */}
            <div className="lg:w-1/3 p-10 flex flex-col justify-center bg-rose-50/50 dark:bg-gray-800/50 rounded-[22px]">
              <h2 className="section-heading mb-8 !text-3xl">{t('Visit Our Store', 'გვეწვიეთ მაღაზიაში')}</h2>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{t('Address', 'მისამართი')}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">48 Adam Mitskevichi St<br/>Tbilisi, Georgia</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
                    <Clock className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{t('Hours', 'სამუშაო საათები')}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Mon - Sun: 10:00 - 21:00</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{t('Contact', 'კონტაქტი')}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">+995 599 02 17 44</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Map Embed */}
            <div className="lg:w-2/3 h-[400px] lg:h-auto min-h-[400px] rounded-[22px] overflow-hidden relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.718012056965!2d44.76451000000001!3d41.72666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x404472d4b9678ab3%3A0x60012e11894a86b9!2s48%20Adam%20Mitskevichi%20St%2C%20Tbilisi!5e0!3m2!1sen!2sge!4v1700000000000!5m2!1sen!2sge" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale-[20%] contrast-[1.1] opacity-90 dark:invert dark:hue-rotate-180 dark:opacity-80"
              />
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}