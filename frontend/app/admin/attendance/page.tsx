'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PillButton } from '@/components/ui/pill-button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface AttRow { _id: string; studentName: string; studentId: string; date: string; status: 'present' | 'absent' | 'late'; notes: string }

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
            setRecords((res.data?.data || []).map((a: any) => ({
                _id: a._id,
                studentName: a.studentId ? `${a.studentId.firstName} ${a.studentId.lastName}` : 'Unknown',
                studentId: a.studentId?.studentId || '—',
                date: new Date(a.date).toLocaleDateString(),
                status: a.status,
                notes: a.notes || ''
            })))
        } catch { toast.error('Failed to load attendance') }
        finally { setIsLoading(false) }
    }

    const filtered = records.filter(r => {
        const matchesSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || r.studentId.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'all' || r.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const exportCSV = () => {
        const csv = [['Student', 'ID', 'Date', 'Status', 'Notes'], ...filtered.map(r => [r.studentName, r.studentId, r.date, r.status, r.notes])].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'attendance_report.csv'; a.click(); URL.revokeObjectURL(url)
    }

    const statusBadge = (status: string) => {
        if (status === 'present') return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Present</Badge>
        if (status === 'late') return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">Late</Badge>
        return <Badge variant="destructive">Absent</Badge>
    }

    const totalPresent = records.filter(r => r.status === 'present').length
    const totalAbsent = records.filter(r => r.status === 'absent').length
    const totalLate = records.filter(r => r.status === 'late').length

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Attendance Overview</h1>
                    <p className="text-muted-foreground">View and monitor all attendance records</p>
                </div>
                <PillButton variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Export CSV</PillButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card><CardHeader className="pb-2"><CardDescription>Total Present</CardDescription></CardHeader><CardContent><p className="text-4xl font-bold text-emerald-500">{totalPresent}</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardDescription>Total Absent</CardDescription></CardHeader><CardContent><p className="text-4xl font-bold text-destructive">{totalAbsent}</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardDescription>Total Late</CardDescription></CardHeader><CardContent><p className="text-4xl font-bold text-amber-500">{totalLate}</p></CardContent></Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Attendance Records</CardTitle>
                    <CardDescription>{filtered.length} record{filtered.length !== 1 ? 's' : ''} shown</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by student name or ID..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full md:w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="late">Late</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <p className="text-center py-8 text-muted-foreground animate-pulse">Loading records...</p>
                    ) : filtered.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No records found.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(r => (
                                    <TableRow key={r._id}>
                                        <TableCell className="font-medium">{r.studentName}</TableCell>
                                        <TableCell className="font-mono text-sm">{r.studentId}</TableCell>
                                        <TableCell>{r.date}</TableCell>
                                        <TableCell>{statusBadge(r.status)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{r.notes || '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
