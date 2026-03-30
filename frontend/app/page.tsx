'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, BookOpen, Users, GraduationCap, ShieldCheck, BarChart3, MessageSquare, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const user = sessionStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        if (userData.role === 'admin') router.replace('/admin/dashboard')
        else if (userData.role === 'registry') router.replace('/registry/dashboard')
        else if (userData.role === 'teacher') router.replace('/teacher/dashboard')
        else if (userData.role === 'parent') router.replace('/parent/dashboard')
        else if (userData.role === 'student') router.replace('/student/dashboard')
      } catch {}
    }
  }, [router])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  const features = [
    {
      icon: <GraduationCap className="h-7 w-7" />,
      title: 'Student Portal',
      description: 'Track grades, attendance, enrolled courses, and communicate with lecturers — all in one place.',
      color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: <BookOpen className="h-7 w-7" />,
      title: 'Lecturer Dashboard',
      description: 'Manage classes, submit grades, record attendance, and file discipline reports effortlessly.',
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
      icon: <Users className="h-7 w-7" />,
      title: 'Parent Access',
      description: "Monitor your child's academic progress, attendance records, and discipline in real time.",
      color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    },
    {
      icon: <ShieldCheck className="h-7 w-7" />,
      title: 'Registry & Admin',
      description: 'Register students, manage accounts, assign courses, and generate comprehensive reports.',
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
    {
      icon: <BarChart3 className="h-7 w-7" />,
      title: 'Academic Analytics',
      description: 'View semester-by-semester GPA trends, course performance, and attendance statistics.',
      color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    },
    {
      icon: <MessageSquare className="h-7 w-7" />,
      title: 'Secure Messaging',
      description: 'Direct messaging between students, lecturers, and parents with real-time notifications.',
      color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
    },
  ]

  const stats = [
    { value: '5', label: 'User Roles' },
    { value: '100%', label: 'Secure & Private' },
    { value: 'Real-time', label: 'Data Updates' },
    { value: '24/7', label: 'Always Available' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500 text-white font-bold text-lg shadow">P</div>
            <span className="text-lg font-heading font-semibold tracking-tight">University Portal</span>
          </div>
          <Link
            href="/auth/login"
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            Sign In <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 -mr-64 -mt-64 w-[600px] h-[600px] bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5"></div>
          <div className="absolute bottom-0 left-0 -ml-64 -mb-64 w-[600px] h-[600px] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-8 border border-emerald-200 dark:border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Secure Academic Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight tracking-tight mb-6">
            One portal for the <br />
            <span className="text-emerald-500">entire university.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            A unified, secure platform connecting administrators, educators, students, and parents — with live data, real-time messaging, and academic analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors shadow-lg shadow-emerald-500/20"
            >
              Access Your Portal <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-border hover:bg-muted/50 font-semibold transition-colors"
            >
              Learn More <ChevronRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-heading font-bold text-foreground">{s.value}</p>
                <p className="text-muted-foreground text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold mb-4">Everything you need</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Tailored dashboards for every role, all connected to live data from the same backend.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow group"
            >
              <div className={`inline-flex p-3 rounded-xl mb-4 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-slate-900 dark:bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-heading font-bold mb-4">Ready to get started?</h2>
          <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
            Sign in with your institutional credentials. First-time parents can use their child's Student ID as the default password.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg transition-colors shadow-lg shadow-emerald-500/30"
          >
            Sign In to Portal <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500 text-white font-bold text-sm">P</div>
            <span className="font-semibold text-sm">University Portal</span>
          </div>
          <p className="text-muted-foreground text-sm">Secure Academic Communication Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
