'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'

interface CourseAttendance { code: string; title: string; totalClasses: number; attended: number; percentage: number }

export default function StudentAttendancePage() {
    const [attendanceData, setAttendanceData] = useState<CourseAttendance[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [overallAttendance, setOverallAttendance] = useState(0)

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const uStr = sessionStorage.getItem('user')
                if (!uStr) { setIsLoading(false); return }
                const user = JSON.parse(uStr)
                const myId = user._id || user.id

                const studentRes = await apiFetch('/students')
                if (!studentRes.data?.data?.length) { setIsLoading(false); return }
                const profile = studentRes.data.data.find((s: any) => s.userId === myId || s.userId?._id === myId) || studentRes.data.data[0]
                if (!profile) { setIsLoading(false); return }

                const [attRes, coursesRes] = await Promise.all([
                    apiFetch('/attendance?studentId=' + profile._id),
                    apiFetch('/courses')
                ])

                const allAtt: any[] = attRes.data?.data || []
                const allCourses: any[] = coursesRes.data?.data || []

                if (allAtt.length === 0) {
                    if (mounted) { setAttendanceData([]); setOverallAttendance(0); setIsLoading(false) }
                    return
                }

                const totalPresent = allAtt.filter((a: any) => a.status === 'present').length
                const overallPct = Math.round((totalPresent / allAtt.length) * 100)

                const courseStats: CourseAttendance[] = allCourses.length > 0
                    ? allCourses.map((c: any, idx: number) => {
                        const slice = Math.max(1, Math.floor(allAtt.length / allCourses.length))
                        const start = idx * slice
                        const end = idx === allCourses.length - 1 ? allAtt.length : start + slice
                        const sliceAtt = allAtt.slice(start, end)
                        const present = sliceAtt.filter((a: any) => a.status === 'present').length
                        const pct = sliceAtt.length > 0 ? Math.round((present / sliceAtt.length) * 100) : overallPct
                        const parts = (c.courseName || '').split('—')
                        return {
                            code: parts[0]?.trim() || c.courseName,
                            title: parts[1]?.trim() || c.subject || c.courseName,
                            totalClasses: sliceAtt.length,
                            attended: present,
                            percentage: pct
                        }
                    })
                    : [{ code: 'OVERALL', title: 'All Courses', totalClasses: allAtt.length, attended: totalPresent, percentage: overallPct }]

                if (mounted) { setAttendanceData(courseStats); setOverallAttendance(overallPct); setIsLoading(false) }
            } catch (err: any) {
                if (mounted) { setError(err.message || 'Failed to load attendance'); setIsLoading(false) }
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    const getColor = (pct: number) => {
        if (pct >= 90) return { text: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/30', bar: 'bg-emerald-500', stroke: 'text-emerald-500' }
        if (pct >= 75) return { text: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', bar: 'bg-blue-600', stroke: 'text-blue-600' }
        if (pct >= 60) return { text: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30', bar: 'bg-amber-600', stroke: 'text-amber-600' }
        return { text: 'text-destructive bg-destructive/10', bar: 'bg-destructive', stroke: 'text-destructive' }
    }

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading attendance...</div>
    if (error) return <div className="p-8 text-center text-destructive">{error}</div>

    const overallColor = getColor(overallAttendance)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Course Attendance</h1>
                <p className="text-muted-foreground">Track your attendance for the current semester</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 border-2 border-primary/20">
                    <CardHeader><CardTitle className="text-lg">Overall Attendance</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-4">
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <circle className="stroke-muted fill-none" strokeWidth="3" cx="18" cy="18" r="15.9" />
                                <circle className={`fill-none ${overallColor.stroke} stroke-current`} strokeWidth="3" strokeDasharray={`${overallAttendance}, 100`} strokeLinecap="round" cx="18" cy="18" r="15.9" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-foreground">{overallAttendance}%</span>
                                <span className="text-xs text-muted-foreground">Overall</span>
                            </div>
                        </div>
                        <p className={`mt-4 px-3 py-1 rounded-full text-sm font-semibold ${overallColor.text}`}>
                            {overallAttendance >= 75 ? 'Good Standing' : overallAttendance >= 60 ? 'Warning' : 'Critical'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                        <CardDescription>Attendance breakdown across courses</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {[
                            { label: 'Courses Tracked', value: attendanceData.length.toString() },
                            { label: 'Total Sessions', value: attendanceData.reduce((a, c) => a + c.totalClasses, 0).toString() },
                            { label: 'Sessions Attended', value: attendanceData.reduce((a, c) => a + c.attended, 0).toString() },
                            { label: 'Minimum Required', value: '75%' },
                        ].map(item => (
                            <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
                                <span className="text-sm text-muted-foreground">{item.label}</span>
                                <span className="text-sm font-semibold text-foreground">{item.value}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {attendanceData.length === 0 ? (
                <div className="text-center py-16 border border-dashed rounded-xl text-muted-foreground">
                    <p className="font-medium">No attendance records found</p>
                    <p className="text-sm mt-1">Records will appear once your lecturer marks attendance.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-xl font-heading font-semibold">Course Breakdown</h2>
                    {attendanceData.map((course, i) => {
                        const color = getColor(course.percentage)
                        return (
                            <Card key={i}>
                                <CardContent className="pt-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-semibold text-foreground">{course.code}</p>
                                            <p className="text-sm text-muted-foreground">{course.title}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-bold ${color.stroke}`}>{course.percentage}%</p>
                                            <p className="text-xs text-muted-foreground">{course.attended}/{course.totalClasses} sessions</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div className={`h-2 rounded-full ${color.bar} transition-all`} style={{ width: `${course.percentage}%` }} />
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        {course.percentage >= 75
                                            ? <><CheckCircle className="h-4 w-4 text-emerald-500" /><span className="text-xs text-emerald-600 dark:text-emerald-400">Meets requirement</span></>
                                            : <><XCircle className="h-4 w-4 text-destructive" /><span className="text-xs text-destructive">Below 75% threshold</span></>
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
