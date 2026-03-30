'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
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
            setCourses(coursesRes.data.data.map((c: any) => ({
                _id: c._id, name: c.courseName, subject: c.subject,
                teacher: c.teacherId ? `${c.teacherId.firstName} ${c.teacherId.lastName}` : 'Unassigned',
                teacherId: c.teacherId?._id || '', createdAt: new Date(c.createdAt).toLocaleDateString()
            })))
            const teacherList = usersRes.data.data.filter((u: any) => u.role === 'teacher')
            setTeachers(teacherList.map((t: any) => ({ _id: t._id, name: `${t.firstName} ${t.lastName}` })))
            if (teacherList.length > 0 && !newCourse.teacherId) setNewCourse(prev => ({ ...prev, teacherId: teacherList[0]._id }))
        } catch { toast.error('Failed to load courses') }
    }

    useEffect(() => { loadData() }, [])

    const filtered = courses.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.teacher.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreate = async () => {
        if (!newCourse.courseName || !newCourse.subject || !newCourse.teacherId) { toast.error('Please fill in all fields'); return }
        setIsSubmitting(true)
        try {
            await apiFetch('/courses', { method: 'POST', body: JSON.stringify(newCourse) })
            toast.success(`Course "${newCourse.courseName}" created`)
            setIsCreateOpen(false)
            setNewCourse({ courseName: '', subject: '', teacherId: teachers[0]?._id || '' })
            loadData()
        } catch (err: any) { toast.error(err.message || 'Failed to create course') }
        finally { setIsSubmitting(false) }
    }

    const openEdit = (c: Course) => {
        setEditingCourse(c)
        setEditForm({ courseName: c.name, subject: c.subject, teacherId: c.teacherId })
    }

    const handleEdit = async () => {
        if (!editingCourse) return
        setIsSubmitting(true)
        try {
            await apiFetch(`/courses/${editingCourse._id}`, { method: 'PUT', body: JSON.stringify(editForm) })
            toast.success('Course updated')
            setEditingCourse(null)
            loadData()
        } catch (err: any) { toast.error(err.message || 'Failed to update course') }
        finally { setIsSubmitting(false) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this course? This cannot be undone.')) return
        try {
            await apiFetch(`/courses/${id}`, { method: 'DELETE' })
            toast.success('Course deleted')
            setCourses(prev => prev.filter(c => c._id !== id))
        } catch { toast.error('Failed to delete course') }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Course Management</h1>
                    <p className="text-muted-foreground">Create and manage course offerings</p>
                </div>
                <PillButton onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Course</PillButton>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Courses <span className="text-muted-foreground text-sm font-normal ml-2">({filtered.length})</span></CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by name, subject, or lecturer..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course Name</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Lecturer</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No courses found.</TableCell></TableRow>
                            ) : filtered.map(c => (
                                <TableRow key={c._id}>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{c.subject}</TableCell>
                                    <TableCell className="text-sm">{c.teacher}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{c.createdAt}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <PillButton variant="ghost" size="sm" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></PillButton>
                                            <PillButton variant="ghost" size="sm" onClick={() => handleDelete(c._id)}><Trash2 className="h-4 w-4 text-destructive" /></PillButton>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create New Course</DialogTitle><DialogDescription>Add a new course to the system.</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Course Name</Label><Input placeholder="e.g. CSC 301 — Data Structures" value={newCourse.courseName} onChange={e => setNewCourse(p => ({ ...p, courseName: e.target.value }))} /></div>
                        <div className="space-y-2"><Label>Subject / Department</Label><Input placeholder="e.g. Computer Science" value={newCourse.subject} onChange={e => setNewCourse(p => ({ ...p, subject: e.target.value }))} /></div>
                        <div className="space-y-2">
                            <Label>Assign Lecturer</Label>
                            <Select value={newCourse.teacherId} onValueChange={v => setNewCourse(p => ({ ...p, teacherId: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select a lecturer..." /></SelectTrigger>
                                <SelectContent>{teachers.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</PillButton>
                        <PillButton onClick={handleCreate} disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Course'}</PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingCourse} onOpenChange={v => !v && setEditingCourse(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Course</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Course Name</Label><Input value={editForm.courseName} onChange={e => setEditForm(p => ({ ...p, courseName: e.target.value }))} /></div>
                        <div className="space-y-2"><Label>Subject</Label><Input value={editForm.subject} onChange={e => setEditForm(p => ({ ...p, subject: e.target.value }))} /></div>
                        <div className="space-y-2">
                            <Label>Lecturer</Label>
                            <Select value={editForm.teacherId} onValueChange={v => setEditForm(p => ({ ...p, teacherId: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{teachers.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setEditingCourse(null)}>Cancel</PillButton>
                        <PillButton onClick={handleEdit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
