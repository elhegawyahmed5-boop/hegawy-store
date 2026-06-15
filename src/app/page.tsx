import Link from "next/link"
import { ArrowRight, ShoppingBag, Sparkles, Truck, Shield } from "lucide-react"
import { getProducts } from "@/lib/actions/products"
import { ProductCard } from "@/components/ProductCard"

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof getProducts>> = []
  try {
    products = await getProducts()
  } catch {
    // DB not available during build
  }
  const featured = products.slice(0, 4)

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Your Premium Shopping Destination
            </h1>
            <p className="mt-6 text-lg md:text-xl text-blue-100 max-w-xl">
              Discover amazing products at unbeatable prices. Fast delivery, secure checkout, and exceptional quality.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition"
              >
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition"
              >
                Explore Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <Truck className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Free Shipping</h3>
                <p className="text-sm text-gray-500 mt-1">Free delivery on all orders over $50</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-500 mt-1">100% secure checkout & payment protection</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Sparkles className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Premium Quality</h3>
                <p className="text-sm text-gray-500 mt-1">Carefully curated products, top quality only</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-500 mt-2">Handpicked just for you</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-semibold text-gray-500">No products yet</h3>
              <p className="text-sm text-gray-400 mt-1">Check back soon for new arrivals</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold"
            >
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to start shopping?</h2>
          <p className="mt-4 text-blue-100 max-w-lg mx-auto">
            Browse our collection of premium products and find exactly what you need.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition"
          >
            Browse Products
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
