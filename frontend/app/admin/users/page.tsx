'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Mail } from 'lucide-react'
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
            if (res.isMock) {
                setUsers([
                    { _id: '1', name: 'John Smith', firstName: 'John', lastName: 'Smith', email: 'john.smith@school.edu', role: 'teacher', createdAt: '2024-01-15', status: 'active' },
                    { _id: '2', name: 'Sarah Johnson', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@school.edu', role: 'parent', createdAt: '2024-01-18', status: 'active' },
                    { _id: '3', name: 'Michael Brown', firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@school.edu', role: 'student', createdAt: '2024-01-20', status: 'active' },
                ])
            } else {
                setUsers(res.data.data.map((u: any) => ({
                    _id: u._id, name: `${u.firstName} ${u.lastName}`,
                    firstName: u.firstName, lastName: u.lastName,
                    email: u.email || u.username, role: u.role,
                    createdAt: new Date(u.createdAt).toLocaleDateString(), status: 'active'
                })))
            }
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
            registry: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-400',
        }
        return styles[role] || styles.admin
    }

    const handleCreateUser = async () => {
        if (!newUser.firstName || !newUser.email) { toast.error('Please fill in all required fields'); return }
        setIsSubmitting(true)
        try {
            await apiFetch('/users', { method: 'POST', body: JSON.stringify({ username: newUser.email, password: 'TempPass123!', role: newUser.role, firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email }) })
            toast.success(`User ${newUser.firstName} ${newUser.lastName} created! Temp password: TempPass123!`)
            setIsCreateOpen(false)
            setNewUser({ firstName: '', lastName: '', email: '', role: 'parent' })
            loadUsers()
        } catch (err: any) { toast.error(err.message || 'Failed to create user') }
        finally { setIsSubmitting(false) }
    }

    const openEdit = (u: User) => {
        setEditingUser(u)
        setEditForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role })
    }

    const handleSaveEdit = async () => {
        if (!editingUser) return; setIsSubmitting(true)
        try {
            await apiFetch(`/users/${editingUser._id}`, { method: 'PUT', body: JSON.stringify({ firstName: editForm.firstName, lastName: editForm.lastName, email: editForm.email }) })
            toast.success('User updated successfully')
            setEditingUser(null); loadUsers()
        } catch (err: any) { toast.error(err.message || 'Update failed') }
        finally { setIsSubmitting(false) }
    }

    const handleDeleteUser = async (u: User) => {
        if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return
        try {
            await apiFetch(`/users/${u._id}`, { method: 'DELETE' })
            toast.success('User deleted'); loadUsers()
        } catch (err: any) { toast.error(err.message || 'Delete failed') }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div><h1 className="text-4xl font-heading font-bold text-foreground mb-2">User Management</h1><p className="text-muted-foreground">Add, edit, and manage all user accounts</p></div>
                <PillButton size="lg" onClick={() => setIsCreateOpen(true)}><Plus className="h-5 w-5 mr-2" />Add New User</PillButton>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create New User</DialogTitle><DialogDescription>Add a new user to the system. Default password: TempPass123!</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>First Name</Label><Input placeholder="John" value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} /></div>
                            <div><Label>Last Name</Label><Input placeholder="Doe" value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} /></div>
                        </div>
                        <div><Label>Email Address</Label><Input type="email" placeholder="john@school.edu" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} /></div>
                        <div><Label>Role</Label>
                            <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                    <SelectItem value="registry">Registry</SelectItem>
                                    <SelectItem value="teacher">Teacher</SelectItem>
                                    <SelectItem value="parent">Parent</SelectItem>
                                    <SelectItem value="student">Student</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</PillButton>
                        <PillButton onClick={handleCreateUser} disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create User'}</PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingUser} onOpenChange={open => !open && setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit User</DialogTitle><DialogDescription>Updating {editingUser?.name}</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>First Name</Label><Input value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} /></div>
                            <div><Label>Last Name</Label><Input value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} /></div>
                        </div>
                        <div><Label>Email Address</Label><Input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
                        <div><Label>Role</Label>
                            <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded-md">Role: <strong>{editForm.role}</strong> — role changes require re-registration for security.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setEditingUser(null)}>Cancel</PillButton>
                        <PillButton onClick={handleSaveEdit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative"><Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground pointer-events-none" /><Input placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" /></div>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-full md:w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Administrator</SelectItem>
                                <SelectItem value="registry">Registry</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="parent">Parent</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader><CardTitle>All Users</CardTitle><CardDescription>Total: {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</CardDescription></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map(u => (
                                    <TableRow key={u._id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{u.name.charAt(0)}</div>
                                                {u.name}
                                            </div>
                                        </TableCell>
                                        <TableCell><div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />{u.email}</div></TableCell>
                                        <TableCell><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadge(u.role)}`}>{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</span></TableCell>
                                        <TableCell>{u.createdAt}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <PillButton size="icon-sm" variant="ghost" onClick={() => openEdit(u)}><Edit className="h-4 w-4" /></PillButton>
                                                <PillButton size="icon-sm" variant="ghost" onClick={() => handleDeleteUser(u)}><Trash2 className="h-4 w-4 text-destructive" /></PillButton>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredUsers.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No users found.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
