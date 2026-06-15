import type { Metadata } from "next"
import { Inter, Cairo } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/SessionProvider"
import { CartProvider } from "@/lib/cart-context"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Ahmed Elhegawy | E-Commerce Developer",
  description: "نصنع مستقبل التجارة الرقمية. نطور متاجر ومواقع إلكترونية ذكية بالذكاء الاصطناعي",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" className={`${inter.variable} ${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        <SessionProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
