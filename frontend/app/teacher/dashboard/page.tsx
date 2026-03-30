'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, BookOpen, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

export default function TeacherDashboard() {
    const [userName, setUserName] = useState('Teacher')
    const [courses, setCourses] = useState<any[]>([])
    const [messages, setMessages] = useState<any[]>([])
    const [studentCount, setStudentCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        const loadDashboard = async () => {
            try {
                const uStr = sessionStorage.getItem('user')
                if (uStr) {
                    const u = JSON.parse(uStr)
                    setUserName(u.firstName || u.name || 'Teacher')
                }

                const [courseRes, msgRes, studentsRes] = await Promise.all([
                    apiFetch('/courses'),
                    apiFetch('/messages').catch(() => ({ isMock: false, data: { data: [] } })),
                    apiFetch('/students').catch(() => ({ isMock: false, data: { data: [] } }))
                ])

                if (mounted) {
                    setCourses(courseRes.data?.data || [])
                    setMessages(msgRes.data?.data || [])
                    setStudentCount((studentsRes.data?.data || []).length)
                    setIsLoading(false)
                }
            } catch (err: any) {
                toast.error('Failed to load dashboard data')
                if (mounted) setIsLoading(false)
            }
        }
        loadDashboard()
        return () => { mounted = false }
    }, [])

    const stats = [
        { title: 'My Courses', value: courses.length.toString(), description: 'Assigned this semester', icon: <BookOpen className="h-8 w-8" />, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
        { title: 'Total Students', value: studentCount.toString(), description: 'Across all courses', icon: <Users className="h-8 w-8" />, color: 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-500' },
        { title: 'Messages', value: messages.length.toString(), description: 'In your inbox', icon: <MessageSquare className="h-8 w-8" />, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
        { title: 'Courses Active', value: courses.length.toString(), description: 'Requiring attention', icon: <Calendar className="h-8 w-8" />, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Welcome Back, {userName}</h1>
                <p className="text-muted-foreground">Here's what's happening with your classes today</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(s => (
                    <Card key={s.title}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                            <div>
                                <CardDescription>{s.title}</CardDescription>
                                <CardTitle className="text-3xl mt-2">{isLoading ? '...' : s.value}</CardTitle>
                            </div>
                            <div className={`p-3 rounded-full ${s.color}`}>{s.icon}</div>
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">{s.description}</p></CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />My Classes</CardTitle>
                        <CardDescription>Your assigned courses</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 flex flex-col flex-1">
                        <div className="space-y-2 flex-1">
                            {isLoading ? (
                                <p className="text-sm text-muted-foreground animate-pulse py-4 text-center">Loading...</p>
                            ) : courses.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                                    No courses assigned yet. Contact an admin.
                                </div>
                            ) : courses.slice(0, 4).map((c: any) => (
                                <div key={c._id} className="p-3 rounded-lg bg-muted/50 border border-border">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-sm text-foreground">{c.courseName}</p>
                                            <p className="text-xs text-muted-foreground">{c.subject}</p>
                                        </div>
                                        <Badge variant="secondary">Active</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/teacher/classes" className="mt-auto pt-4">
                            <PillButton fullWidth variant="secondary">View All Classes</PillButton>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-amber-500" />Recent Messages</CardTitle>
                        <CardDescription>Latest communications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 flex flex-col flex-1">
                        <div className="space-y-2 flex-1">
                            {isLoading ? (
                                <p className="text-sm text-muted-foreground animate-pulse py-4 text-center">Loading...</p>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                                    No messages yet.
                                </div>
                            ) : messages.slice(0, 4).map((m: any) => (
                                <div key={m._id} className="p-3 rounded-lg bg-muted/50 border border-border">
                                    <p className="font-medium text-sm text-foreground">
                                        {m.senderId?.firstName} {m.senderId?.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">{m.body}</p>
                                </div>
                            ))}
                        </div>
                        <Link href="/teacher/messages" className="mt-auto pt-4">
                            <PillButton fullWidth variant="secondary">View All Messages</PillButton>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
