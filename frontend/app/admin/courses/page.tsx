'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface Course { _id: string; name: string; subject: string; teacher: string; teacherId: string; createdAt: string }
interface Teacher { _id: string; name: string }

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [teachers, setTeachers] = useState<Teacher[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newCourse, setNewCourse] = useState({ courseName: '', subject: '', teacherId: '' })
    const [editForm, setEditForm] = useState({ courseName: '', subject: '', teacherId: '' })

    const loadData = async () => {
        try {
            const [coursesRes, usersRes] = await Promise.all([apiFetch('/courses'), apiFetch('/users')])
            if (coursesRes.isMock) {
                setCourses([
                    { _id: '1', name: 'CSC 301 — Data Structures', subject: 'Computer Science', teacher: 'Dr. Sarah Smith', teacherId: '1', createdAt: '2024-01-15' },
                    { _id: '2', name: 'MTH 201 — Linear Algebra', subject: 'Mathematics', teacher: 'Prof. James Wilson', teacherId: '2', createdAt: '2024-01-18' },
                ])
                setTeachers([{ _id: '1', name: 'Dr. Sarah Smith' }, { _id: '2', name: 'Prof. James Wilson' }])
            } else {
                setCourses(coursesRes.data.data.map((c: any) => ({
                    _id: c._id, name: c.courseName, subject: c.subject,
                    teacher: c.teacherId ? `${c.teacherId.firstName} ${c.teacherId.lastName}` : 'Unassigned',
                    teacherId: c.teacherId?._id || '', createdAt: new Date(c.createdAt).toLocaleDateString()
                })))
                const teacherList = usersRes.data.data.filter((u: any) => u.role === 'teacher')
                setTeachers(teacherList.map((t: any) => ({ _id: t._id, name: `${t.firstName} ${t.lastName}` })))
                if (teacherList.length > 0 && !newCourse.teacherId) setNewCourse(prev => ({ ...prev, teacherId: teacherList[0]._id }))
            }
        } catch { toast.error('Failed to load courses') }
    }

    useEffect(() => { loadData() }, [])

    const filtered = courses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.subject.toLowerCase().includes(searchQuery.toLowerCase()) || c.teacher.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleCreate = async () => {
        if (!newCourse.courseName || !newCourse.subject || !newCourse.teacherId) { toast.error('Please fill in all fields'); return }
        setIsSubmitting(true)
        try {
            await apiFetch('/courses', { method: 'POST', body: JSON.stringify(newCourse) })
            toast.success(`Course "${newCourse.courseName}" created`)
            setIsCreateOpen(false); setNewCourse({ courseName: '', subject: '', teacherId: teachers[0]?._id || '' }); loadData()
        } catch (err: any) { toast.error(err.message || 'Failed to create course') }
        finally { setIsSubmitting(false) }
    }

    const openEdit = (c: Course) => { setEditingCourse(c); setEditForm({ courseName: c.name, subject: c.subject, teacherId: c.teacherId }) }

    const handleSaveEdit = async () => {
        if (!editingCourse) return; setIsSubmitting(true)
        try {
            await apiFetch(`/courses/${editingCourse._id}`, { method: 'PUT', body: JSON.stringify(editForm) })
            toast.success('Course updated'); setEditingCourse(null); loadData()
        } catch (err: any) { toast.error(err.message || 'Update failed') }
        finally { setIsSubmitting(false) }
    }

    const handleDelete = async (c: Course) => {
        if (!confirm(`Delete "${c.name}"?`)) return
        try {
            await apiFetch(`/courses/${c._id}`, { method: 'DELETE' })
            toast.success('Course deleted'); loadData()
        } catch (err: any) { toast.error(err.message || 'Delete failed') }
    }

    const TeacherSelect = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger><SelectValue placeholder="Select teacher..." /></SelectTrigger>
            <SelectContent>
                {teachers.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
                {teachers.length === 0 && <SelectItem value="" disabled>No teachers registered</SelectItem>}
            </SelectContent>
        </Select>
    )

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div><h1 className="text-4xl font-heading font-bold text-foreground mb-2">Course Management</h1><p className="text-muted-foreground">Create and manage academic courses</p></div>
                <PillButton size="lg" onClick={() => setIsCreateOpen(true)}><Plus className="h-5 w-5 mr-2" />Add New Course</PillButton>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create New Course</DialogTitle><DialogDescription>Add a new course and assign a teacher.</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                        <div><Label>Course Name</Label><Input placeholder="e.g. CSC 301 — Data Structures" value={newCourse.courseName} onChange={e => setNewCourse({ ...newCourse, courseName: e.target.value })} /></div>
                        <div><Label>Subject / Department</Label><Input placeholder="e.g. Computer Science" value={newCourse.subject} onChange={e => setNewCourse({ ...newCourse, subject: e.target.value })} /></div>
                        <div><Label>Assign Teacher</Label><TeacherSelect value={newCourse.teacherId} onChange={v => setNewCourse({ ...newCourse, teacherId: v })} /></div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</PillButton>
                        <PillButton onClick={handleCreate} disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Course'}</PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingCourse} onOpenChange={open => !open && setEditingCourse(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Course</DialogTitle><DialogDescription>Updating "{editingCourse?.name}"</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                        <div><Label>Course Name</Label><Input value={editForm.courseName} onChange={e => setEditForm({ ...editForm, courseName: e.target.value })} /></div>
                        <div><Label>Subject / Department</Label><Input value={editForm.subject} onChange={e => setEditForm({ ...editForm, subject: e.target.value })} /></div>
                        <div><Label>Assign Teacher</Label><TeacherSelect value={editForm.teacherId} onChange={v => setEditForm({ ...editForm, teacherId: v })} /></div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setEditingCourse(null)}>Cancel</PillButton>
                        <PillButton onClick={handleSaveEdit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative"><Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground pointer-events-none" /><Input placeholder="Search by course name, subject, or teacher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" /></div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader><CardTitle>All Courses</CardTitle><CardDescription>Total: {filtered.length} course{filtered.length !== 1 ? 's' : ''}</CardDescription></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow><TableHead>Course Name</TableHead><TableHead>Subject</TableHead><TableHead>Assigned Teacher</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead></TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(c => (
                                    <TableRow key={c._id}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell><code className="bg-muted px-2 py-1 rounded text-sm">{c.subject}</code></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{c.teacher.charAt(0)}</div>
                                                {c.teacher}
                                            </div>
                                        </TableCell>
                                        <TableCell>{c.createdAt}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <PillButton size="icon-sm" variant="ghost" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></PillButton>
                                                <PillButton size="icon-sm" variant="ghost" onClick={() => handleDelete(c)}><Trash2 className="h-4 w-4 text-destructive" /></PillButton>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No courses found. Create one above.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
