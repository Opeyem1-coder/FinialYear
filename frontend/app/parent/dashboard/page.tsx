'use client'

import { useState, useEffect } from 'react'
import { BookOpen, TrendingUp, AlertCircle, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

export default function ParentDashboard() {
    const [parentName, setParentName] = useState('Parent')
    const [child, setChild] = useState<any>(null)
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
                if (mounted) setParentName(user.firstName || user.name || 'Parent')

                const studentRes = await apiFetch(`/students?parentIds=${user._id || user.id}`)
                let profile = null
                if (studentRes.data?.data?.length > 0) {
                    profile = studentRes.data.data[0]
                    if (mounted) setChild({ name: `${profile.firstName} ${profile.lastName}`, program: profile.program || 'Unassigned', level: profile.level || 'Unassigned', semester: 'Current', gpa: 'N/A' })
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
                    if (rawGrades.length > 0) {
                        const avg = rawGrades.reduce((acc: number, g: any) => acc + (g.score || 0), 0) / rawGrades.length
                        const gpa = ((avg / 100) * 5.0).toFixed(2) + '/5.0'
                        setChild((prev: any) => ({ ...prev, gpa }))
                    }

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
                if (mounted) { setError(err.message || 'Failed to load dashboard'); setIsLoading(false) }
                toast.error('Failed to load dashboard data')
            }
        }
        loadDashboard()
        return () => { mounted = false }
    }, [])

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>
    if (error) return <div className="p-8 text-center text-destructive">{error}</div>

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Welcome, {parentName}</h1>
                <p className="text-muted-foreground">Monitor your child's academic progress</p>
            </div>

            {!child ? (
                <Card className="border-dashed border-2">
                    <CardContent className="py-16 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                        <p className="font-medium text-foreground">No linked student found</p>
                        <p className="text-sm text-muted-foreground mt-2">Contact the Registry to link your account to your child.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Card className="border-2 border-primary/20">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{child.name}</CardTitle>
                                    <CardDescription>{child.program} — {child.level}</CardDescription>
                                </div>
                                <Badge variant="success">Active</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Program', value: child.program, bg: 'bg-blue-50 dark:bg-blue-900/20' },
                                    { label: 'GPA (Est.)', value: child.gpa, bg: 'bg-emerald-50 dark:bg-emerald-500/20' },
                                    { label: 'Attendance', value: attendanceStat, bg: 'bg-amber-50 dark:bg-amber-900/20' },
                                    { label: 'Level', value: child.level, bg: 'bg-purple-50 dark:bg-purple-900/20' },
                                ].map(item => (
                                    <div key={item.label} className={`p-3 rounded-lg ${item.bg}`}>
                                        <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                                        <p className="text-sm font-bold text-foreground mt-1">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'GPA', value: child.gpa.split('/')[0], desc: 'Estimated cumulative', icon: <TrendingUp className="h-8 w-8" />, color: 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-500' },
                            { label: 'Grades', value: grades.length.toString(), desc: 'Submitted assessments', icon: <BookOpen className="h-8 w-8" />, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
                            { label: 'Attendance', value: attendanceStat, desc: 'Overall this semester', icon: <AlertCircle className="h-8 w-8" />, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
                            { label: 'Messages', value: messagesCount.toString(), desc: 'Unread', icon: <MessageSquare className="h-8 w-8" />, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
                        ].map(s => (
                            <Card key={s.label}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                    <div>
                                        <CardDescription>{s.label}</CardDescription>
                                        <CardTitle className="text-3xl mt-2">{s.value}</CardTitle>
                                    </div>
                                    <div className={`p-3 rounded-full ${s.color}`}>{s.icon}</div>
                                </CardHeader>
                                <CardContent><p className="text-xs text-muted-foreground">{s.desc}</p></CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-500" />Recent Grades</CardTitle>
                                <CardDescription>Latest assessment results for {child.name.split(' ')[0]}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 flex flex-col flex-1">
                                {grades.map((g, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                                        <div>
                                            <p className="font-medium text-sm">{g.assignmentName || 'Assessment'}</p>
                                            <p className="text-xs text-muted-foreground">{g.courseId?.courseName || '—'}</p>
                                        </div>
                                        <p className="text-lg font-bold text-emerald-500">{g.score}%</p>
                                    </div>
                                ))}
                                {grades.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No grades available yet.</p>}
                                <Link href="/parent/academics" className="mt-auto pt-4">
                                    <PillButton fullWidth variant="secondary">View Full Transcript</PillButton>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Links</CardTitle>
                                <CardDescription>Navigate to key sections</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[
                                    { label: 'Academic Record', href: '/parent/academics', color: 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400' },
                                    { label: 'Discipline & Attendance', href: '/parent/discipline', color: 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 text-amber-700 dark:text-amber-400' },
                                    { label: 'Messages', href: '/parent/messages', color: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 text-blue-700 dark:text-blue-400' },
                                    { label: 'Settings', href: '/parent/settings', color: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 text-purple-700 dark:text-purple-400' },
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
                </>
            )}
        </div>
    )
}
