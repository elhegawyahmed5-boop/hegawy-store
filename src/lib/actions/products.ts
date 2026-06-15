"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  image: z.string().min(1, "Image URL is required"),
  category: z.string().min(1, "Category is required"),
  stock: z.coerce.number().int().nonnegative("Stock must be 0 or more"),
})

export async function getProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: "desc" } })
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({ where: { id } })
}

export async function createProduct(formData: FormData) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized")
  }

  const data = productSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    image: formData.get("image"),
    category: formData.get("category"),
    stock: formData.get("stock"),
  })

  await prisma.product.create({ data })
  revalidatePath("/admin/products")
  revalidatePath("/products")
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized")
  }

  const data = productSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    image: formData.get("image"),
    category: formData.get("category"),
    stock: formData.get("stock"),
  })

  await prisma.product.update({ where: { id }, data })
  revalidatePath("/admin/products")
  revalidatePath("/products")
}

export async function deleteProduct(id: string) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized")
  }

  await prisma.product.delete({ where: { id } })
  revalidatePath("/admin/products")
  revalidatePath("/products")
}
