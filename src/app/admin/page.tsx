import { prisma } from "@/lib/db"
import { Package, ShoppingCart, DollarSign, Users } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default async function AdminDashboard() {
  const [productCount, orderCount, totalRevenue, userCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.user.count(),
  ])

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  })

  const stats = [
    { label: "Total Products", value: productCount.toString(), icon: Package, color: "bg-blue-500" },
    { label: "Total Orders", value: orderCount.toString(), icon: ShoppingCart, color: "bg-green-500" },
    { label: "Revenue", value: formatPrice(totalRevenue._sum.total ?? 0), icon: DollarSign, color: "bg-purple-500" },
    { label: "Users", value: userCount.toString(), icon: Users, color: "bg-orange-500" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentOrders.length > 0 ? (
            recentOrders.map((order: { id: string; total: number; status: string; createdAt: Date; user: { name: string | null } }) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-500">{order.user.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "shipped"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-sm text-gray-400">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
