import { notFound } from "next/navigation"
import { getProduct } from "@/lib/actions/products"
import { ProductForm } from "@/components/ProductForm"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Product</h1>
      <div className="max-w-2xl">
        <ProductForm product={product} />
      </div>
    </div>
  )
}
