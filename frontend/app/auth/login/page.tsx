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

      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: email, password }),
        requireAuth: false
      })

      // Mock mode fallback
      if (res.isMock) {
        let role = 'parent'
        if (email.includes('admin')) role = 'admin'
        else if (email.includes('teacher') || email.includes('lecturer')) role = 'teacher'
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

      const { token, user, mustChangePassword } = res.data

      // Store token and user data
      localStorage.setItem('authToken', token)
      sessionStorage.setItem('user', JSON.stringify(user))

      // If forced password change — redirect to change-password page before dashboard
      if (mustChangePassword) {
        router.push('/auth/change-password')
        return
      }

      // Normal routing based on role
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
      {/* Left side brand panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold text-xl shadow-lg">P</div>
          <span className="text-xl font-heading font-semibold tracking-tight">University Portal</span>
        </div>

        <div className="relative z-10 max-w-lg mb-12">
          <h1 className="text-4xl lg:text-5xl font-heading font-bold leading-tight mb-6">
            Empowering the next generation of academic excellence.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            A unified, secure platform connecting administrators, educators, students, and parents in real-time.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6 border-t border-slate-700 pt-8">
          {[['Students', 'Track academic progress'], ['Parents', 'Monitor your child'], ['Lecturers', 'Manage your classes']].map(([title, desc]) => (
            <div key={title}>
              <p className="font-semibold text-white mb-1">{title}</p>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right side login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="md:hidden flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold text-xl">P</div>
            <span className="text-xl font-heading font-semibold">University Portal</span>
          </div>

          <div>
            <h2 className="text-3xl font-heading font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to access your portal</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                First-time parent? Use your child's <strong>Student ID</strong> as your password.
              </p>
            </div>

            <PillButton type="submit" fullWidth disabled={isLoading} className="h-11">
              {isLoading ? 'Signing in...' : (
                <span className="flex items-center gap-2">Sign In to Portal <ArrowRight className="h-4 w-4" /></span>
              )}
            </PillButton>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Forgot your password? Contact the Registry office.
          </p>
        </div>
      </div>
    </div>
  )
}
