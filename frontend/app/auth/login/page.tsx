'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { PillButton } from '@/components/ui/pill-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!email || !password) {
        setError('Please enter email and password')
        setIsLoading(false)
        return
      }

      // 1. Hit the global API Wrapper
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: email, password }),
        requireAuth: false // We don't have a token yet
      })

      // 2. Handle Mock Mode Local Fallback
      if (res.isMock) {
        let role = 'parent'
        if (email.includes('admin')) role = 'admin'
        else if (email.includes('teacher') || email.includes('lecturer') || email.includes('professor')) role = 'teacher'
        else if (email.includes('student')) role = 'student'
        else if (email.includes('registry')) role = 'registry'

        sessionStorage.setItem('user', JSON.stringify({ email, role, name: email.split('@')[0] }))

        if (role === 'admin') router.push('/admin/dashboard')
        else if (role === 'teacher') router.push('/teacher/dashboard')
        else if (role === 'student') router.push('/student/dashboard')
        else if (role === 'registry') router.push('/registry/dashboard')
        else router.push('/parent/dashboard')

        return
      }

      // 3. Handle Real Live API Response
      const { token, user } = res.data

      // Store token and user data
      localStorage.setItem('authToken', token)
      sessionStorage.setItem('user', JSON.stringify(user))

      // Route based on real backend role
      if (user.role === 'admin') router.push('/admin/dashboard')
      else if (user.role === 'teacher') router.push('/teacher/dashboard')
      else if (user.role === 'student') router.push('/student/dashboard')
      else if (user.role === 'registry') router.push('/registry/dashboard')
      else router.push('/parent/dashboard')

    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left side: Brand/Visual block */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold text-xl shadow-lg">
            P
          </div>
          <span className="text-xl font-heading font-semibold tracking-tight">University Portal</span>
        </div>

        <div className="relative z-10 max-w-lg mb-12">
          <h1 className="text-4xl lg:text-5xl font-heading font-bold leading-tight mb-6">
            Empowering the next generation of academic excellence.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            A unified, secure platform designed to seamlessly connect administrators, educators, students, and parents in real-time.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          &copy; {new Date().getFullYear()} University Parent-Teacher Communication Portal. All rights reserved.
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Header (Hidden on large screens) */}
          <div className="md:hidden flex flex-col items-center text-center mb-10">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 mb-4">
              <span className="text-2xl font-bold">P</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">University Portal</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to your account</p>
          </div>

          <div className="space-y-6">
            <div className="hidden md:block mb-8">
              <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Welcome Back</h2>
              <p className="text-muted-foreground">Please enter your credentials to securely access your portal.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2 group">
                <Label htmlFor="email" className="text-foreground font-medium group-focus-within:text-emerald-500 transition-colors">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-muted/40 border-muted-foreground/20 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-all text-base"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground font-medium group-focus-within:text-emerald-500 transition-colors">Password</Label>
                  <Link href="/auth/forgot-password" tabIndex={-1}>
                    <span className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                      Forgot password?
                    </span>
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 bg-muted/40 border-muted-foreground/20 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-all text-base"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <PillButton
                type="submit"
                fullWidth
                size="lg"
                disabled={isLoading}
                className="mt-6 h-12 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 text-base font-medium group"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In to Portal
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </PillButton>

              {/* Demo Credentials Section */}
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Demo Credentials</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all group" onClick={() => setEmail('admin@university.edu')}>
                    <span className="block font-semibold text-slate-800 group-hover:text-emerald-700 mb-1 leading-none">Admin</span>
                    <code className="text-slate-500 group-hover:text-emerald-600 font-mono text-xs">admin@...</code>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all group" onClick={() => setEmail('registry@university.edu')}>
                    <span className="block font-semibold text-slate-800 group-hover:text-emerald-700 mb-1 leading-none">Registry</span>
                    <code className="text-slate-500 group-hover:text-emerald-600 font-mono text-xs">registry@...</code>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all group" onClick={() => setEmail('teacher@university.edu')}>
                    <span className="block font-semibold text-slate-800 group-hover:text-emerald-700 mb-1 leading-none">Lecturer</span>
                    <code className="text-slate-500 group-hover:text-emerald-600 font-mono text-xs">teacher@...</code>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all group" onClick={() => setEmail('student@university.edu')}>
                    <span className="block font-semibold text-slate-800 group-hover:text-emerald-700 mb-1 leading-none">Student</span>
                    <code className="text-slate-500 group-hover:text-emerald-600 font-mono text-xs">student@...</code>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all group lg:col-span-2" onClick={() => setEmail('parent@university.edu')}>
                    <span className="block font-semibold text-slate-800 group-hover:text-emerald-700 mb-1 leading-none">Parent</span>
                    <code className="text-slate-500 group-hover:text-emerald-600 font-mono text-xs">parent@...</code>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
