'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GraduationCap, Users, UserPlus, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

export default function RegistryDashboardPage() {
    const [stats, setStats] = useState([
        { title: 'Total Students', value: '...', icon: <GraduationCap className="h-4 w-4 text-emerald-500" />, href: '/registry/students', description: 'Registered in the system' },
        { title: 'Total Lecturers', value: '...', icon: <Users className="h-4 w-4 text-primary" />, href: '/registry/lecturers', description: 'Active teaching staff' },
        { title: 'Registered Parents', value: '...', icon: <UserPlus className="h-4 w-4 text-blue-500" />, href: '/registry/parents', description: 'Linked parent accounts' },
        { title: 'Total Courses', value: '...', icon: <TrendingUp className="h-4 w-4 text-purple-500" />, href: '#', description: 'Active course offerings' },
    ])
    const [recentUsers, setRecentUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [studentsRes, usersRes, coursesRes] = await Promise.all([
                    apiFetch('/students'),
                    apiFetch('/users'),
                    apiFetch('/courses'),
                ])

                const students = studentsRes.data?.data || []
                const users = usersRes.data?.data || []
                const courses = coursesRes.data?.data || []
                const lecturers = users.filter((u: any) => u.role === 'teacher')
                const parents = users.filter((u: any) => u.role === 'parent')

                setStats([
                    { title: 'Total Students', value: students.length.toString(), icon: <GraduationCap className="h-4 w-4 text-emerald-500" />, href: '/registry/students', description: 'Registered in the system' },
                    { title: 'Total Lecturers', value: lecturers.length.toString(), icon: <Users className="h-4 w-4 text-primary" />, href: '/registry/lecturers', description: 'Active teaching staff' },
                    { title: 'Registered Parents', value: parents.length.toString(), icon: <UserPlus className="h-4 w-4 text-blue-500" />, href: '/registry/parents', description: 'Linked parent accounts' },
                    { title: 'Total Courses', value: courses.length.toString(), icon: <TrendingUp className="h-4 w-4 text-purple-500" />, href: '#', description: 'Active course offerings' },
                ])

                const sorted = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
                setRecentUsers(sorted)
            } catch (err: any) {
                toast.error('Failed to load registry stats')
            } finally {
                setIsLoading(false)
            }
        }
        loadStats()
    }, [])

    const roleLabel: Record<string, string> = { student: 'Student', teacher: 'Lecturer', parent: 'Parent', admin: 'Admin', registry: 'Registry' }
    const roleColor: Record<string, string> = {
        student: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
        teacher: 'bg-primary/10 text-primary',
        parent: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
        admin: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
        registry: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Registry Dashboard</h1>
                <p className="text-muted-foreground">Manage enrolments, accounts, and course assignments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(s => (
                    <Link key={s.title} href={s.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                                <div className="p-2 rounded-full bg-muted">{s.icon}</div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">{isLoading ? '...' : s.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                            </CardContent>
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
                    <CardContent>
                        {isLoading ? (
                            <p className="text-sm text-muted-foreground animate-pulse py-4">Loading...</p>
                        ) : recentUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">No users registered yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentUsers.map((u: any) => (
                                    <div key={u._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                        <div>
                                            <p className="font-medium text-sm">{u.firstName} {u.lastName}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColor[u.role] || 'bg-muted text-muted-foreground'}`}>
                                            {roleLabel[u.role] || u.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common registry tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { label: 'Register New Student', href: '/registry/students', color: 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400' },
                            { label: 'Add Lecturer', href: '/registry/lecturers', color: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 text-blue-700 dark:text-blue-400' },
                            { label: 'Register Parent', href: '/registry/parents', color: 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 text-amber-700 dark:text-amber-400' },
                            { label: 'Link Parent & Student', href: '/registry/link-accounts', color: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 text-purple-700 dark:text-purple-400' },
                        ].map(a => (
                            <Link key={a.label} href={a.href}>
                                <div className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors ${a.color}`}>
                                    <span className="font-medium text-sm">{a.label}</span>
                                    <span>→</span>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
