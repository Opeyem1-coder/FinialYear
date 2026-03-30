'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PillButton } from '@/components/ui/pill-button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Search, Plus, Users, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Lecturer { _id: string; id: string; name: string; firstName: string; lastName: string; department: string; status: string; joined: string }

const DEPARTMENTS = ['Computer Science', 'Software Engineering', 'Information Systems', 'Electrical Engineering', 'Mathematics', 'Physics', 'Business Administration', 'General']
const JOB_TITLES = ['Professor', 'Associate Professor', 'Senior Lecturer', 'Lecturer', 'Assistant Lecturer', 'Adjunct']

export default function RegistryLecturersPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [lecturers, setLecturers] = useState<Lecturer[]>([])
    const [isRegistering, setIsRegistering] = useState(false)
    const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', department: 'Computer Science', jobTitle: 'Lecturer' })
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', department: 'Computer Science' })

    const loadLecturers = async () => {
        try {
            const res = await apiFetch('/users')
            const teachers = (res.data?.data || []).filter((u: any) => u.role === 'teacher')
            setLecturers(teachers.map((t: any) => ({
                _id: t._id, id: t._id.substring(0, 8).toUpperCase(),
                name: `${t.firstName} ${t.lastName}`, firstName: t.firstName, lastName: t.lastName,
                department: t.department || 'General', status: 'Active',
                joined: new Date(t.createdAt).toLocaleDateString()
            })))
        } catch { toast.error('Failed to load lecturers') }
    }

    useEffect(() => { loadLecturers() }, [])

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.firstName || !formData.lastName || !formData.email) { toast.error('Please fill in all required fields'); return }
        setIsSubmitting(true)
        try {
            await apiFetch('/users', { method: 'POST', body: JSON.stringify({ username: formData.email, password: 'TempPass123!', role: 'teacher', firstName: formData.firstName, lastName: formData.lastName, email: formData.email, department: formData.department, jobTitle: formData.jobTitle }) })
            toast.success(`${formData.firstName} ${formData.lastName} registered! Temp password: TempPass123!`)
            setIsRegistering(false)
            setFormData({ firstName: '', lastName: '', email: '', department: 'Computer Science', jobTitle: 'Lecturer' })
            loadLecturers()
        } catch (err: any) { toast.error(err.message || 'Registration failed') }
        finally { setIsSubmitting(false) }
    }

    const openEdit = (l: Lecturer) => { setEditingLecturer(l); setEditForm({ firstName: l.firstName, lastName: l.lastName, department: l.department }) }

    const handleEdit = async () => {
        if (!editingLecturer) return
        setIsSubmitting(true)
        try {
            await apiFetch(`/users/${editingLecturer._id}`, { method: 'PUT', body: JSON.stringify({ firstName: editForm.firstName, lastName: editForm.lastName, department: editForm.department }) })
            toast.success('Lecturer updated')
            setEditingLecturer(null)
            loadLecturers()
        } catch (err: any) { toast.error(err.message || 'Update failed') }
        finally { setIsSubmitting(false) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this lecturer from the system?')) return
        try {
            await apiFetch(`/users/${id}`, { method: 'DELETE' })
            toast.success('Lecturer removed')
            setLecturers(prev => prev.filter(l => l._id !== id))
        } catch { toast.error('Failed to delete lecturer') }
    }

    const filtered = lecturers.filter(l =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.department.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Lecturers</h1>
                    <p className="text-muted-foreground">Register and manage teaching staff</p>
                </div>
                <PillButton onClick={() => setIsRegistering(true)}><Plus className="h-4 w-4 mr-2" />Add Lecturer</PillButton>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle>All Lecturers <span className="text-muted-foreground text-sm font-normal ml-2">({filtered.length})</span></CardTitle>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by name or department..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No lecturers found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map(l => (
                                <div key={l._id} className="p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                                                {l.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-foreground">{l.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{l.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(l)} className="p-1.5 rounded hover:bg-muted transition-colors"><Edit2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                                            <button onClick={() => handleDelete(l._id)} className="p-1.5 rounded hover:bg-muted transition-colors"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Department</span><span className="font-medium text-foreground truncate ml-2 max-w-[140px]">{l.department}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Status</span><span className="text-emerald-600 dark:text-emerald-400 font-medium">{l.status}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Joined</span><span className="text-muted-foreground">{l.joined}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Register Dialog */}
            <Dialog open={isRegistering} onOpenChange={setIsRegistering}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Register New Lecturer</DialogTitle><DialogDescription>Creates a lecturer account. Temp password: TempPass123!</DialogDescription></DialogHeader>
                    <form onSubmit={handleRegister}>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>First Name <span className="text-destructive">*</span></Label><Input value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} /></div>
                                <div className="space-y-2"><Label>Last Name <span className="text-destructive">*</span></Label><Input value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} /></div>
                            </div>
                            <div className="space-y-2"><Label>Email <span className="text-destructive">*</span></Label><Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Select value={formData.department} onValueChange={v => setFormData(p => ({ ...p, department: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Job Title</Label>
                                <Select value={formData.jobTitle} onValueChange={v => setFormData(p => ({ ...p, jobTitle: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{JOB_TITLES.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <PillButton type="button" variant="outline" onClick={() => setIsRegistering(false)}>Cancel</PillButton>
                            <PillButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'Registering...' : 'Register Lecturer'}</PillButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingLecturer} onOpenChange={v => !v && setEditingLecturer(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Lecturer</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>First Name</Label><Input value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Last Name</Label><Input value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} /></div>
                        </div>
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Select value={editForm.department} onValueChange={v => setEditForm(p => ({ ...p, department: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setEditingLecturer(null)}>Cancel</PillButton>
                        <PillButton onClick={handleEdit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
