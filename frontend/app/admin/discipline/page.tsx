'use client'

import { useState, useEffect } from 'react'
import { Search, Download, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PillButton } from '@/components/ui/pill-button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface DiscRow {
    _id: string
    studentName: string
    studentId: string
    teacherName: string
    incidentType: string
    description: string
    actionTaken: string
    date: string
}

const SEVERITY: Record<string, string> = {
    'Late': 'bg-amber-100 text-amber-700 border-amber-200',
    'Misconduct': 'bg-orange-100 text-orange-700 border-orange-200',
    'Cheating': 'bg-red-100 text-red-700 border-red-200',
    'Absence': 'bg-blue-100 text-blue-700 border-blue-200',
    'Disrespect': 'bg-rose-100 text-rose-700 border-rose-200',
}

export default function AdminDisciplinePage() {
    const [records, setRecords] = useState<DiscRow[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const res = await apiFetch('/discipline')
            if (res.isMock) {
                setRecords([
                    { _id: '1', studentName: 'Liam Johnson', studentId: 'STU2024002', teacherName: 'Dr. Smith', incidentType: 'Late', description: 'Arrived 30 minutes late without notification', actionTaken: 'Verbal warning issued', date: '2024-03-15' },
                    { _id: '2', studentName: 'Olivia Brown', studentId: 'STU2024003', teacherName: 'Prof. Davis', incidentType: 'Misconduct', description: 'Disrupted class during exam preparation', actionTaken: 'Written warning sent to parent', date: '2024-03-10' },
                    { _id: '3', studentName: 'Noah Wilson', studentId: 'STU2024004', teacherName: 'Dr. Smith', incidentType: 'Cheating', description: 'Found with unauthorized material during quiz', actionTaken: 'Grade forfeited, parent notified', date: '2024-03-08' },
                ])
            } else {
                setRecords((res.data?.data || []).map((d: any) => ({
                    _id: d._id,
                    studentName: d.studentId ? `${d.studentId.firstName} ${d.studentId.lastName}` : 'Unknown',
                    studentId: d.studentId?.studentId || '—',
                    teacherName: d.teacherId ? `${d.teacherId.firstName} ${d.teacherId.lastName}` : 'Unknown',
                    incidentType: d.incidentType,
                    description: d.description,
                    actionTaken: d.actionTaken,
                    date: new Date(d.date).toLocaleDateString()
                })))
            }
        } catch { toast.error('Failed to load discipline records') }
        finally { setIsLoading(false) }
    }

    const allTypes = Array.from(new Set(records.map(r => r.incidentType)))

    const filtered = records.filter(r => {
        const matchesSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filterType === 'all' || r.incidentType === filterType
        return matchesSearch && matchesType
    })

    const exportCSV = () => {
        const rows = [
            ['Student Name', 'Student ID', 'Reported By', 'Incident Type', 'Description', 'Action Taken', 'Date'],
            ...filtered.map(r => [r.studentName, r.studentId, r.teacherName, r.incidentType, `"${r.description}"`, `"${r.actionTaken}"`, r.date])
        ]
        const csv = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'discipline_report.csv'; a.click()
        URL.revokeObjectURL(url)
        toast.success('Discipline records exported as CSV')
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Discipline Records</h1>
                    <p className="text-muted-foreground">System-wide behavioral incident log across all students</p>
                </div>
                <PillButton onClick={exportCSV}><Download className="h-5 w-5 mr-2" />Export CSV</PillButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card><CardHeader className="pb-3"><CardDescription>Total Incidents</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold">{filtered.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Students Involved</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold text-amber-600">{new Set(filtered.map(r => r.studentId)).size}</div></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Most Common</CardDescription></CardHeader><CardContent>
                    <div className="text-xl font-bold text-foreground">
                        {filtered.length > 0
                            ? Object.entries(filtered.reduce((acc, r) => { acc[r.incidentType] = (acc[r.incidentType] || 0) + 1; return acc }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
                            : '—'}
                    </div>
                </CardContent></Card>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                            <Input placeholder="Search by student, ID, or teacher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setFilterType('all')} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${filterType === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}>All</button>
                            {allTypes.map(t => (
                                <button key={t} onClick={() => setFilterType(t)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${filterType === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>All Incidents</CardTitle><CardDescription>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</CardDescription></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Reported By</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead>Action Taken</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading records...</TableCell></TableRow>
                                ) : filtered.length > 0 ? filtered.map(r => (
                                    <TableRow key={r._id}>
                                        <TableCell>
                                            <div className="font-medium">{r.studentName}</div>
                                            <div className="text-xs text-muted-foreground">{r.studentId}</div>
                                        </TableCell>
                                        <TableCell className="text-sm">{r.teacherName}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${SEVERITY[r.incidentType] || 'bg-muted text-muted-foreground border-border'}`}>
                                                <AlertTriangle className="h-3 w-3 mr-1" />{r.incidentType}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm max-w-xs truncate">{r.description}</TableCell>
                                        <TableCell className="text-sm max-w-xs truncate text-muted-foreground">{r.actionTaken}</TableCell>
                                        <TableCell className="text-sm">{r.date}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No discipline records found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
