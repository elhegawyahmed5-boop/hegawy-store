"use client"

import { useRouter } from "next/navigation"
import { updateOrderStatus } from "@/lib/actions/orders"

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]

export function OrderActions({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const router = useRouter()

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    if (newStatus === currentStatus) return
    await updateOrderStatus(orderId, newStatus)
    router.refresh()
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      className={`text-xs px-2 py-1 rounded-full border font-medium outline-none cursor-pointer ${
        currentStatus === "delivered"
          ? "bg-green-100 text-green-700 border-green-200"
          : currentStatus === "shipped"
            ? "bg-blue-100 text-blue-700 border-blue-200"
            : currentStatus === "cancelled"
              ? "bg-red-100 text-red-700 border-red-200"
              : "bg-yellow-100 text-yellow-700 border-yellow-200"
      }`}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  )
}
