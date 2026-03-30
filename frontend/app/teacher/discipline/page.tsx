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
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

const INCIDENT_TYPES = ['Late', 'Absent Without Notice', 'Misconduct', 'Disruptive Behaviour', 'Cheating', 'Positive Commendation', 'Other']
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
    const [form, setForm] = useState({ studentId: '', incidentType: 'Late', description: '', actionTaken: '', date: new Date().toISOString().split('T')[0] })

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [discRes, studRes] = await Promise.all([apiFetch('/discipline'), apiFetch('/students')])
            setRecords(discRes.data?.data || [])
            setStudents(studRes.data?.data || [])
        } catch { toast.error('Failed to load discipline records') }
        finally { setIsLoading(false) }
    }

    const handleSubmit = async () => {
        if (!form.studentId || !form.description || !form.actionTaken) { toast.error('Please fill in all required fields'); return }
        setIsSaving(true)
        try {
            await apiFetch('/discipline', { method: 'POST', body: JSON.stringify(form) })
            toast.success('Discipline record saved')
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
            setRecords(prev => prev.filter(r => r._id !== id))
        } catch { toast.error('Failed to delete record') }
    }

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading discipline records...</div>

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Discipline</h1>
                    <p className="text-muted-foreground">File and manage student discipline & commendation records</p>
                </div>
                <PillButton onClick={() => setIsOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />New Record
                </PillButton>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Records</CardTitle>
                    <CardDescription>{records.length} record{records.length !== 1 ? 's' : ''} this semester</CardDescription>
                </CardHeader>
                <CardContent>
                    {records.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No discipline records</p>
                            <p className="text-sm mt-1">File a record using the button above.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Incident</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.map((r: any) => (
                                    <TableRow key={r._id}>
                                        <TableCell className="font-medium">
                                            {r.studentId?.firstName} {r.studentId?.lastName}
                                            <p className="text-xs text-muted-foreground">{r.studentId?.studentId}</p>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${SEVERITY[r.incidentType] || SEVERITY['Other']}`}>{r.incidentType}</span>
                                        </TableCell>
                                        <TableCell className="max-w-xs text-sm text-muted-foreground truncate">{r.description}</TableCell>
                                        <TableCell className="text-sm">{new Date(r.date || r.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <PillButton variant="ghost" size="sm" onClick={() => handleDelete(r._id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </PillButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>File Discipline Record</DialogTitle>
                        <DialogDescription>Record an incident or commendation for a student.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Student</Label>
                            <Select value={form.studentId} onValueChange={v => setForm(f => ({ ...f, studentId: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select student..." /></SelectTrigger>
                                <SelectContent>{students.map(s => <SelectItem key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.studentId})</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Incident Type</Label>
                            <Select value={form.incidentType} onValueChange={v => setForm(f => ({ ...f, incidentType: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{INCIDENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description <span className="text-destructive">*</span></Label>
                            <Textarea placeholder="Describe the incident..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                        </div>
                        <div className="space-y-2">
                            <Label>Action Taken <span className="text-destructive">*</span></Label>
                            <Textarea placeholder="What action was taken?" value={form.actionTaken} onChange={e => setForm(f => ({ ...f, actionTaken: e.target.value }))} rows={2} />
                        </div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setIsOpen(false)}>Cancel</PillButton>
                        <PillButton onClick={handleSubmit} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Record'}</PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
