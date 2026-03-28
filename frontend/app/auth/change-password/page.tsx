'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { PillButton } from '@/components/ui/pill-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

export default function ChangePasswordPage() {
    const router = useRouter()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters')
            return
        }

        if (newPassword === currentPassword) {
            setError('New password must be different from your current password')
            return
        }

        setIsLoading(true)
        try {
            await apiFetch('/auth/change-password', {
                method: 'PUT',
                body: JSON.stringify({ currentPassword, newPassword })
            })

            toast.success('Password changed successfully! Redirecting to your dashboard...')

            // Update the stored user to clear mustChangePassword
            const uStr = sessionStorage.getItem('user')
            if (uStr) {
                const u = JSON.parse(uStr)
                u.mustChangePassword = false
                sessionStorage.setItem('user', JSON.stringify(u))
            }

            // Redirect based on role
            setTimeout(() => {
                const uStr = sessionStorage.getItem('user')
                if (uStr) {
                    const u = JSON.parse(uStr)
                    if (u.role === 'admin') router.push('/admin/dashboard')
                    else if (u.role === 'teacher') router.push('/teacher/dashboard')
                    else if (u.role === 'student') router.push('/student/dashboard')
                    else if (u.role === 'registry') router.push('/registry/dashboard')
                    else router.push('/parent/dashboard')
                } else {
                    router.push('/auth/login')
                }
            }, 1500)

        } catch (err: any) {
            setError(err.message || 'Failed to change password')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="w-full max-w-md space-y-6">

                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-4">
                        <ShieldCheck className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Set Your Password</h1>
                    <p className="text-muted-foreground mt-2">
                        You're logging in for the first time. Please create a secure password to continue.
                    </p>
                </div>

                {/* Info box */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">First-time login</p>
                    <p className="text-blue-600 dark:text-blue-400">Your temporary password was your child's Student ID. Enter it below as your <strong>current password</strong>, then choose a new secure password.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>This is required before you can access the portal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label>Current Password (Student ID)</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type={showCurrent ? 'text' : 'password'}
                                        placeholder="e.g. STU2024001"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type={showNew ? 'text' : 'password'}
                                        placeholder="At least 6 characters"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {newPassword.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                                                newPassword.length >= (i + 1) * 3
                                                    ? i < 1 ? 'bg-red-400' : i < 2 ? 'bg-amber-400' : i < 3 ? 'bg-blue-400' : 'bg-emerald-500'
                                                    : 'bg-muted'
                                            }`} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Confirm New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        placeholder="Repeat your new password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                                    <p className="text-xs text-destructive">Passwords do not match</p>
                                )}
                            </div>

                            <PillButton type="submit" fullWidth disabled={isLoading} className="h-11 bg-emerald-500 hover:bg-emerald-600 text-white">
                                {isLoading ? 'Saving...' : 'Set New Password & Continue'}
                            </PillButton>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
