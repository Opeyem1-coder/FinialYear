'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiFetch } from '@/lib/api'

interface CourseAttendance {
    code: string
    title: string
    totalClasses: number
    attended: number
    percentage: number
}

export default function StudentAttendancePage() {
    const [attendanceData, setAttendanceData] = useState<CourseAttendance[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [overallAttendance, setOverallAttendance] = useState(0)

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const isMock = localStorage.getItem('useMockData') === 'true'
                if (isMock) {
                    const mockData = [
                        { code: 'CSC 301', title: 'Data Structures', totalClasses: 24, attended: 22, percentage: 91 },
                        { code: 'CSC 305', title: 'Operating Systems', totalClasses: 20, attended: 19, percentage: 95 },
                        { code: 'MTH 201', title: 'Linear Algebra', totalClasses: 28, attended: 20, percentage: 71 },
                        { code: 'PHY 203', title: 'General Physics III', totalClasses: 18, attended: 17, percentage: 94 },
                        { code: 'GST 201', title: 'Communication Skills', totalClasses: 12, attended: 12, percentage: 100 },
                    ]
                    if (mounted) {
                        setAttendanceData(mockData)
                        setOverallAttendance(Math.round(mockData.reduce((acc, c) => acc + c.percentage, 0) / mockData.length))
                        setIsLoading(false)
                    }
                    return
                }

                const uStr = sessionStorage.getItem('user')
                if (!uStr) { setIsLoading(false); return }
                const user = JSON.parse(uStr)
                const myId = user._id || user.id

                const studentRes = await apiFetch('/students')
                if (studentRes.isMock || !studentRes.data?.data?.length) { setIsLoading(false); return }
                const profile = studentRes.data.data.find((s: any) => s.userId === myId) || studentRes.data.data[0]
                if (!profile) { setIsLoading(false); return }

                const [attRes, coursesRes] = await Promise.all([
                    apiFetch('/attendance?studentId=' + profile._id),
                    apiFetch('/courses')
                ])

                if (!attRes.isMock) {
                    const allAtt: any[] = attRes.data.data || []
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

                    if (mounted) { setAttendanceData(courseStats); setOverallAttendance(overallPct) }
                }

                if (mounted) setIsLoading(false)
            } catch (err) {
                console.error(err)
                if (mounted) setIsLoading(false)
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

    const overallColor = getColor(overallAttendance)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Course Attendance</h1>
                <p className="text-muted-foreground">Track your attendance for the current semester</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader><CardTitle>Overall Attendance</CardTitle><CardDescription>Current Semester</CardDescription></CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle className="text-muted stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                                <circle className={`${overallColor.stroke} stroke-current`} strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${overallAttendance * 2.51} 251.2`} />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold">{overallAttendance}%</span>
                                <span className="text-xs text-muted-foreground mt-1">Present</span>
                            </div>
                        </div>
                        {overallAttendance >= 75
                            ? <Badge variant="success" className="mt-6 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Minimum met</Badge>
                            : <Badge variant="destructive" className="mt-6 flex items-center gap-1"><XCircle className="w-3 h-3" /> Below minimum</Badge>
                        }
                        {attendanceData.length === 0 && <p className="text-xs text-muted-foreground mt-4 text-center">No attendance records yet.</p>}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader><CardTitle>Attendance by Course</CardTitle><CardDescription>75% minimum attendance required for exams</CardDescription></CardHeader>
                    <CardContent>
                        {attendanceData.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg">
                                No attendance records found yet. Records will appear once your lecturers mark attendance.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {attendanceData.map((course) => {
                                    const c = getColor(course.percentage)
                                    return (
                                        <div key={course.code}>
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm">{course.code}</span>
                                                    <span className="text-sm text-muted-foreground hidden sm:inline">— {course.title}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-muted-foreground">{course.attended} / {course.totalClasses} classes</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.text}`}>{course.percentage}%</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div className={`h-2 rounded-full transition-all ${c.bar}`} style={{ width: `${course.percentage}%` }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
