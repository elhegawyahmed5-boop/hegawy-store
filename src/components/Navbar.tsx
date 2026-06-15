"use client"

import Link from "next/link"
import { useState } from "react"
import { ShoppingCart, Menu, X, Store, LogOut } from "lucide-react"
import { useSession } from "@/lib/use-session"
import { googleSignIn, logOut } from "@/lib/actions/auth"

export function Navbar() {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <Store className="w-6 h-6" />
            Hegawy Store
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-gray-600 hover:text-gray-900 transition">
              Products
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-gray-900 transition relative">
              <ShoppingCart className="w-5 h-5" />
            </Link>
            {status === "authenticated" ? (
              <>
                {(session.user as { role?: string }).role === "admin" && (
                  <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition">
                    Dashboard
                  </Link>
                )}
                <Link href="/orders" className="text-gray-600 hover:text-gray-900 transition">
                  Orders
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{session.user.name}</span>
                  <form action={logOut}>
                    <button type="submit" className="text-gray-400 hover:text-red-500 transition">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <form action={googleSignIn}>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  Sign In
                </button>
              </form>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link href="/products" className="block text-gray-600" onClick={() => setMenuOpen(false)}>
              Products
            </Link>
            <Link href="/cart" className="block text-gray-600" onClick={() => setMenuOpen(false)}>
              Cart
            </Link>
            {status === "authenticated" ? (
              <>
                <Link href="/orders" className="block text-gray-600" onClick={() => setMenuOpen(false)}>
                  Orders
                </Link>
                {(session.user as { role?: string }).role === "admin" && (
                  <Link href="/admin" className="block text-gray-600" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                )}
                <form action={logOut}>
                  <button type="submit" className="text-red-500">Sign Out</button>
                </form>
              </>
            ) : (
              <form action={googleSignIn}>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                  Sign In
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
