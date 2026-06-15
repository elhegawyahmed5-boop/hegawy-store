import { Store } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <Store className="w-6 h-6" />
              Hegawy Store
            </div>
            <p className="text-sm">Your premium online shopping destination. Quality products, best prices.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/products" className="hover:text-white transition">Products</a></li>
              <li><a href="/cart" className="hover:text-white transition">Cart</a></li>
              <li><a href="/orders" className="hover:text-white transition">Orders</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: info@hegawystores.com</li>
              <li>Phone: +20 123 456 7890</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} Hegawy Store. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
