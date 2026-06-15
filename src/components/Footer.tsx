import Image from "next/image"
import { MessageCircle, Globe } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-4 justify-center md:justify-end">
              <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded" />
              Elhegawy
            </div>
            <p className="text-sm leading-relaxed">
              مطور متاجر إلكترونية محترف. أحول أفكارك إلى متجر رقمي مبهر بأحدث التقنيات.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#projects" className="hover:text-white transition">مشاريعي</a></li>
              <li><a href="#contact" className="hover:text-white transition">تواصل معي</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">تواصل</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://wa.me/201080036539" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 justify-center md:justify-end hover:text-white transition">
                <MessageCircle className="w-4 h-4 text-green-400" /> 01080036539
              </a></li>
              <li><a href="https://www.facebook.com/profile.php?id=61590727920658" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 justify-center md:justify-end hover:text-white transition">
                <Globe className="w-4 h-4 text-blue-400" /> فيسبوك</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} Ahmed Elhegawy. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
