'use client'

import { useState, useEffect } from 'react'
import { Search, Download, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PillButton } from '@/components/ui/pill-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface DiscRow { _id: string; studentName: string; studentId: string; teacherName: string; incidentType: string; description: string; actionTaken: string; date: string }

const SEVERITY: Record<string, string> = {
    'Late': 'bg-amber-100 text-amber-700 border-amber-200',
    'Misconduct': 'bg-orange-100 text-orange-700 border-orange-200',
    'Cheating': 'bg-red-100 text-red-700 border-red-200',
    'Absence': 'bg-blue-100 text-blue-700 border-blue-200',
    'Disrespect': 'bg-rose-100 text-rose-700 border-rose-200',
    'Positive Commendation': 'bg-emerald-100 text-emerald-700 border-emerald-200',
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
            setRecords((res.data?.data || []).map((d: any) => ({
                _id: d._id,
                studentName: d.studentId ? `${d.studentId.firstName} ${d.studentId.lastName}` : 'Unknown',
                studentId: d.studentId?.studentId || '—',
                teacherName: d.teacherId ? `${d.teacherId.firstName} ${d.teacherId.lastName}` : 'Unknown',
                incidentType: d.incidentType,
                description: d.description,
                actionTaken: d.actionTaken,
                date: new Date(d.date || d.createdAt).toLocaleDateString()
            })))
        } catch { toast.error('Failed to load discipline records') }
        finally { setIsLoading(false) }
    }

    const incidentTypes = [...new Set(records.map(r => r.incidentType))]
    const filtered = records.filter(r => {
        const matchesSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || r.studentId.toLowerCase().includes(searchQuery.toLowerCase()) || r.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filterType === 'all' || r.incidentType === filterType
        return matchesSearch && matchesType
    })

    const exportCSV = () => {
        const csv = [['Student', 'ID', 'Reported By', 'Incident', 'Description', 'Action', 'Date'], ...filtered.map(r => [r.studentName, r.studentId, r.teacherName, r.incidentType, r.description, r.actionTaken, r.date])].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'discipline_report.csv'; a.click(); URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Discipline Records</h1>
                    <p className="text-muted-foreground">View all student discipline incidents and commendations</p>
                </div>
                <PillButton variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Export CSV</PillButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card><CardHeader className="pb-2"><CardDescription>Total Records</CardDescription></CardHeader><CardContent><p className="text-4xl font-bold text-foreground">{records.length}</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardDescription>Commendations</CardDescription></CardHeader><CardContent><p className="text-4xl font-bold text-emerald-500">{records.filter(r => r.incidentType === 'Positive Commendation').length}</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardDescription>Incidents</CardDescription></CardHeader><CardContent><p className="text-4xl font-bold text-destructive">{records.filter(r => r.incidentType !== 'Positive Commendation').length}</p></CardContent></Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />All Records</CardTitle>
                    <CardDescription>{filtered.length} records shown</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search student, ID, or teacher..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {incidentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
                                    <TableHead>Reported By</TableHead>
                                    <TableHead>Incident</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(r => (
                                    <TableRow key={r._id}>
                                        <TableCell>
                                            <p className="font-medium">{r.studentName}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{r.studentId}</p>
                                        </TableCell>
                                        <TableCell className="text-sm">{r.teacherName}</TableCell>
                                        <TableCell>
                                            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${SEVERITY[r.incidentType] || 'bg-muted text-muted-foreground border-border'}`}>{r.incidentType}</span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{r.description}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{r.date}</TableCell>
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
