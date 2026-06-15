import { notFound } from "next/navigation"
import { getProduct } from "@/lib/actions/products"
import { formatPrice } from "@/lib/utils"
import { AddToCartButton } from "@/components/AddToCartButton"
import { auth } from "@/lib/auth"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  const session = await auth()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">
            {product.category}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
          <p className="text-4xl font-bold text-gray-900 mt-4">{formatPrice(product.price)}</p>

          <div className="mt-2">
            {product.stock > 0 ? (
              <span className="text-green-600 text-sm font-medium">In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-500 text-sm font-medium">Out of Stock</span>
            )}
          </div>

          <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>

          {session?.user ? (
            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>
          ) : (
            <div className="mt-8 p-4 bg-blue-50 rounded-xl">
              <p className="text-blue-700 text-sm">
                Please sign in to add items to your cart.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
