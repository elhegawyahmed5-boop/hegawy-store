"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Code2, Store, Smartphone, Palette, Globe, ArrowUpRight, ExternalLink, ChevronRight, Layers, ShoppingBag, Cpu, Users, Star, Quote, MapPin, Mail, Sparkles, Zap, BarChart3, ShieldCheck, TrendingUp, MessageCircle } from "lucide-react"
import Link from "next/link"

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.unobserve(el) } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, revealed }
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, revealed } = useReveal()
  return (
    <div
      ref={ref}
      className={`${className}`}
      style={{
        opacity: 0,
        transform: "translateY(40px)",
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        ...(revealed ? { opacity: 1, transform: "translateY(0)" } : {}),
      }}
    >
      {children}
    </div>
  )
}

function RevealLeft({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, revealed } = useReveal()
  return (
    <div
      ref={ref}
      className={`${className}`}
      style={{
        opacity: 0,
        transform: "translateX(-40px)",
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        ...(revealed ? { opacity: 1, transform: "translateX(0)" } : {}),
      }}
    >
      {children}
    </div>
  )
}

function RevealRight({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, revealed } = useReveal()
  return (
    <div
      ref={ref}
      className={`${className}`}
      style={{
        opacity: 0,
        transform: "translateX(40px)",
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        ...(revealed ? { opacity: 1, transform: "translateX(0)" } : {}),
      }}
    >
      {children}
    </div>
  )
}

function RevealScale({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, revealed } = useReveal()
  return (
    <div
      ref={ref}
      className={`${className}`}
      style={{
        opacity: 0,
        transform: "scale(0.9)",
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        ...(revealed ? { opacity: 1, transform: "scale(1)" } : {}),
      }}
    >
      {children}
    </div>
  )
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, revealed } = useReveal()

  useEffect(() => {
    if (!revealed) return
    let current = 0
    const increment = Math.ceil(target / 60)
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { current = target; clearInterval(timer) }
      setCount(current)
    }, 25)
    return () => clearInterval(timer)
  }, [revealed, target])

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  )
}

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-indigo-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: "-2s" }} />
      <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-2/3 right-1/4 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "-1s", animationDuration: "5s" }} />
      <div className="bg-noise absolute inset-0" />
    </div>
  )
}

function SectionHeader({ arabic, english }: { arabic: string; english: string }) {
  return (
    <div className="text-center mb-16 md:mb-20">
      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
        <Sparkles className="w-4 h-4" />
        {english}
      </div>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 font-display leading-tight">
        {arabic}
      </h2>
      <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mx-auto mt-6" />
    </div>
  )
}

const projects = [
  {
    title: "Fashion Store",
    titleAr: "متجر أزياء",
    description: "متجر إلكتروني متكامل لبيع الملابس والأزياء مع واجهة عرض جذابة، سلة مشتريات، ونظام دفع آمن. يدعم اللغتين العربية والإنجليزية.",
    tags: ["Next.js", "Tailwind CSS", "Prisma", "Stripe", "Auth.js"],
    gradient: "from-pink-500 via-rose-500 to-purple-600",
    icon: ShoppingBag,
    url: "https://client-stores-platform.vercel.app",
    features: ["تصنيفات متعددة", "بحث ذكي", "معرض صور تفاعلي", "تصميم responsive", "سلة مشتريات", "دفع آمن"],
    stats: [{ label: "منتج", value: 50 }, { label: "تصنيف", value: 8 }, { label: "قسم", value: 4 }],
    color: "rose",
  },
  {
    title: "Hardware Hub",
    titleAr: "متجر هاردوير",
    description: "منصة multi-vendor متخصصة في بيع قطع الهاردوير، تسمح للبائعين المتعددين بإدارة متاجرهم الخاصة مع نظام عمولة وإدارة مركزية متكاملة.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Multi-Vendor", "Dashboard"],
    gradient: "from-cyan-500 via-blue-500 to-indigo-600",
    icon: Cpu,
    url: "https://indigo-duck-840684.hostingersite.com/",
    features: ["بائعين متعددين", "لوحة تحكم متقدمة", "نظام عمولات", "إدارة المخزون", "تقارير مبيعات", "API متكامل"],
    stats: [{ label: "بائع", value: 10 }, { label: "منتج", value: 200 }, { label: "مستخدم", value: 5 }],
    color: "cyan",
  },
]

