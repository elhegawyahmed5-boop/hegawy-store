import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
  }
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  createdAt: Date
  updatedAt: Date
}
