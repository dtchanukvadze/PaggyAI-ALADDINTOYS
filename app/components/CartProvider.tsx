'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Cart Logic ──────────────────────────────────────────────────────────────
export interface CartItem {
  id: string
  name: string
  nameGe: string
  price: number
  image: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.id === item.id)
        if (existing) return { items: state.items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) }
        return { items: [...state.items, { ...item, quantity: 1 }] }
      }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) return get().removeItem(id)
        set((state) => ({ items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)) }))
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'aladdin-cart' }
  )
)

// 🟢 Custom Hook to read the cart safely without Next.js Hydration errors
export function useHydratedCart() {
  const store = useCartStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated ? store : {
    items: [],
    addItem: () => {},
    removeItem: () => {},
    updateQuantity: () => {},
    clearCart: () => {},
    totalItems: () => 0,
    totalPrice: () => 0
  }
}

// ─── Language Logic ──────────────────────────────────────────────────────────
interface LangContextType {
  lang: 'en' | 'ge'
  setLang: (lang: 'en' | 'ge') => void
  t: (en: string, ge: string) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: (en) => en,
})

// 🟢 Renamed to fit both contexts cleanly
export function CartAndLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<'en' | 'ge'>('en')

  useEffect(() => {
    const saved = localStorage.getItem('aladdin-lang') as 'en' | 'ge'
    if (saved) setLangState(saved)
  }, [])

  const setLang = (newLang: 'en' | 'ge') => {
    setLangState(newLang)
    localStorage.setItem('aladdin-lang', newLang)
  }

  const t = (en: string, ge: string) => (lang === 'ge' ? ge : en)

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)