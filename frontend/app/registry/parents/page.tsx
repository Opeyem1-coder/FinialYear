'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PillButton } from '@/components/ui/pill-button'
import { Search, Plus, Edit2, Trash2, Users, Link as LinkIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Parent { _id: string; id: string; name: string; firstName: string; lastName: string; email: string; phone: string; students: number; status: string }

export default function RegistryParentsPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [editingParent, setEditingParent] = useState<Parent | null>(null)
    const [parents, setParents] = useState<Parent[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' })
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' })

    const loadParents = async () => {
        try {
            const res = await apiFetch('/users')
            if (res.isMock) {
                setParents([
                    { _id: '1', id: 'PAR001', name: 'Michael Johnson', firstName: 'Michael', lastName: 'Johnson', email: 'michael.j@example.com', phone: '+1 (555) 123-4567', students: 2, status: 'Active' },
                    { _id: '2', id: 'PAR002', name: 'Sarah Williams', firstName: 'Sarah', lastName: 'Williams', email: 'swilliams@example.com', phone: '+1 (555) 987-6543', students: 1, status: 'Active' },
                ])
            } else {
                const parentsList = res.data.data.filter((u: any) => u.role === 'parent')
                setParents(parentsList.map((p: any) => ({
                    _id: p._id, id: p._id.substring(0, 8).toUpperCase(),
                    name: `${p.firstName} ${p.lastName}`, firstName: p.firstName, lastName: p.lastName,
                    email: p.email || '', phone: 'N/A', students: 0, status: 'Active'
                })))
            }
        } catch { toast.error('Failed to load parents') }
    }

    useEffect(() => { loadParents() }, [])

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault(); setIsSubmitting(true)
        try {
            const res = await apiFetch('/users', { method: 'POST', body: JSON.stringify({ username: formData.email, password: 'TempPass123!', role: 'parent', firstName: formData.firstName, lastName: formData.lastName, email: formData.email }) })
            if (!res.isMock) { toast.success(`${formData.firstName} ${formData.lastName} registered! Temp password: TempPass123!`) }
            else { toast.info('Mock mode: parent not saved.') }
            setIsRegistering(false)
            setFormData({ firstName: '', lastName: '', email: '', phone: '' })
            loadParents()
        } catch (err: any) { toast.error(err.message || 'Registration failed') }
        finally { setIsSubmitting(false) }
    }

    const openEdit = (p: Parent) => { setEditingParent(p); setEditForm({ firstName: p.firstName, lastName: p.lastName, email: p.email }) }

    const handleSaveEdit = async () => {
        if (!editingParent) return; setIsSubmitting(true)
        try {
            await apiFetch(`/users/${editingParent._id}`, { method: 'PUT', body: JSON.stringify({ firstName: editForm.firstName, lastName: editForm.lastName, email: editForm.email }) })
            toast.success('Parent updated successfully')
            setEditingParent(null); loadParents()
        } catch (err: any) { toast.error(err.message || 'Update failed') }
        finally { setIsSubmitting(false) }
    }

    const handleDelete = async (p: Parent) => {
        if (!confirm(`Delete ${p.name}?`)) return
        try {
            await apiFetch(`/users/${p._id}`, { method: 'DELETE' })
            toast.success('Parent deleted'); loadParents()
        } catch (err: any) { toast.error(err.message || 'Delete failed') }
    }

    const filtered = parents.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h1 className="text-3xl font-heading font-bold text-foreground">Parent Registry</h1><p className="text-muted-foreground mt-1">Manage parent accounts and family links.</p></div>
                {!isRegistering && <PillButton onClick={() => setIsRegistering(true)} className="flex items-center gap-2"><Plus className="h-4 w-4" />Register Parent</PillButton>}
            </div>

            <Dialog open={!!editingParent} onOpenChange={open => !open && setEditingParent(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Parent</DialogTitle><DialogDescription>Updating details for {editingParent?.name}</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-medium">First Name</label><Input value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-sm font-medium">Last Name</label><Input value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} /></div>
                        </div>
                        <div className="space-y-2"><label className="text-sm font-medium">Email Address</label><Input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setEditingParent(null)}>Cancel</PillButton>
                        <PillButton onClick={handleSaveEdit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isRegistering ? (
                <Card className="border-blue-500/20 shadow-md">
                    <CardHeader className="border-b bg-blue-500/5 pb-6">
                        <div className="flex items-center justify-between">
                            <div><CardTitle className="text-xl">Register New Parent</CardTitle><CardDescription className="mt-1">Create a parent account to grant portal access.</CardDescription></div>
                            <PillButton variant="ghost" onClick={() => setIsRegistering(false)}>Cancel</PillButton>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form className="space-y-6" onSubmit={handleRegister}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><label className="text-sm font-medium">First Name</label><Input placeholder="Robert" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} /></div>
                                <div className="space-y-2"><label className="text-sm font-medium">Last Name</label><Input placeholder="Taylor" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} /></div>
                                <div className="space-y-2"><label className="text-sm font-medium">Email Address</label><Input type="email" placeholder="robert.t@example.com" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                                <div className="space-y-2"><label className="text-sm font-medium">Phone (Optional)</label><Input type="tel" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                                <div className="space-y-2 md:col-span-2"><label className="text-sm font-medium">Temporary Password</label><Input defaultValue="TempPass123!" readOnly className="bg-muted text-muted-foreground" /><p className="text-xs text-muted-foreground">Parent must change this on first login. Link them to students from the Link Accounts page.</p></div>
                            </div>
                            <div className="flex justify-end pt-4 border-t"><PillButton type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white">{isSubmitting ? 'Creating...' : 'Create Parent Profile'}</PillButton></div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="relative w-full max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search parents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-10" /></div>
                            <span className="text-sm text-muted-foreground border border-border rounded-md px-3 py-1">Total: <span className="font-bold text-foreground">{filtered.length}</span></span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Parent Info</th>
                                        <th className="px-6 py-4 font-semibold">Contact / Email</th>
                                        <th className="px-6 py-4 font-semibold">Linked Students</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.length > 0 ? filtered.map(p => (
                                        <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 flex-shrink-0"><span className="text-blue-500 font-semibold">{p.name.charAt(0)}</span></div>
                                                    <div><div className="font-medium text-foreground">{p.name}</div><div className="text-muted-foreground text-xs mt-0.5">{p.id}</div></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-foreground">{p.email}</div><div className="text-muted-foreground text-xs">{p.phone}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border"><Users className="h-3 w-3 mr-1" />{p.students} Student{p.students !== 1 ? 's' : ''}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => router.push('/registry/link-accounts')} className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors" title="Link to Students"><LinkIcon className="h-4 w-4" /></button>
                                                    <button onClick={() => openEdit(p)} className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors" title="Edit"><Edit2 className="h-4 w-4" /></button>
                                                    <button onClick={() => handleDelete(p)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">{searchQuery ? `No parents matching "${searchQuery}"` : 'No parents registered yet.'}</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
