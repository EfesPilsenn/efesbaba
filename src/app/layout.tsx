import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Modern Todo List',
  description: 'Modern ve şık bir todo list uygulaması',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-gradient-to-br from-gray-900 to-black min-h-screen`}>
        {children}
      </body>
    </html>
  )
} 