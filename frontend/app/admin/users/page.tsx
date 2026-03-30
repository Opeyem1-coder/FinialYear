'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface User { _id: string; name: string; firstName: string; lastName: string; email: string; role: string; createdAt: string; status: string }

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRole, setSelectedRole] = useState('all')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', role: 'parent' })
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', role: '' })

    const loadUsers = async () => {
        try {
            const res = await apiFetch('/users')
            setUsers(res.data.data.map((u: any) => ({
                _id: u._id, name: `${u.firstName} ${u.lastName}`,
                firstName: u.firstName, lastName: u.lastName,
                email: u.email || u.username, role: u.role,
                createdAt: new Date(u.createdAt).toLocaleDateString(), status: 'active'
            })))
        } catch { toast.error('Failed to load users') }
    }

    useEffect(() => { loadUsers() }, [])

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = selectedRole === 'all' || u.role === selectedRole
        return matchesSearch && matchesRole
    })

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400',
            teacher: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400',
            parent: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400',
            student: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400',
            registry: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400',
        }
        return <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${styles[role] || 'bg-muted text-muted-foreground'}`}>{role}</span>
    }

    const handleCreate = async () => {
        if (!newUser.firstName || !newUser.lastName || !newUser.email) { toast.error('Please fill in all fields'); return }
        setIsSubmitting(true)
        try {
            await apiFetch('/users', { method: 'POST', body: JSON.stringify({ username: newUser.email, password: 'TempPass123!', firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email, role: newUser.role }) })
            toast.success(`User created. Temp password: TempPass123!`)
            setIsCreateOpen(false)
            setNewUser({ firstName: '', lastName: '', email: '', role: 'parent' })
            loadUsers()
        } catch (err: any) { toast.error(err.message || 'Failed to create user') }
        finally { setIsSubmitting(false) }
    }

    const handleEdit = async () => {
        if (!editingUser) return
        setIsSubmitting(true)
        try {
            await apiFetch(`/users/${editingUser._id}`, { method: 'PUT', body: JSON.stringify({ firstName: editForm.firstName, lastName: editForm.lastName, role: editForm.role }) })
            toast.success('User updated')
            setEditingUser(null)
            loadUsers()
        } catch (err: any) { toast.error(err.message || 'Failed to update user') }
        finally { setIsSubmitting(false) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this user? This cannot be undone.')) return
        try {
            await apiFetch(`/users/${id}`, { method: 'DELETE' })
            toast.success('User deleted')
            setUsers(prev => prev.filter(u => u._id !== id))
        } catch { toast.error('Failed to delete user') }
    }

    const openEdit = (u: User) => { setEditingUser(u); setEditForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role }) }

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-2">User Management</h1>
                    <p className="text-muted-foreground">Manage all system user accounts</p>
                </div>
                <PillButton onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add User</PillButton>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['all', 'admin', 'teacher', 'parent', 'student'].map(role => (
                    <button key={role} onClick={() => setSelectedRole(role)} className={`p-3 rounded-xl border text-center transition-all ${selectedRole === role ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-border hover:bg-muted/50'}`}>
                        <p className="text-sm font-medium capitalize">{role === 'all' ? 'All Users' : role + 's'}</p>
                        <p className="text-2xl font-bold mt-1">
                            {role === 'all' ? users.length : users.filter(u => u.role === role).length}
                        </p>
                    </button>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by name or email..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No users found.</TableCell></TableRow>
                            ) : filteredUsers.map(u => (
                                <TableRow key={u._id}>
                                    <TableCell className="font-medium">{u.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{u.createdAt}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <PillButton variant="ghost" size="sm" onClick={() => openEdit(u)}><Edit className="h-4 w-4" /></PillButton>
                                            <PillButton variant="ghost" size="sm" onClick={() => handleDelete(u._id)}><Trash2 className="h-4 w-4 text-destructive" /></PillButton>
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
                    <DialogHeader><DialogTitle>Add New User</DialogTitle><DialogDescription>Create a new system account. Default password: TempPass123!</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>First Name</Label><Input value={newUser.firstName} onChange={e => setNewUser(p => ({ ...p, firstName: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Last Name</Label><Input value={newUser.lastName} onChange={e => setNewUser(p => ({ ...p, lastName: e.target.value }))} /></div>
                        </div>
                        <div className="space-y-2"><Label>Email Address</Label><Input type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} /></div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={newUser.role} onValueChange={v => setNewUser(p => ({ ...p, role: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['admin', 'registry', 'teacher', 'parent', 'student'].map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</PillButton>
                        <PillButton onClick={handleCreate} disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create User'}</PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingUser} onOpenChange={v => !v && setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>First Name</Label><Input value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Last Name</Label><Input value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} /></div>
                        </div>
                        <div className="space-y-2"><Label>Email</Label><Input value={editForm.email} disabled /></div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={editForm.role} onValueChange={v => setEditForm(p => ({ ...p, role: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['admin', 'registry', 'teacher', 'parent', 'student'].map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setEditingUser(null)}>Cancel</PillButton>
                        <PillButton onClick={handleEdit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
