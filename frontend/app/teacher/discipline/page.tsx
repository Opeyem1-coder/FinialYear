'use client'

import { useState, useEffect } from 'react'
import { Plus, AlertCircle, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { apiFetch, isMockMode } from '@/lib/api'
import { toast } from 'sonner'

const INCIDENT_TYPES = ['Late', 'Absent Without Notice', 'Misconduct', 'Disruptive Behaviour', 'Cheating', 'Positive Commendation', 'Other']

const MOCK_RECORDS = [
    { _id: '1', studentId: { _id: 'S1', firstName: 'Emma', lastName: 'Smith', studentId: 'STU2024001' }, incidentType: 'Late', description: 'Arrived 15 minutes late without notice.', actionTaken: 'Verbal warning issued.', date: new Date(Date.now() - 86400000).toISOString() },
    { _id: '2', studentId: { _id: 'S2', firstName: 'Liam', lastName: 'Johnson', studentId: 'STU2024002' }, incidentType: 'Positive Commendation', description: 'Outstanding mid-semester project performance.', actionTaken: 'Commendation noted in records.', date: new Date(Date.now() - 172800000).toISOString() },
]

const SEVERITY: Record<string, string> = {
    'Late': 'bg-amber-100 text-amber-700 border-amber-200',
    'Absent Without Notice': 'bg-orange-100 text-orange-700 border-orange-200',
    'Misconduct': 'bg-red-100 text-red-700 border-red-200',
    'Disruptive Behaviour': 'bg-red-100 text-red-700 border-red-200',
    'Cheating': 'bg-rose-100 text-rose-700 border-rose-200',
    'Positive Commendation': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Other': 'bg-muted text-muted-foreground border-border',
}

export default function TeacherDisciplinePage() {
    const [records, setRecords] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const inMock = isMockMode()

    const [form, setForm] = useState({
        studentId: '',
        incidentType: 'Late',
        description: '',
        actionTaken: '',
        date: new Date().toISOString().split('T')[0]
    })

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [discRes, studRes] = await Promise.all([
                apiFetch('/discipline'),
                apiFetch('/students')
            ])

            if (discRes.isMock || inMock) {
                setRecords(MOCK_RECORDS)
                setStudents([
                    { _id: 'S1', firstName: 'Emma', lastName: 'Smith', studentId: 'STU2024001' },
                    { _id: 'S2', firstName: 'Liam', lastName: 'Johnson', studentId: 'STU2024002' },
                ])
            } else {
                setRecords(discRes.data?.data || [])
                setStudents(studRes.data?.data || [])
            }
        } catch { toast.error('Failed to load discipline records') }
        finally { setIsLoading(false) }
    }

    const handleSubmit = async () => {
        if (!form.studentId || !form.description || !form.actionTaken) {
            toast.error('Please fill in all required fields')
            return
        }
        if (inMock) { toast.warning('Switch to Live API to save records.'); return }

        setIsSaving(true)
        try {
            await apiFetch('/discipline', {
                method: 'POST',
                body: JSON.stringify({
                    studentId: form.studentId,
                    incidentType: form.incidentType,
                    description: form.description,
                    actionTaken: form.actionTaken,
                    date: form.date
                })
            })
            toast.success('Discipline record logged successfully')
            setIsOpen(false)
            setForm({ studentId: '', incidentType: 'Late', description: '', actionTaken: '', date: new Date().toISOString().split('T')[0] })
            loadData()
        } catch (err: any) { toast.error(err.message || 'Failed to save record') }
        finally { setIsSaving(false) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this discipline record?')) return
        try {
            await apiFetch(`/discipline/${id}`, { method: 'DELETE' })
            toast.success('Record deleted')
            loadData()
        } catch { toast.error('Failed to delete record') }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Discipline Log</h1>
                    <p className="text-muted-foreground">Record and track student behavioural incidents</p>
                </div>
                <PillButton onClick={() => setIsOpen(true)}>
                    <Plus className="h-5 w-5 mr-2" />Log Incident
                </PillButton>
            </div>

            {/* Log Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Log Discipline Incident</DialogTitle>
                        <DialogDescription>Record a behavioural incident or positive commendation for a student.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>Student</Label>
                                <Select value={form.studentId} onValueChange={v => setForm({ ...form, studentId: v })}>
                                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select student..." /></SelectTrigger>
                                    <SelectContent>
                                        {students.map(s => (
                                            <SelectItem key={s._id} value={s._id}>
                                                {s.firstName} {s.lastName} ({s.studentId})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Incident Type</Label>
                                <Select value={form.incidentType} onValueChange={v => setForm({ ...form, incidentType: v })}>
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {INCIDENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Date</Label>
                                <Input type="date" className="mt-1" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <Label>Description</Label>
                                <Textarea className="mt-1" placeholder="Describe the incident in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <Label>Action Taken</Label>
                                <Textarea className="mt-1" placeholder="What action was taken or recommended..." value={form.actionTaken} onChange={e => setForm({ ...form, actionTaken: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setIsOpen(false)}>Cancel</PillButton>
                        <PillButton onClick={handleSubmit} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Log Incident'}
                        </PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card><CardHeader className="pb-3"><CardDescription>Total Records</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold">{records.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>This Month</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold text-amber-600">{records.filter(r => new Date(r.date || r.createdAt).getMonth() === new Date().getMonth()).length}</div></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Commendations</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold text-emerald-500">{records.filter(r => r.incidentType === 'Positive Commendation').length}</div></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Students Involved</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">{new Set(records.map(r => r.studentId?._id || r.studentId)).size}</div></CardContent></Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader><CardTitle>All Records</CardTitle><CardDescription>{records.length} total incident{records.length !== 1 ? 's' : ''}</CardDescription></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow><TableHead>Student</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead>Action Taken</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading records...</TableCell></TableRow>
                                ) : records.length > 0 ? records.map(r => (
                                    <TableRow key={r._id}>
                                        <TableCell>
                                            <div className="font-medium">{r.studentId?.firstName} {r.studentId?.lastName}</div>
                                            <div className="text-xs text-muted-foreground">{r.studentId?.studentId}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${SEVERITY[r.incidentType] || SEVERITY['Other']}`}>
                                                <AlertCircle className="h-3 w-3 mr-1" />{r.incidentType}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-xs"><p className="text-sm truncate">{r.description}</p></TableCell>
                                        <TableCell className="max-w-xs"><p className="text-sm text-muted-foreground truncate">{r.actionTaken}</p></TableCell>
                                        <TableCell className="text-sm whitespace-nowrap">{new Date(r.date || r.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <button onClick={() => handleDelete(r._id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No discipline records yet. Click "Log Incident" to add one.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
