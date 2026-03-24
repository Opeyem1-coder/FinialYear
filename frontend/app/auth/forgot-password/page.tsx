'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { PillButton } from '@/components/ui/pill-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (email) {
        // Simulate password reset email sending
        setSubmitted(true)
      } else {
        setError('Please enter a valid email address')
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-500/30 p-3">
                  <CheckCircle className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
                </div>
              </div>
              <CardTitle>Check Your Email</CardTitle>
              <CardDescription>
                We've sent a password reset link to {email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-foreground mb-2">
                  Follow the link in the email to reset your password. The link will expire in 24 hours.
                </p>
              </div>

              <Link href="/auth/login" className="block">
                <PillButton fullWidth size="lg" variant="secondary">
                  <span className="flex items-center justify-center gap-2">
                    <ArrowLeft className="h-5 w-5" />
                    Back to Login
                  </span>
                </PillButton>
              </Link>

              <p className="text-center text-sm text-muted-foreground">
                Didn't receive the email?{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-primary hover:underline transition-smooth"
                >
                  Try again
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary mb-4">
            <span className="text-xl font-bold text-primary-foreground">P</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Reset Password
          </h1>
          <p className="text-muted-foreground">
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Reset Card */}
        <Card>
          <CardHeader>
            <CardTitle>Forgot Your Password?</CardTitle>
            <CardDescription>
              No worries! We'll help you regain access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
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
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </PillButton>

              {/* Back to Login */}
              <Link href="/auth/login">
                <div className="text-center">
                  <span className="text-sm text-primary hover:underline transition-smooth cursor-pointer flex items-center justify-center gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </span>
                </div>
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
