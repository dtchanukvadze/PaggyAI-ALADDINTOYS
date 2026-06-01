'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider 
      {...props} 
      // 🟢 Fixes the React 19 / Next.js 16 false-positive script warning
      scriptProps={{ type: "application/json" } as any} 
    >
      {children}
    </NextThemesProvider>
  )
}