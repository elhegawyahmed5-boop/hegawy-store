import { getProducts } from "@/lib/actions/products"
import { ProductCard } from "@/components/ProductCard"

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof getProducts>> = []
  try {
    products = await getProducts()
  } catch {
    // DB not available during build
  }

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">All Products</h1>
        <p className="text-gray-500 mt-2">Browse our complete collection</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href="/products"
          className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium"
        >
          All
        </a>
        {categories.map((cat) => (
          <a
            key={cat}
            href={`/products?category=${cat}`}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition"
          >
            {cat}
          </a>
        ))}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-gray-400 text-lg">No products available yet.</p>
        </div>
      )}
    </div>
  )
}
