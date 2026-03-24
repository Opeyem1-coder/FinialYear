'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PillButton } from '@/components/ui/pill-button'
import { Search, Plus, UserCheck, Edit2, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Lecturer { _id: string; id: string; name: string; firstName: string; lastName: string; department: string; status: string; joined: string }

export default function RegistryLecturersPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null)
    const [lecturers, setLecturers] = useState<Lecturer[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', department: 'Computer Science', jobTitle: 'Professor' })
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', department: 'Computer Science' })

    const loadLecturers = async () => {
        try {
            const res = await apiFetch('/users')
            if (res.isMock) {
                setLecturers([
                    { _id: '1', id: 'LEC001', name: 'Dr. Sarah Smith', firstName: 'Sarah', lastName: 'Smith', department: 'Computer Science', status: 'Active', joined: 'Aug 2018' },
                    { _id: '2', id: 'LEC002', name: 'Prof. James Wilson', firstName: 'James', lastName: 'Wilson', department: 'Mathematics', status: 'Active', joined: 'Jan 2015' },
                ])
            } else {
                const teachers = res.data.data.filter((u: any) => u.role === 'teacher')
                setLecturers(teachers.map((t: any) => ({
                    _id: t._id, id: t._id.substring(0, 8).toUpperCase(),
                    name: `${t.firstName} ${t.lastName}`, firstName: t.firstName, lastName: t.lastName,
                    department: 'General', status: 'Active', joined: new Date(t.createdAt).toLocaleDateString()
                })))
            }
        } catch { toast.error('Failed to load lecturers') }
    }

    useEffect(() => { loadLecturers() }, [])

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault(); setIsSubmitting(true)
        try {
            const res = await apiFetch('/users', { method: 'POST', body: JSON.stringify({ username: formData.email, password: 'TempPass123!', role: 'teacher', firstName: formData.firstName, lastName: formData.lastName, email: formData.email }) })
            if (!res.isMock) { toast.success(`${formData.firstName} ${formData.lastName} registered! Temp password: TempPass123!`) }
            else { toast.info('Mock mode: lecturer not saved.') }
            setIsRegistering(false)
            setFormData({ firstName: '', lastName: '', email: '', department: 'Computer Science', jobTitle: 'Professor' })
            loadLecturers()
        } catch (err: any) { toast.error(err.message || 'Registration failed') }
        finally { setIsSubmitting(false) }
    }

    const openEdit = (l: Lecturer) => { setEditingLecturer(l); setEditForm({ firstName: l.firstName, lastName: l.lastName, department: l.department }) }

    const handleSaveEdit = async () => {
        if (!editingLecturer) return; setIsSubmitting(true)
        try {
            await apiFetch(`/users/${editingLecturer._id}`, { method: 'PUT', body: JSON.stringify({ firstName: editForm.firstName, lastName: editForm.lastName }) })
            toast.success('Lecturer updated successfully')
            setEditingLecturer(null); loadLecturers()
        } catch (err: any) { toast.error(err.message || 'Update failed') }
        finally { setIsSubmitting(false) }
    }

    const handleDelete = async (l: Lecturer) => {
        if (!confirm(`Delete ${l.name}?`)) return
        try {
            await apiFetch(`/users/${l._id}`, { method: 'DELETE' })
            toast.success('Lecturer deleted'); loadLecturers()
        } catch (err: any) { toast.error(err.message || 'Delete failed') }
    }

    const filtered = lecturers.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.id.toLowerCase().includes(searchQuery.toLowerCase()) || l.department.toLowerCase().includes(searchQuery.toLowerCase()))
    const selectClass = "w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h1 className="text-3xl font-heading font-bold text-foreground">Lecturer Registry</h1><p className="text-muted-foreground mt-1">Manage and register teaching staff accounts.</p></div>
                {!isRegistering && <PillButton onClick={() => setIsRegistering(true)} className="flex items-center gap-2"><Plus className="h-4 w-4" />Register Lecturer</PillButton>}
            </div>

            <Dialog open={!!editingLecturer} onOpenChange={open => !open && setEditingLecturer(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Lecturer</DialogTitle><DialogDescription>Updating details for {editingLecturer?.name}</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">First Name</label><Input value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Last Name</label><Input value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} /></div>
                        </div>
                        <div className="space-y-2"><label className="text-sm font-medium">Department</label>
                            <select value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value })} className={selectClass}>
                                {['Computer Science','Software Engineering','Mathematics','Information Systems','Cybersecurity'].map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setEditingLecturer(null)}>Cancel</PillButton>
                        <PillButton onClick={handleSaveEdit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isRegistering ? (
                <Card className="border-primary/20 shadow-md">
                    <CardHeader className="border-b bg-primary/5 pb-6">
                        <div className="flex items-center justify-between">
                            <div><CardTitle className="text-xl">Register New Lecturer</CardTitle><CardDescription className="mt-1">Add a new lecturer to the registry.</CardDescription></div>
                            <PillButton variant="ghost" onClick={() => setIsRegistering(false)}>Cancel</PillButton>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form className="space-y-6" onSubmit={handleRegister}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><label className="text-sm font-medium">First Name</label><Input placeholder="Sarah" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} /></div>
                                <div className="space-y-2"><label className="text-sm font-medium">Last Name</label><Input placeholder="Smith" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} /></div>
                                <div className="space-y-2"><label className="text-sm font-medium">Email Address</label><Input type="email" placeholder="sarah.smith@university.edu" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                                <div className="space-y-2"><label className="text-sm font-medium">Department</label>
                                    <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className={selectClass}>
                                        {['Computer Science','Software Engineering','Mathematics','Information Systems','Cybersecurity'].map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2"><label className="text-sm font-medium">Temporary Password</label><Input defaultValue="TempPass123!" readOnly className="bg-muted text-muted-foreground" /><p className="text-xs text-muted-foreground">Lecturer must change this on first login.</p></div>
                            </div>
                            <div className="flex justify-end pt-4 border-t"><PillButton type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white">{isSubmitting ? 'Creating...' : 'Create Lecturer Profile'}</PillButton></div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="relative w-full max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search lecturers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-10" /></div>
                            <span className="text-sm text-muted-foreground border border-border rounded-md px-3 py-1">Total: <span className="font-bold text-foreground">{filtered.length}</span></span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Lecturer Info</th>
                                        <th className="px-6 py-4 font-semibold">Department</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.length > 0 ? filtered.map(l => (
                                        <tr key={l._id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0"><span className="text-primary font-semibold">{l.name.charAt(0)}</span></div>
                                                    <div><div className="font-medium text-foreground">{l.name}</div><div className="text-muted-foreground text-xs mt-0.5">{l.id}</div></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-foreground">{l.department}</div><div className="text-muted-foreground text-xs">{l.joined}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"><UserCheck className="h-3 w-3 mr-1" />Active</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openEdit(l)} className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"><Edit2 className="h-4 w-4" /></button>
                                                    <button onClick={() => handleDelete(l)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">{searchQuery ? `No lecturers matching "${searchQuery}"` : 'No lecturers registered yet.'}</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
