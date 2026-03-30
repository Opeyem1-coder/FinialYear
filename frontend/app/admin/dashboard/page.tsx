'use client'

import { useState, useEffect } from 'react'
import { Users, BookOpen, UserCheck, TrendingUp, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, courses: 0, students: 0, teachers: 0 })
    const [recentUsers, setRecentUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [usersRes, coursesRes, studentsRes] = await Promise.all([
                    apiFetch('/users'),
                    apiFetch('/courses'),
                    apiFetch('/students')
                ])

                const users: any[] = usersRes.data?.data || []
                const courses: any[] = coursesRes.data?.data || []
                const students: any[] = studentsRes.data?.data || []
                const teachers = users.filter((u: any) => u.role === 'teacher')

                setStats({ users: users.length, courses: courses.length, students: students.length, teachers: teachers.length })

                const sorted = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
                setRecentUsers(sorted)
            } catch (err: any) {
                setError(err.message || 'Failed to load dashboard data')
                toast.error('Failed to load dashboard data')
            } finally {
                setIsLoading(false)
            }
        }
        loadStats()
    }, [])

    const statCards = [
        { title: 'Total Users', value: stats.users, description: 'System registered accounts', icon: <Users className="h-8 w-8" />, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', href: '/admin/users' },
        { title: 'Active Courses', value: stats.courses, description: 'Across all departments', icon: <BookOpen className="h-8 w-8" />, color: 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-500', href: '/admin/courses' },
        { title: 'Students', value: stats.students, description: 'Currently enrolled', icon: <UserCheck className="h-8 w-8" />, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600', href: '/admin/users' },
        { title: 'Lecturers', value: stats.teachers, description: 'Teaching staff', icon: <TrendingUp className="h-8 w-8" />, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600', href: '/admin/users' },
    ]

    const roleColor: Record<string, string> = {
        student: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
        teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        parent: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
        admin: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
        registry: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
    }

    if (error) return (
        <div className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="text-destructive font-medium">{error}</p>
        </div>
    )

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">System overview and management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map(s => (
                    <Link key={s.title} href={s.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                <div>
                                    <CardDescription>{s.title}</CardDescription>
                                    <CardTitle className="text-3xl mt-2">{isLoading ? '...' : s.value}</CardTitle>
                                </div>
                                <div className={`p-3 rounded-full ${s.color}`}>{s.icon}</div>
                            </CardHeader>
                            <CardContent><p className="text-xs text-muted-foreground">{s.description}</p></CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Registrations</CardTitle>
                        <CardDescription>Last 5 users added to the system</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isLoading ? (
                            <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
                        ) : recentUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">No users registered yet.</p>
                        ) : recentUsers.map((u: any) => (
                            <div key={u._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                <div>
                                    <p className="font-medium text-sm">{u.firstName} {u.lastName}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${roleColor[u.role] || 'bg-muted text-muted-foreground'}`}>{u.role}</span>
                            </div>
                        ))}
                        <Link href="/admin/users">
                            <PillButton fullWidth variant="secondary" className="mt-3">View All Users</PillButton>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { label: 'Manage Users', href: '/admin/users', color: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
                            { label: 'Manage Courses', href: '/admin/courses', color: 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' },
                            { label: 'View Attendance', href: '/admin/attendance', color: 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
                            { label: 'Generate Reports', href: '/admin/reports', color: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
                            { label: 'Discipline Records', href: '/admin/discipline', color: 'bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-400' },
                        ].map(a => (
                            <Link key={a.label} href={a.href}>
                                <div className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors ${a.color}`}>
                                    <span className="font-medium text-sm">{a.label}</span>
                                    <span className="text-lg">→</span>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
