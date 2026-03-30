'use client'

import { useState } from 'react'
import { Download, Users, BookOpen, ClipboardList, AlertTriangle, BarChart3, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface ReportCard {
    title: string
    description: string
    icon: React.ReactNode
    color: string
    endpoint: string
    filename: string
    buildRows: (data: any[]) => (string | number)[][]
    headers: string[]
}

export default function AdminReportsPage() {
    const [loading, setLoading] = useState<string | null>(null)

    const downloadCSV = (headers: string[], rows: (string | number)[][], filename: string) => {
        const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
        URL.revokeObjectURL(url)
    }

    const generateReport = async (report: ReportCard) => {
        setLoading(report.title)
        try {
            const res = await apiFetch(report.endpoint)
            const data = res.data?.data || []
            if (data.length === 0) { toast.info('No data available for this report.'); return }
            const rows = report.buildRows(data)
            downloadCSV(report.headers, rows, report.filename)
            toast.success(`${report.title} downloaded! (${rows.length} rows)`)
        } catch (err: any) {
            toast.error(`Failed to generate ${report.title}: ${err.message || 'API error'}`)
        } finally {
            setLoading(null)
        }
    }

    const reports: ReportCard[] = [
        {
            title: 'Full User Report',
            description: 'All registered users — names, emails, roles, and join dates.',
            icon: <Users className="h-8 w-8" />,
            color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            endpoint: '/users', filename: 'users_report.csv',
            headers: ['Name', 'Email', 'Role', 'Date Joined'],
            buildRows: (data) => data.map((u: any) => [`${u.firstName} ${u.lastName}`, u.email || u.username, u.role, new Date(u.createdAt).toLocaleDateString()])
        },
        {
            title: 'Student Roster',
            description: 'All enrolled students with program, level, and student ID.',
            icon: <GraduationCap className="h-8 w-8" />,
            color: 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-500',
            endpoint: '/students', filename: 'students_roster.csv',
            headers: ['Student ID', 'Name', 'Program', 'Level', 'Date Enrolled'],
            buildRows: (data) => data.map((s: any) => [s.studentId, `${s.firstName} ${s.lastName}`, s.program || 'General', s.level || '100 Level', new Date(s.createdAt).toLocaleDateString()])
        },
        {
            title: 'Course Report',
            description: 'All active courses with assigned lecturers and departments.',
            icon: <BookOpen className="h-8 w-8" />,
            color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
            endpoint: '/courses', filename: 'courses_report.csv',
            headers: ['Course Name', 'Subject', 'Lecturer', 'Date Created'],
            buildRows: (data) => data.map((c: any) => [c.courseName, c.subject, c.teacherId ? `${c.teacherId.firstName} ${c.teacherId.lastName}` : 'Unassigned', new Date(c.createdAt).toLocaleDateString()])
        },
        {
            title: 'Grades Report',
            description: 'All submitted assessment grades across all courses.',
            icon: <BarChart3 className="h-8 w-8" />,
            color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            endpoint: '/grades', filename: 'grades_report.csv',
            headers: ['Student', 'Course', 'Assessment', 'Score', 'Total', 'Date'],
            buildRows: (data) => data.map((g: any) => [
                g.studentId ? `${g.studentId.firstName} ${g.studentId.lastName}` : '—',
                g.courseId?.courseName || '—', g.assignmentName, g.score, g.totalPoints,
                new Date(g.createdAt).toLocaleDateString()
            ])
        },
        {
            title: 'Attendance Report',
            description: 'Full attendance log with student, date, and status.',
            icon: <ClipboardList className="h-8 w-8" />,
            color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
            endpoint: '/attendance', filename: 'attendance_report.csv',
            headers: ['Student', 'Student ID', 'Date', 'Status', 'Notes'],
            buildRows: (data) => data.map((a: any) => [
                a.studentId ? `${a.studentId.firstName} ${a.studentId.lastName}` : '—',
                a.studentId?.studentId || '—', new Date(a.date).toLocaleDateString(), a.status, a.notes || ''
            ])
        },
        {
            title: 'Discipline Report',
            description: 'All discipline incidents and commendations filed by lecturers.',
            icon: <AlertTriangle className="h-8 w-8" />,
            color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
            endpoint: '/discipline', filename: 'discipline_report.csv',
            headers: ['Student', 'Student ID', 'Reported By', 'Incident Type', 'Description', 'Action Taken', 'Date'],
            buildRows: (data) => data.map((d: any) => [
                d.studentId ? `${d.studentId.firstName} ${d.studentId.lastName}` : '—',
                d.studentId?.studentId || '—',
                d.teacherId ? `${d.teacherId.firstName} ${d.teacherId.lastName}` : '—',
                d.incidentType, d.description, d.actionTaken,
                new Date(d.date || d.createdAt).toLocaleDateString()
            ])
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Reports</h1>
                <p className="text-muted-foreground">Download CSV reports from live system data</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map(report => (
                    <Card key={report.title} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className={`inline-flex p-3 rounded-xl mb-3 w-fit ${report.color}`}>
                                {report.icon}
                            </div>
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            <CardDescription className="text-sm">{report.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PillButton
                                fullWidth
                                variant="outline"
                                onClick={() => generateReport(report)}
                                disabled={loading === report.title}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                {loading === report.title ? 'Generating...' : 'Download CSV'}
                            </PillButton>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
