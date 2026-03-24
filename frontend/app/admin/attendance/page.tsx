'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PillButton } from '@/components/ui/pill-button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface AttRow {
    _id: string
    studentName: string
    studentId: string
    date: string
    status: 'present' | 'absent' | 'late'
    notes: string
}

export default function AdminAttendancePage() {
    const [records, setRecords] = useState<AttRow[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const res = await apiFetch('/attendance')
            if (res.isMock) {
                setRecords([
                    { _id: '1', studentName: 'Emma Smith', studentId: 'STU2024001', date: '2024-03-15', status: 'present', notes: '' },
                    { _id: '2', studentName: 'Liam Johnson', studentId: 'STU2024002', date: '2024-03-15', status: 'absent', notes: 'No notification' },
                    { _id: '3', studentName: 'Olivia Brown', studentId: 'STU2024003', date: '2024-03-15', status: 'late', notes: 'Arrived 20min late' },
                    { _id: '4', studentName: 'Noah Wilson', studentId: 'STU2024004', date: '2024-03-14', status: 'present', notes: '' },
                    { _id: '5', studentName: 'Ava Davis', studentId: 'STU2024005', date: '2024-03-14', status: 'absent', notes: '' },
                ])
            } else {
                setRecords((res.data?.data || []).map((a: any) => ({
                    _id: a._id,
                    studentName: a.studentId ? `${a.studentId.firstName} ${a.studentId.lastName}` : 'Unknown',
                    studentId: a.studentId?.studentId || '—',
                    date: new Date(a.date).toLocaleDateString(),
                    status: a.status,
                    notes: a.notes || ''
                })))
            }
        } catch { toast.error('Failed to load attendance') }
        finally { setIsLoading(false) }
    }

    const filtered = records.filter(r => {
        const matchesSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || r.studentId.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'all' || r.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const presentCount = filtered.filter(r => r.status === 'present').length
    const absentCount = filtered.filter(r => r.status === 'absent').length
    const lateCount = filtered.filter(r => r.status === 'late').length
    const attendanceRate = filtered.length > 0 ? ((presentCount + lateCount) / filtered.length * 100).toFixed(1) : '—'

    const statusBadge = (status: string) => {
        if (status === 'present') return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Present</Badge>
        if (status === 'late') return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Late</Badge>
        return <Badge variant="destructive">Absent</Badge>
    }

    const exportCSV = () => {
        const rows = [
            ['Student Name', 'Student ID', 'Date', 'Status', 'Notes'],
            ...filtered.map(r => [r.studentName, r.studentId, r.date, r.status, r.notes])
        ]
        const csv = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'attendance_report.csv'; a.click()
        URL.revokeObjectURL(url)
        toast.success('Attendance exported as CSV')
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Attendance Overview</h1>
                    <p className="text-muted-foreground">System-wide attendance records across all students</p>
                </div>
                <PillButton onClick={exportCSV}><Download className="h-5 w-5 mr-2" />Export CSV</PillButton>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card><CardHeader className="pb-3"><CardDescription>Attendance Rate</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold text-emerald-500">{attendanceRate}{attendanceRate !== '—' ? '%' : ''}</div></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Present</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold text-emerald-500">{presentCount}</div></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Absent</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold text-destructive">{absentCount}</div></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Late</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold text-amber-600">{lateCount}</div></CardContent></Card>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                            <Input placeholder="Search by student name or ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'present', 'absent', 'late'].map(s => (
                                <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>All Attendance Records</CardTitle><CardDescription>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</CardDescription></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading attendance...</TableCell></TableRow>
                                ) : filtered.length > 0 ? filtered.map(r => (
                                    <TableRow key={r._id}>
                                        <TableCell>
                                            <div className="font-medium">{r.studentName}</div>
                                            <div className="text-xs text-muted-foreground">{r.studentId}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />{r.date}</div>
                                        </TableCell>
                                        <TableCell>{statusBadge(r.status)}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{r.notes || '—'}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No attendance records found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
