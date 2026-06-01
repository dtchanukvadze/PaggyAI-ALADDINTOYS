'use client'

import { motion, AnimatePresence, Variants } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useState } from 'react'

const WHATSAPP_NUMBER = '995599021744'
const FACEBOOK_PAGE = 'https://www.facebook.com/messages/t/your-page-id'

// Explicitly typing variants handles Framer Motion's strict string literal requirements for 'type'
const fabVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { 
      delay: i * 0.1, 
      type: 'spring', 
      stiffness: 300, 
      damping: 20 
    },
  }),
}

export function FloatingButtons() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
      <AnimatePresence>
        {open && (
          <>
            {/* Facebook Messenger */}
            <motion.a
              custom={1}
              variants={fabVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              href={FACEBOOK_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-14 w-14 items-center justify-center rounded-full shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #0099FF, #A033FF)' }}
              title="Facebook Messenger"
            >
              {/* Messenger icon SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="h-7 w-7"
              >
                <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.919 1.422 5.524 3.652 7.25V22l3.312-1.836A10.65 10.65 0 0 0 12 20.518c5.523 0 10-4.145 10-9.259C22 6.145 17.523 2 12 2zm1.046 12.481-2.544-2.713-4.97 2.713 5.466-5.802 2.607 2.713 4.907-2.713-5.466 5.802z" />
              </svg>
            </motion.a>

            {/* WhatsApp */}
            <motion.a
              custom={0}
              variants={fabVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-2xl"
              title="WhatsApp"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="h-7 w-7"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
            </motion.a>
          </>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-700 text-white shadow-[0_8px_30px_rgba(232,0,125,0.5)] transition-shadow hover:shadow-[0_8px_40px_rgba(232,0,125,0.7)]"
        aria-label="Chat with us"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <MessageCircle className="h-7 w-7" />
        </motion.div>
      </motion.button>
    </div>
  )
}