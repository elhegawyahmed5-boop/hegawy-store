"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createOrder(items: { productId: string; quantity: number }[]) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("You must be signed in")

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  })

  let total = 0
  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product) throw new Error(`Product ${item.productId} not found`)
    if (product.stock < item.quantity) throw new Error(`Not enough stock for ${product.name}`)
    total += product.price * item.quantity
    return { productId: item.productId, quantity: item.quantity, price: product.price }
  })

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      total,
      items: { create: orderItems },
    },
  })

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: product.stock - item.quantity },
    })
  }

  revalidatePath("/orders")
  return order
}

export async function getUserOrders() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAllOrders() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized")
  }

  return prisma.order.findMany({
    include: { items: { include: { product: true } }, user: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized")
  }

  await prisma.order.update({ where: { id: orderId }, data: { status } })
  revalidatePath("/admin/orders")
}
