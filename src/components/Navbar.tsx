"use client"

import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: "#projects", label: "مشاريعي" },
    { href: "#contact", label: "تواصل معي" },
  ]

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 font-bold text-xl text-gray-900">
            <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-lg" />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Elhegawy
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#contact"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              {"> اطلب متجرك الآن"}
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#contact"
              className="block text-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold"
              onClick={() => setMenuOpen(false)}
            >
              اطلب متجرك الآن
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