const skills = [
  { name: "Next.js", icon: Globe, desc: "React & Full-Stack", color: "from-gray-900 to-gray-700" },
  { name: "UI/UX", icon: Palette, desc: "Tailwind CSS", color: "from-blue-500 to-cyan-400" },
  { name: "Database", icon: Layers, desc: "Prisma & SQL", color: "from-indigo-600 to-purple-600" },
  { name: "Responsive", icon: Smartphone, desc: "Mobile-First", color: "from-green-500 to-emerald-500" },
  { name: "E-Commerce", icon: Store, desc: "Multi-Vendor", color: "from-orange-500 to-red-500" },
  { name: "Clean Code", icon: Code2, desc: "TypeScript", color: "from-blue-600 to-blue-800" },
]

const testimonials = [
  { text: "احترافية في العمل ودقة في التنفيذ. المتجر تجاوز توقعاتي تماماً وساعدني في زيادة مبيعاتي بشكل كبير.", author: "أحمد علي", role: "صاحب متجر أزياء", rating: 5 },
  { text: "منصة متكاملة بإدارة بسيطة. نظام البائعين المتعددين سهل عليّ التوسع في نشاطي التجاري.", author: "محمد حسن", role: "تاجر هاردوير", rating: 5 },
]

export default function PortfolioPage() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <StatsSection />
      <SkillsSection />
      <TestimonialsSection />
      <CTASection />
      <ContactSection />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 overflow-hidden">
      <FloatingOrbs />

      <div className="absolute inset-0 bg-grid" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div
              className="inline-flex items-center gap-2 glass text-blue-200 px-4 py-2 rounded-full text-sm border border-white/10"
              style={{
                opacity: 0,
                animation: "fadeIn 0.7s ease-out 0.2s forwards",
              }}
            >
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">E-Commerce Developer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>

            <div
              style={{
                opacity: 0,
                animation: "fadeIn 0.7s ease-out 0.4s forwards",
              }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] font-display">
                Ahmed
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-[length:200%_auto] animate-shimmer">
                  Elhegawy
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-200/80 mt-6 leading-relaxed font-display">
                أحول أفكار المتاجر الإلكترونية إلى واقع رقمي مبهر
              </p>
            </div>

            <p
              className="text-lg text-blue-300/60 max-w-xl leading-relaxed"
              style={{
                opacity: 0,
                animation: "fadeIn 0.7s ease-out 0.6s forwards",
              }}
            >
              مطور متاجر إلكترونية محترف. أبني متاجر متكاملة بأحدث التقنيات،
              من متاجر الأزياء إلى منصات multi-vendor المعقدة.
            </p>

            <div
              className="flex flex-wrap gap-4"
              style={{
                opacity: 0,
                animation: "fadeIn 0.7s ease-out 0.8s forwards",
              }}
            >
              <Link
                href="#projects"
                className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3.5 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  استعرض أعمالي
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </Link>
              <Link
                href="#contact"
                className="group inline-flex items-center gap-2 border-2 border-white/20 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/10 hover:border-white/30 transition-all"
              >
                تواصل معي
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </Link>
            </div>

            <div
              className="flex items-center gap-8 pt-4"
              style={{
                opacity: 0,
                animation: "fadeIn 0.7s ease-out 1s forwards",
              }}
            >
              {[
                { label: "3+", sub: "سنوات خبرة" },
                { label: "15+", sub: "مشروع مكتمل" },
                { label: "10+", sub: "عميل سعيد" },
              ].map((stat) => (
                <div key={stat.label} className="group">
                  <div className="text-3xl font-bold text-white font-display">{stat.label}</div>
                  <div className="text-sm text-blue-300/50 group-hover:text-blue-300/80 transition-colors">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="hidden lg:flex items-center justify-center"
            style={{
              opacity: 0,
              animation: "blurIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards",
            }}
          >
            <div className="relative">
              <div className="w-80 h-80 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl rotate-6 opacity-20 blur-2xl absolute inset-0 animate-float-slow" />
              <div className="relative w-72 h-72 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-sm flex items-center justify-center animate-morph">
                <div className="text-center p-8">
                  <div className="relative">
                    <Code2 className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-float" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-blue-400/10 rounded-full blur-xl animate-pulse-slow" />
                    </div>
                  </div>
                  <div className="text-white font-semibold text-lg font-display">&lt;developer /&gt;</div>
                  <div className="text-blue-300/60 text-sm mt-2">Building the future of e-commerce</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-float" style={{ animationDelay: "-1.5s" }}>
                <Store className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: "-3s" }}>
                <Zap className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  const services = [
    { icon: Globe, title: "تطوير متاجر إلكترونية", desc: "متاجر كاملة بأعلى معايير الجودة والأداء" },
    { icon: Users, title: "منصات Multi-Vendor", desc: "أنظمة بائعين متعددين بإدارة مركزية متكاملة" },
    { icon: Palette, title: "تصميم عصري", desc: "واجهات جذابة وتجربة مستخدم سلسة وآسرة" },
    { icon: BarChart3, title: "لوحات تحكم", desc: "إحصائيات وتقارير متقدمة لمتابعة المبيعات" },
    { icon: ShieldCheck, title: "حماية وأمان", desc: "أنظمة دفع آمنة وحماية متكاملة للبيانات" },
    { icon: TrendingUp, title: "SEO & التسويق", desc: "تحسين محركات البحث لزيادة المبيعات" },
  ]

  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <RevealLeft className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              About Me
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 font-display leading-tight">
              من أنا؟
              <span className="block text-blue-600 text-2xl font-normal mt-3 font-sans">Who Am I?</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
            <p className="text-lg text-gray-600 leading-relaxed">
              أحمد الحجاوي، مطور متاجر إلكترونية متخصص في بناء منصات تجارة رقمية متكاملة.
              أعمل مع رواد الأعمال والعلامات التجارية لتحويل أفكارهم إلى متاجر إلكترونية
              احترافية تجذب العملاء وتزيد المبيعات.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              أستخدم أحدث التقنيات مثل Next.js و TypeScript لبناء متاجر سريعة وآمنة
              وسهلة الإدارة. أؤمن بأن المتجر الإلكتروني الناجح هو الذي يجمع بين التصميم
              الجذاب والأداء القوي وتجربة المستخدم السلسة.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {["متاجر أزياء", "منصات Multi-Vendor", "متاجر إلكترونية", "لوحات تحكم", "API متكامل"].map((item) => (
                <span key={item} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-100 hover:bg-blue-100 transition-colors">
                  {item}
                </span>
              ))}
            </div>
          </RevealLeft>

          <RevealRight className="relative" delay={0.15}>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 rounded-3xl p-8 border border-blue-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map(({ icon: Icon, title, desc }, i) => (
                  <div
                    key={title}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                    style={{
                      opacity: 0,
                      animation: `fadeIn 0.5s ease-out ${0.3 + i * 0.1}s forwards`,
                    }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 font-display text-sm">{title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </RevealRight>
        </div>
      </div>
    </section>
  )
}

function ProjectsSection() {
  return (
    <section id="projects" className="relative py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader arabic="مشاريعي" english="My Projects" />
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {projects.map((project, index) => {
            const Icon = project.icon
            return (
              <RevealScale key={project.title} delay={index * 0.15}>
                <div className="group relative bg-white rounded-3xl border border-gray-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden">
                  <div className={`bg-gradient-to-br ${project.gradient} p-8 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700" style={{ transitionDelay: "100ms" }} />
                    <div className="relative flex items-start justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs border border-white/10">
                          <Zap className="w-3 h-3" />
                          مشروع مميز
                        </div>
                        <h3 className="text-2xl font-bold text-white mt-4 font-display">{project.titleAr}</h3>
                        <p className="text-blue-100 text-sm font-medium">{project.title}</p>
                      </div>
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <p className="text-gray-600 leading-relaxed">{project.description}</p>

                    <div className="grid grid-cols-2 gap-3">
                      {project.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm text-gray-700 group/feat">
                          <div className="w-5 h-5 bg-blue-50 rounded-lg flex items-center justify-center group-hover/feat:bg-blue-100 transition-colors">
                            <ChevronRight className="w-3 h-3 text-blue-500" />
                          </div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      {project.stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                          <div className="text-lg font-bold text-gray-900 font-display">{stat.value}+</div>
                          <div className="text-xs text-gray-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <a
                      href={project.url}
                      target={project.url !== "#" ? "_blank" : undefined}
                      rel={project.url !== "#" ? "noopener noreferrer" : undefined}
                      className="group/btn relative w-full overflow-hidden flex items-center justify-between bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium px-6 py-3.5 rounded-xl transition-colors"
                    >
                      <span className="relative z-10">عرض التفاصيل</span>
                      <ExternalLink className="w-4 h-4 relative z-10 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
                    </a>
                  </div>
                </div>
              </RevealScale>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const stats = [
    { icon: Code2, value: 3, suffix: "+", label: "سنوات خبرة", desc: "في تطوير المتاجر" },
    { icon: ShoppingBag, value: 15, suffix: "+", label: "مشروع مكتمل", desc: "متجر ومنصة" },
    { icon: Users, value: 10, suffix: "+", label: "عميل سعيد", desc: "من رواد الأعمال" },
    { icon: Star, value: 100, suffix: "%", label: "رضا العملاء", desc: "توصيات إيجابية" },
  ]

  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1}>
              <div className="text-center group">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                  <stat.icon className="w-6 h-6 text-blue-200" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white font-display">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-blue-200 font-medium mt-1">{stat.label}</div>
                <div className="text-blue-300/60 text-sm">{stat.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function SkillsSection() {
  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader arabic="المهارات والتقنيات" english="Skills & Technologies" />
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {skills.map(({ name, icon: Icon, desc, color }, index) => (
            <RevealScale key={name} delay={index * 0.08}>
              <div className="group relative bg-gradient-to-b from-gray-50 to-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-300">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 font-display">{name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{desc}</p>
                </div>
              </div>
            </RevealScale>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 overflow-hidden">
      <FloatingOrbs />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 glass text-blue-200 px-4 py-1.5 rounded-full text-sm font-medium border border-white/10 mb-4">
              <Quote className="w-4 h-4" />
              Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-display leading-tight">
              آراء العملاء
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mx-auto mt-6" />
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <RevealScale key={i} delay={i * 0.15}>
              <div className="group glass rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-blue-400/30 mb-4" />
                <p className="text-lg text-blue-50 leading-relaxed mb-6 font-display">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{t.author}</div>
                    <div className="text-sm text-blue-200/60">{t.role}</div>
                  </div>
                </div>
              </div>
            </RevealScale>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative py-20 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <RevealScale>
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 rounded-3xl p-10 md:p-16 border border-blue-100">
            <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-6 animate-float" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display leading-tight mb-4">
              جاهز لتحويل فكرتك إلى متجر إلكتروني؟
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
              دعنا نعمل معاً لبناء متجر احترافي يناسب علامتك التجارية ويحقق أهدافك.
            </p>
            <Link
              href="#contact"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <span>تواصل معي الآن</span>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </RevealScale>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section id="contact" className="relative py-24 md:py-32 bg-gray-50 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader arabic="دعنا نبني متجرك" english="Let's Build Your Store" />
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          <RevealLeft className="space-y-6">
            <p className="text-lg text-gray-600 leading-relaxed">
              هل لديك فكرة متجر إلكتروني؟ دعنا نحولها إلى واقع.
              تواصل معي وسأعمل معك خطوة بخطوة لبناء متجر احترافي يناسب علامتك التجارية.
            </p>

            <div className="space-y-5 pt-4">
              {[
                { icon: Mail, label: "البريد الإلكتروني", value: "ahmed@elhegawy.com", href: "mailto:ahmed@elhegawy.com" },
                { icon: MessageCircle, label: "واتساب", value: "01080036539", href: "https://wa.me/201080036539" },
                { icon: Globe, label: "فيسبوك", value: "صفحة Elhegawy Store", href: "https://www.facebook.com/profile.php?id=61590727920658" },
                { icon: MapPin, label: "الموقع", value: "مصر، القاهرة" },
              ].map(({ icon: Icon, label, value, href }) => {
                const content = (
                  <div className="flex items-center gap-4 group p-4 rounded-2xl hover:bg-white transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{label}</div>
                      <div className="font-medium text-gray-900">{value}</div>
                    </div>
                  </div>
                )
                return href ? <a key={label} href={href}>{content}</a> : <div key={label}>{content}</div>
              })}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    {["أ", "م", "ح"][i - 1]}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">رد سريع</span> خلال 24 ساعة
              </div>
            </div>
          </RevealLeft>

          <RevealRight delay={0.15}>
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-blue-500/5 border border-gray-100">
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-display">الاسم</label>
                  <input
                    type="text"
                    placeholder="اسمك الكريم"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-display">البريد الإلكتروني</label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-display">الرسالة</label>
                  <textarea
                    rows={4}
                    placeholder="حدثني عن مشروعك..."
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    أرسل الرسالة
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </button>
              </form>
            </div>
          </RevealRight>
        </div>
      </div>
    </section>
  )
}
