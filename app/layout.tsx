import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gift Card Demo',
  description: 'Figma-matched gift card redemption page demo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
