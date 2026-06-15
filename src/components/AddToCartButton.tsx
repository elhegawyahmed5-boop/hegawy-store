"use client"

import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/types"

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()

  return (
    <button
      onClick={() => addItem({ ...product, quantity: 1 })}
      disabled={product.stock === 0}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      {product.stock > 0 ? `Add to Cart - ${formatPrice(product.price)}` : "Out of Stock"}
    </button>
  )
}
