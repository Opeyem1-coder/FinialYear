import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Urbanist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
})

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: '--font-urbanist',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'University Portal',
  description: 'Secure academic communication platform for students, lecturers, parents, and administrators',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e40af',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${urbanist.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
        <Analytics />
      </body>
    </html>
  )
}
