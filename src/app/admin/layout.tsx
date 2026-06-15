import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { LayoutDashboard, Package, ShoppingCart, Store } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect("/")
  }

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  ]

  return (
    <div className="flex min-h-[80vh]">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
          <Store className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-gray-900">Admin Panel</span>
        </div>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-8 overflow-auto">{children}</div>
    </div>
  )
}
