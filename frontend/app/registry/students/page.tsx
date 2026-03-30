'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PillButton } from '@/components/ui/pill-button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Search, Plus, GraduationCap, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Student { id: string; _id: string; name: string; program: string; level: string; status: string; enrolled: string }

const PROGRAMS = ['Computer Science', 'Software Engineering', 'Information Systems', 'Electrical Engineering', 'Mathematics', 'Physics', 'Business Administration']
const LEVELS = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level']

export default function RegistryStudentsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [students, setStudents] = useState<Student[]>([])
    const [isRegistering, setIsRegistering] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingStudent, setEditingStudent] = useState<Student | null>(null)
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', dateOfBirth: '', program: 'Computer Science', level: '100 Level' })
    const [editForm, setEditForm] = useState({ program: '', level: '' })

    const loadStudents = async () => {
        try {
            const res = await apiFetch('/students')
            setStudents((res.data?.data || []).map((s: any) => ({
                _id: s._id, id: s.studentId,
                name: `${s.firstName} ${s.lastName}`,
                program: s.program || 'General',
                level: s.level || '100 Level',
                status: 'Active',
                enrolled: new Date(s.createdAt).toLocaleDateString()
            })))
        } catch { toast.error('Failed to load students') }
    }

    useEffect(() => { loadStudents() }, [])

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.firstName || !formData.lastName || !formData.email) { 
            toast.error('Please fill in all required fields'); 
            return 
        }
        
        setIsSubmitting(true)
        try {
            // 1. Create user account
            const userRes = await apiFetch('/users', {
                method: 'POST',
                body: JSON.stringify({ 
                    username: formData.email, 
                    password: 'TempPass123!', 
                    role: 'student', 
                    firstName: formData.firstName, 
                    lastName: formData.lastName, 
                    email: formData.email 
                })
            })
            
            const newUserId = userRes.data?.data?._id || userRes.data?._id

            // 2. Generate a random student ID (e.g., STU-4928)
            const generatedStudentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`

            // 3. Create student profile linked to user (Now including studentId)
            await apiFetch('/students', {
                method: 'POST',
                body: JSON.stringify({ 
                    studentId: generatedStudentId, // <-- Added here!
                    userId: newUserId, 
                    firstName: formData.firstName, 
                    lastName: formData.lastName, 
                    program: formData.program, 
                    level: formData.level, 
                    dateOfBirth: formData.dateOfBirth 
                })
            })
            
            toast.success(`${formData.firstName} ${formData.lastName} registered! Temp password: TempPass123!`)
            setIsRegistering(false)
            setFormData({ firstName: '', lastName: '', email: '', dateOfBirth: '', program: 'Computer Science', level: '100 Level' })
            loadStudents()
        } catch (err: any) { 
            toast.error(err.message || 'Registration failed') 
        } finally { 
            setIsSubmitting(false) 
        }
    }

    const openEdit = (s: Student) => { setEditingStudent(s); setEditForm({ program: s.program, level: s.level }) }

    const handleEdit = async () => {
        if (!editingStudent) return
        setIsSubmitting(true)
        try {
            await apiFetch(`/students/${editingStudent._id}`, { method: 'PUT', body: JSON.stringify(editForm) })
            toast.success('Student updated')
            setEditingStudent(null)
            loadStudents()
        } catch (err: any) { toast.error(err.message || 'Update failed') }
        finally { setIsSubmitting(false) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this student record?')) return
        try {
            await apiFetch(`/students/${id}`, { method: 'DELETE' })
            toast.success('Student deleted')
            setStudents(prev => prev.filter(s => s._id !== id))
        } catch { toast.error('Failed to delete student') }
    }

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.program.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Students</h1>
                    <p className="text-muted-foreground">Register and manage student accounts</p>
                </div>
                <PillButton onClick={() => setIsRegistering(true)}><Plus className="h-4 w-4 mr-2" />Register Student</PillButton>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle>All Students <span className="text-muted-foreground text-sm font-normal ml-2">({filtered.length})</span></CardTitle>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by name, ID, or program..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl">
                            <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No students found</p>
                            <p className="text-sm mt-1">Register a new student to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map(s => (
                                <div key={s._id} className="p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                                                {s.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-foreground">{s.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{s.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-muted transition-colors"><Edit2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                                            <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded hover:bg-muted transition-colors"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Program</span>
                                            <span className="font-medium text-foreground truncate ml-2 max-w-[150px]">{s.program}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Level</span>
                                            <span className="font-medium text-foreground">{s.level}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Enrolled</span>
                                            <span className="text-muted-foreground">{s.enrolled}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Register Dialog */}
            <Dialog open={isRegistering} onOpenChange={setIsRegistering}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>Register New Student</DialogTitle><DialogDescription>Creates a user account and student profile. Temp password: TempPass123!</DialogDescription></DialogHeader>
                    <form onSubmit={handleRegister}>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>First Name <span className="text-destructive">*</span></Label><Input value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} /></div>
                                <div className="space-y-2"><Label>Last Name <span className="text-destructive">*</span></Label><Input value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} /></div>
                            </div>
                            <div className="space-y-2"><Label>Email Address <span className="text-destructive">*</span></Label><Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={formData.dateOfBirth} onChange={e => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Program</Label>
                                    <Select value={formData.program} onValueChange={v => setFormData(p => ({ ...p, program: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{PROGRAMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Level</Label>
                                    <Select value={formData.level} onValueChange={v => setFormData(p => ({ ...p, level: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <PillButton type="button" variant="outline" onClick={() => setIsRegistering(false)}>Cancel</PillButton>
                            <PillButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'Registering...' : 'Register Student'}</PillButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingStudent} onOpenChange={v => !v && setEditingStudent(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Program</Label>
                            <Select value={editForm.program} onValueChange={v => setEditForm(p => ({ ...p, program: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{PROGRAMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Level</Label>
                            <Select value={editForm.level} onValueChange={v => setEditForm(p => ({ ...p, level: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setEditingStudent(null)}>Cancel</PillButton>
                        <PillButton onClick={handleEdit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
