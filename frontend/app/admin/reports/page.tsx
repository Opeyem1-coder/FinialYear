'use client'

import { useState } from 'react'
import { Download, FileText, Users, BookOpen, ClipboardList, AlertTriangle, BarChart3 } from 'lucide-react'
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
            if (res.isMock) { toast.warning('Switch to Live API to generate real reports.'); return }
            const data = res.data?.data || []
            const rows = report.buildRows(data)
            downloadCSV(report.headers, rows, report.filename)
            toast.success(`${report.title} downloaded!`)
        } catch { toast.error(`Failed to generate ${report.title}`) }
        finally { setLoading(null) }
    }

    const reports: ReportCard[] = [
        {
            title: 'Full User Report',
            description: 'All registered users across every role — names, emails, roles, and join dates.',
            icon: <Users className="h-8 w-8" />,
            color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            endpoint: '/users',
            filename: 'users_report.csv',
            headers: ['Name', 'Email', 'Role', 'Date Joined'],
            buildRows: (data) => data.map((u: any) => [
                `${u.firstName} ${u.lastName}`,
                u.email || u.username,
                u.role,
                new Date(u.createdAt).toLocaleDateString()
            ])
        },
        {
            title: 'Student Roster',
            description: 'All enrolled students with their programs, levels, and linked parent info.',
            icon: <Users className="h-8 w-8" />,
            color: 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-500 dark:text-emerald-400',
            endpoint: '/students',
            filename: 'student_roster.csv',
            headers: ['Student ID', 'First Name', 'Last Name', 'Program', 'Level', 'Linked Parents'],
            buildRows: (data) => data.map((s: any) => [
                s.studentId,
                s.firstName,
                s.lastName,
                s.program || 'General',
                s.level || '100 Level',
                (s.parentIds || []).map((p: any) => `${p.firstName} ${p.lastName}`).join('; ')
            ])
        },
        {
            title: 'Course Catalogue',
            description: 'All active courses with their subjects and assigned lecturers.',
            icon: <BookOpen className="h-8 w-8" />,
            color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
            endpoint: '/courses',
            filename: 'course_catalogue.csv',
            headers: ['Course Name', 'Subject', 'Assigned Lecturer', 'Date Created'],
            buildRows: (data) => data.map((c: any) => [
                c.courseName,
                c.subject,
                c.teacherId ? `${c.teacherId.firstName} ${c.teacherId.lastName}` : 'Unassigned',
                new Date(c.createdAt).toLocaleDateString()
            ])
        },
        {
            title: 'Grades Report',
            description: 'All grade records system-wide with student names, scores, and assessment types.',
            icon: <BarChart3 className="h-8 w-8" />,
            color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            endpoint: '/grades',
            filename: 'grades_report.csv',
            headers: ['Student Name', 'Student ID', 'Course', 'Assessment', 'Score', 'Total', 'Percentage'],
            buildRows: (data) => data.map((g: any) => [
                g.studentId ? `${g.studentId.firstName} ${g.studentId.lastName}` : 'Unknown',
                g.studentId?.studentId || '—',
                g.courseId?.courseName || '—',
                g.assignmentName,
                g.score,
                g.totalPoints,
                `${(g.score / g.totalPoints * 100).toFixed(1)}%`
            ])
        },
        {
            title: 'Attendance Report',
            description: 'All attendance records with dates, statuses, and any notes from lecturers.',
            icon: <ClipboardList className="h-8 w-8" />,
            color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
            endpoint: '/attendance',
            filename: 'attendance_report.csv',
            headers: ['Student Name', 'Student ID', 'Date', 'Status', 'Notes'],
            buildRows: (data) => data.map((a: any) => [
                a.studentId ? `${a.studentId.firstName} ${a.studentId.lastName}` : 'Unknown',
                a.studentId?.studentId || '—',
                new Date(a.date).toLocaleDateString(),
                a.status,
                a.notes || ''
            ])
        },
        {
            title: 'Discipline Report',
            description: 'All logged behavioral incidents with types, descriptions, and actions taken.',
            icon: <AlertTriangle className="h-8 w-8" />,
            color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
            endpoint: '/discipline',
            filename: 'discipline_report.csv',
            headers: ['Student Name', 'Student ID', 'Reported By', 'Incident Type', 'Description', 'Action Taken', 'Date'],
            buildRows: (data) => data.map((d: any) => [
                d.studentId ? `${d.studentId.firstName} ${d.studentId.lastName}` : 'Unknown',
                d.studentId?.studentId || '—',
                d.teacherId ? `${d.teacherId.firstName} ${d.teacherId.lastName}` : 'Unknown',
                d.incidentType,
                d.description,
                d.actionTaken,
                new Date(d.date).toLocaleDateString()
            ])
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Reports & Exports</h1>
                <p className="text-muted-foreground">Generate and download CSV reports for any module in the system</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {reports.map(report => (
                    <Card key={report.title} className="hover:shadow-md transition-shadow flex flex-col">
                        <CardHeader className="pb-4">
                            <div className={`w-14 h-14 rounded-xl ${report.color} flex items-center justify-center mb-3`}>
                                {report.icon}
                            </div>
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            <CardDescription className="text-sm leading-relaxed">{report.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto">
                            <PillButton
                                fullWidth
                                onClick={() => generateReport(report)}
                                disabled={loading === report.title}
                                variant="outline"
                            >
                                {loading === report.title ? (
                                    <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Generating...</span>
                                ) : (
                                    <span className="flex items-center gap-2"><Download className="h-4 w-4" />Download CSV</span>
                                )}
                            </PillButton>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-dashed">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="bg-muted rounded-full p-3 flex-shrink-0"><FileText className="h-6 w-6 text-muted-foreground" /></div>
                    <div>
                        <p className="font-medium text-foreground">All reports are exported as CSV files</p>
                        <p className="text-sm text-muted-foreground mt-0.5">Compatible with Microsoft Excel, Google Sheets, and any spreadsheet application. Reports reflect live data from the database at the time of download.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
