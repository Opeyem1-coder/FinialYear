'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GraduationCap, Users, UserPlus, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

export default function RegistryDashboardPage() {
    const [stats, setStats] = useState([
        { title: 'Total Students', value: '...', description: 'Registered in the system', icon: <GraduationCap className="h-4 w-4 text-emerald-500" />, href: '/registry/students' },
        { title: 'Total Lecturers', value: '...', description: 'Active teaching staff', icon: <Users className="h-4 w-4 text-primary" />, href: '/registry/lecturers' },
        { title: 'Registered Parents', value: '...', description: 'Linked parent accounts', icon: <UserPlus className="h-4 w-4 text-blue-500" />, href: '/registry/parents' },
        { title: 'Total Courses', value: '...', description: 'Active course offerings', icon: <TrendingUp className="h-4 w-4 text-purple-500" />, href: '#' },
    ])
    const [recentUsers, setRecentUsers] = useState<any[]>([])

    useEffect(() => {
        const loadStats = async () => {
            try {
                const isMock = localStorage.getItem('useMockData') === 'true'
                if (isMock) {
                    setStats(prev => prev.map((s, i) => ({
                        ...s,
                        value: ['—', '—', '—', '—'][i],
                        description: 'Switch to Live API to see real counts'
                    })))
                    setRecentUsers([
                        { name: 'John Doe', role: 'Student', createdAt: new Date().toISOString() },
                        { name: 'Dr. Sarah Smith', role: 'Lecturer', createdAt: new Date(Date.now() - 86400000).toISOString() },
                        { name: 'Michael Johnson', role: 'Parent', createdAt: new Date(Date.now() - 172800000).toISOString() },
                    ])
                    return
                }

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
                    { title: 'Total Students', value: students.length.toString(), description: 'Registered in the system', icon: <GraduationCap className="h-4 w-4 text-emerald-500" />, href: '/registry/students' },
                    { title: 'Total Lecturers', value: lecturers.length.toString(), description: 'Active teaching staff', icon: <Users className="h-4 w-4 text-primary" />, href: '/registry/lecturers' },
                    { title: 'Registered Parents', value: parents.length.toString(), description: 'Linked parent accounts', icon: <UserPlus className="h-4 w-4 text-blue-500" />, href: '/registry/parents' },
                    { title: 'Total Courses', value: courses.length.toString(), description: 'Active course offerings', icon: <TrendingUp className="h-4 w-4 text-purple-500" />, href: '#' },
                ])

                // Recent registrations: last 5 users sorted by createdAt
                const sorted = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
                setRecentUsers(sorted)

            } catch (err) {
                console.error('Failed to load registry stats', err)
            }
        }

        loadStats()
    }, [])

    const roleLabel: Record<string, string> = {
        student: 'Student',
        teacher: 'Lecturer',
        parent: 'Parent',
        admin: 'Admin',
        registry: 'Registry',
    }

    const roleColor: Record<string, string> = {
        student: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
        teacher: 'bg-primary/10 text-primary',
        parent: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
        admin: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
        registry: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">Registry Overview</h1>
                <p className="text-muted-foreground mt-1">Manage university user registrations and records.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Link href={stat.href} key={i} className="block group">
                        <Card className="hover:border-primary/50 transition-colors h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                    {stat.title}
                                </CardTitle>
                                <div className="p-2 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                                    {stat.icon}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Registrations Table */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Registrations</CardTitle>
                        <CardDescription>The latest accounts added to the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentUsers.length === 0 ? (
                                <div className="py-6 text-center text-muted-foreground text-sm border border-dashed rounded-lg">
                                    No users registered yet. Switch to Live API to see real data.
                                </div>
                            ) : (
                                recentUsers.map((user, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {(user.firstName || user.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    {user.firstName ? `${user.firstName} ${user.lastName}` : user.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColor[user.role] || 'bg-muted text-muted-foreground'}`}>
                                                        {roleLabel[user.role] || user.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-foreground">Registered</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Frequently used registry tasks.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/registry/students" className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-md text-emerald-500 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <span className="font-medium">Register Student</span>
                            </div>
                        </Link>

                        <Link href="/registry/lecturers" className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-md text-primary group-hover:scale-110 transition-transform">
                                    <Users className="h-5 w-5" />
                                </div>
                                <span className="font-medium">Register Lecturer</span>
                            </div>
                        </Link>

                        <Link href="/registry/parents" className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-md text-blue-500 group-hover:scale-110 transition-transform">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                                <span className="font-medium">Register Parent</span>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
