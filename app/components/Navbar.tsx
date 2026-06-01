'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { ShoppingCart, Sun, Moon, Menu, X, Sparkles } from 'lucide-react'
import { useCartStore, useLang } from '@/components/CartProvider'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false) // Fix hydration mismatches
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t } = useLang()
  const totalItems = useCartStore((s) => s.totalItems())
  const pathname = usePathname()

  // Wait for assembly on the client-side before rendering theme toggles
  useEffect(() => {
    setMounted(true)
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    { href: '/', label: t('Home', 'მთავარი') },
    { href: '/shop', label: t('Shop', 'მაღაზია') },
    { href: '/checkout', label: t('Order', 'შეკვეთა') },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-gray-950/90 shadow-lg shadow-pink-100/50 dark:shadow-pink-900/20 backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg shadow-pink-400/40 transition-transform group-hover:scale-110">
              <Sparkles className="h-5 w-5 text-white" />
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-400 shadow-sm" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-bold text-gray-900 dark:text-white">
                ალადინი
              </div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-pink-500">
                Toy Store
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  pathname === link.href
                    ? 'text-pink-600 dark:text-pink-400'
                    : 'text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400'
                }`}
              >
                {pathname === link.href && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-pink-50 dark:bg-pink-900/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ge' : 'en')}
              className="flex h-9 w-16 items-center justify-center rounded-xl border border-gray-200 bg-white/70 text-xs font-bold text-gray-700 backdrop-blur-sm transition-all hover:border-pink-300 hover:text-pink-600 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300 dark:hover:text-pink-400"
              aria-label="Toggle language"
            >
              {lang === 'en' ? '🇬🇧 EN' : '🇬🇪 GE'}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white/70 text-gray-600 backdrop-blur-sm transition-all hover:border-pink-300 hover:text-pink-600 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300 dark:hover:text-pink-400"
              aria-label="Toggle theme"
            >
              {/* Only show the active theme icon once client metadata is safely loaded */}
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Cart */}
            <Link
              href="/checkout"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-md shadow-pink-400/30 transition-transform hover:scale-110"
              aria-label="Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <motion.div
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-gray-900"
                >
                  {totalItems}
                </motion.div>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 md:hidden dark:border-gray-700 dark:text-gray-300"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-gray-100 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95"
            >
              <div className="flex flex-col gap-1 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      pathname === link.href
                        ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}