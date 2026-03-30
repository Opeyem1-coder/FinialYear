'use client'

import { useState, useEffect } from 'react'
import { BookOpen, TrendingUp, Calendar, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

export default function StudentDashboard() {
    const [studentProfile, setStudentProfile] = useState<any>(null)
    const [courses, setCourses] = useState<any[]>([])
    const [grades, setGrades] = useState<any[]>([])
    const [attendanceStat, setAttendanceStat] = useState('N/A')
    const [messagesCount, setMessagesCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let mounted = true
        const loadDashboard = async () => {
            try {
                const uStr = sessionStorage.getItem('user')
                if (!uStr) { setIsLoading(false); return }
                const user = JSON.parse(uStr)

                const studentRes = await apiFetch(`/students?userId=${user._id || user.id}`)
                let profile = null

                if (studentRes.data?.data?.length > 0) {
                    profile = studentRes.data.data[0]
                    if (mounted) {
                        setStudentProfile(profile)
                        if (profile.courseIds) setCourses(profile.courseIds)
                    }
                } else {
                    profile = { firstName: user.firstName || 'Student', lastName: user.lastName || '', program: 'General', level: '100 Level' }
                    if (mounted) setStudentProfile(profile)
                }

                if (!profile?._id) { if (mounted) setIsLoading(false); return }

                const [gradesRes, attRes, msgRes] = await Promise.all([
                    apiFetch(`/grades?studentId=${profile._id}`),
                    apiFetch(`/attendance?studentId=${profile._id}`),
                    apiFetch(`/messages`)
                ])

                if (mounted) {
                    const rawGrades = gradesRes.data?.data || []
                    setGrades(rawGrades.slice(0, 3))

                    const att = attRes.data?.data || []
                    if (att.length > 0) {
                        const present = att.filter((a: any) => a.status === 'present').length
                        setAttendanceStat(`${((present / att.length) * 100).toFixed(0)}%`)
                    } else {
                        setAttendanceStat('No records')
                    }

                    const msgs = msgRes.data?.data || []
                    const unread = msgs.filter((m: any) => !m.isRead && m.receiverId?._id === (user._id || user.id)).length
                    setMessagesCount(unread)

                    setIsLoading(false)
                }
            } catch (err: any) {
                console.error(err)
                if (mounted) { setError(err.message || 'Failed to load dashboard'); setIsLoading(false) }
            }
        }
        loadDashboard()
        return () => { mounted = false }
    }, [])

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>
    if (error) return <div className="p-8 text-center text-destructive">{error}</div>

    let cgpaStr = 'N/A'
    if (grades.length > 0) {
        const avg = grades.reduce((acc, g) => acc + (g.score || 0), 0) / grades.length
        cgpaStr = ((avg / 100) * 5.0).toFixed(2) + '/5.0'
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
                    Welcome back, {studentProfile?.firstName || 'Student'}
                </h1>
                <p className="text-muted-foreground">Here's your academic overview for the current semester</p>
            </div>

            <Card className="border-2 border-primary/20">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl">{studentProfile?.firstName} {studentProfile?.lastName}</CardTitle>
                            <CardDescription>{studentProfile?.program || 'Unassigned'} — {studentProfile?.level || 'Unassigned'}</CardDescription>
                        </div>
                        <Badge variant="success">Active</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <p className="text-xs text-muted-foreground font-medium">Program</p>
                            <p className="text-sm font-bold text-foreground mt-1 truncate">{studentProfile?.program || 'N/A'}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/20">
                            <p className="text-xs text-muted-foreground font-medium">CGPA (Est.)</p>
                            <p className="text-lg font-bold text-foreground mt-1">{cgpaStr}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                            <p className="text-xs text-muted-foreground font-medium">Attendance</p>
                            <p className="text-lg font-bold text-foreground mt-1">{attendanceStat}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-xs text-muted-foreground font-medium">Level</p>
                            <p className="text-sm font-bold text-foreground mt-1">{studentProfile?.level || 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                        <div>
                            <CardDescription>CGPA</CardDescription>
                            <CardTitle className="text-3xl mt-2">{cgpaStr.split('/')[0]}</CardTitle>
                        </div>
                        <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-500/30 text-emerald-500">
                            <TrendingUp className="h-8 w-8" />
                        </div>
                    </CardHeader>
                    <CardContent><p className="text-xs text-muted-foreground">Cumulative GPA</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                        <div>
                            <CardDescription>Courses</CardDescription>
                            <CardTitle className="text-3xl mt-2">{courses.length}</CardTitle>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                            <BookOpen className="h-8 w-8" />
                        </div>
                    </CardHeader>
                    <CardContent><p className="text-xs text-muted-foreground">Enrolled this semester</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                        <div>
                            <CardDescription>Attendance</CardDescription>
                            <CardTitle className="text-3xl mt-2">{attendanceStat}</CardTitle>
                        </div>
                        <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                            <Calendar className="h-8 w-8" />
                        </div>
                    </CardHeader>
                    <CardContent><p className="text-xs text-muted-foreground">This semester</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                        <div>
                            <CardDescription>Messages</CardDescription>
                            <CardTitle className="text-3xl mt-2">{messagesCount}</CardTitle>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                            <MessageSquare className="h-8 w-8" />
                        </div>
                    </CardHeader>
                    <CardContent><p className="text-xs text-muted-foreground">Unread from staff</p></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" /> My Courses
                        </CardTitle>
                        <CardDescription>Enrolled courses this semester</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 flex flex-col flex-1">
                        <div className="space-y-2 flex-1">
                            {courses.slice(0, 4).map((c, i) => (
                                <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-sm text-foreground">{c.courseName}</p>
                                            <p className="text-xs text-muted-foreground">{c.subject || 'Standard Module'}</p>
                                        </div>
                                        <Badge variant="secondary">Active</Badge>
                                    </div>
                                </div>
                            ))}
                            {courses.length === 0 && (
                                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                                    No courses enrolled. Contact Registry.
                                </div>
                            )}
                        </div>
                        <Link href="/student/courses" className="mt-auto pt-4">
                            <PillButton fullWidth variant="secondary">View All Courses</PillButton>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" /> Recent Grades
                        </CardTitle>
                        <CardDescription>Latest assessment results</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 flex flex-col flex-1">
                        <div className="space-y-2 flex-1">
                            {grades.map((g, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                                    <div>
                                        <p className="font-medium text-sm text-foreground">{g.assignmentName || 'Assessment'}</p>
                                        <p className="text-xs text-muted-foreground">{g.courseId?.courseName || 'Course ID: ' + g.courseId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-emerald-500">{g.score}%</p>
                                        <p className="text-xs text-muted-foreground">{g.score >= 70 ? 'Pass' : 'Review'}</p>
                                    </div>
                                </div>
                            ))}
                            {grades.length === 0 && (
                                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                                    No grades submitted yet.
                                </div>
                            )}
                        </div>
                        <Link href="/student/grades" className="mt-auto pt-4">
                            <PillButton fullWidth variant="secondary">View All Grades</PillButton>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
