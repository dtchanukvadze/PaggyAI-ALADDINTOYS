'use client'

import { useState, useEffect, ReactNode } from 'react'
import { LangProvider } from './CartProvider'

export function LangProviderWrapper({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<'en' | 'ge'>('en')

  useEffect(() => {
    const saved = localStorage.getItem('aladdin-lang') as 'en' | 'ge' | null
    if (saved) setLangState(saved)
  }, [])

  const setLang = (l: 'en' | 'ge') => {
    setLangState(l)
    localStorage.setItem('aladdin-lang', l)
  }

  return (
    <LangProvider lang={lang} setLang={setLang}>
      {children}
    </LangProvider>
  )
}
