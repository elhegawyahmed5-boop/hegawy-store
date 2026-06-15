import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const userCount = await prisma.user.count()
      if (userCount === 1) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "admin" },
        })
      }
      return true
    },
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = (user as { role?: string }).role ?? "customer"
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})
