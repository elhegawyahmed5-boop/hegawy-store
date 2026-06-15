import { ProductForm } from "@/components/ProductForm"

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Product</h1>
      <div className="max-w-2xl">
        <ProductForm />
      </div>
    </div>
  )
}
