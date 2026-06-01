import type { Metadata } from 'next'
import { Noto_Sans_Georgian, Nunito } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Navbar } from '@/components/Navbar'
import { FloatingButtons } from '@/components/FloatingButtons'
// 🟢 Import the exact component name exported from your file
import { CartAndLangProvider } from '@/components/CartProvider' 

// ─── Fonts ────────────────────────────────────────────────────────────────────

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ['georgian', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
})

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'ალადინი • Toy Store Aladdin — Tbilisi',
  description: 'Premium toy store in Tbilisi, Georgia. Magical toys for every child. In-store shopping, pick-up and delivery available.',
  keywords: ['toy store', 'tbilisi', 'toys', 'kids', 'ალადინი', 'სათამაშო'],
  openGraph: {
    title: 'ალადინი • Toy Store Aladdin',
    description: 'Premium toy store in Tbilisi, Georgia',
    locale: 'en_US',
    type: 'website',
  },
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${notoSansGeorgian.variable} ${nunito.variable} font-body antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          
          <CartAndLangProvider>
            {/* Background gradient blob — decorative */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-fuchsia-200/30 blur-[120px] dark:bg-fuchsia-900/20" />
              <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-amber-200/30 blur-[120px] dark:bg-amber-900/10" />
            </div>

            <Navbar />

            <main className="min-h-screen bg-rose-50/40 dark:bg-gray-950">
              {children}
            </main>

            <FloatingButtons />

            {/* Footer */}
            <footer className="border-t border-gray-100 bg-white/80 py-8 text-center backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} ალადინი • Toy Store Aladdin — Tbilisi, Georgia
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
                48 Adam Mitskevichi St, Tbilisi &nbsp;·&nbsp; +995 599 02 17 44
              </p>
            </footer>
          </CartAndLangProvider>

        </ThemeProvider>
      </body>
    </html>
  )
}
