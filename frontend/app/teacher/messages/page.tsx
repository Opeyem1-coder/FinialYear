'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Search, PenSquare, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface Contact { id: string; name: string; avatar: string; relationship: string; lastMessage: string; timestamp: string; unread: boolean }
interface ChatMessage { id: string; sender: string; content: string; timestamp: string; isMe: boolean; createdAt: string }
interface AppUser { _id: string; firstName: string; lastName: string; role: string }

const getMyId = (u: any) => u?._id || u?.id

const buildContacts = (msgs: any[], myId: string): Contact[] => {
    // Track per-contact: latest message + whether ANY message is unread
    const contactMap = new Map<string, { contact: Contact; hasUnread: boolean }>()

    msgs.forEach((m: any) => {
        const iAmSender = m.senderId?._id === myId
        const contactUser = iAmSender ? m.receiverId : m.senderId
        if (!contactUser?._id) return

        const cid = contactUser._id
        const existing = contactMap.get(cid)
        const msgUnread = !iAmSender && !m.isRead
        const isNewer = !existing || new Date(m.createdAt) > new Date(existing.contact.timestamp)

        if (!existing) {
            contactMap.set(cid, {
                contact: {
                    id: cid,
                    name: `${contactUser.firstName} ${contactUser.lastName}`,
                    avatar: `${contactUser.firstName?.[0] || ''}${contactUser.lastName?.[0] || ''}`,
                    relationship: contactUser.role === 'parent' ? 'Parent' : contactUser.role === 'student' ? 'Student' : 'User',
                    lastMessage: m.body,
                    timestamp: m.createdAt,
                    unread: msgUnread
                },
                hasUnread: msgUnread
            })
        } else {
            // Accumulate unread across all messages in this conversation
            const newHasUnread = existing.hasUnread || msgUnread
            contactMap.set(cid, {
                contact: isNewer
                    ? { ...existing.contact, lastMessage: m.body, timestamp: m.createdAt, unread: newHasUnread }
                    : { ...existing.contact, unread: newHasUnread },
                hasUnread: newHasUnread
            })
        }
    })

    return Array.from(contactMap.values())
        .map(v => v.contact)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export default function TeacherMessagesPage() {
    const [selectedContact, setSelectedContact] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [messageText, setMessageText] = useState('')
    const [contacts, setContacts] = useState<Contact[]>([])
    const [allMessages, setAllMessages] = useState<any[]>([])
    const [isSending, setIsSending] = useState(false)
    const [isComposeOpen, setIsComposeOpen] = useState(false)
    const [allUsers, setAllUsers] = useState<AppUser[]>([])
    const [composeRecipient, setComposeRecipient] = useState('')
    const [composeSubject, setComposeSubject] = useState('')
    const [composeBody, setComposeBody] = useState('')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const chatBottomRef = useRef<HTMLDivElement>(null)
    const inMock = false
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    const loadMessages = useCallback(async (silent = false) => {
        if (!silent) setIsRefreshing(true)
        try {
            const res = await apiFetch('/messages')
            if (false) {
                setContacts([
                    { id: '1', name: 'Sarah Johnson', avatar: 'SJ', relationship: 'Parent', lastMessage: 'Thank you for the update', timestamp: new Date().toISOString(), unread: true },
                    { id: '2', name: 'Michael Brown', avatar: 'MB', relationship: 'Parent', lastMessage: 'When is the next exam?', timestamp: new Date(Date.now() - 3600000).toISOString(), unread: false },
                ])
                setAllMessages([
                    { _id: 'mock-m1', senderId: { _id: '1', firstName: 'Sarah', lastName: 'Johnson', role: 'parent' }, receiverId: { _id: 'me' }, body: 'Thank you for the update on my child.', createdAt: new Date().toISOString(), isRead: false },
                    { _id: 'mock-m2', senderId: { _id: '2', firstName: 'Michael', lastName: 'Brown', role: 'parent' }, receiverId: { _id: 'me' }, body: 'When is the next exam?', createdAt: new Date(Date.now() - 3600000).toISOString(), isRead: true },
                ])
                return
            }
            const msgs = res.data?.data || []
            setAllMessages(msgs)
            const uData = JSON.parse(sessionStorage.getItem('user') || '{}')
            const myId = getMyId(uData)
            setContacts(buildContacts(msgs, myId))
        } catch { if (!silent) toast.error('Failed to load messages') }
        finally { if (!silent) setIsRefreshing(false) }
    }, [inMock])

    const loadUsers = useCallback(async () => {
        try {
            const res = await apiFetch('/users')
            if (true) setAllUsers(res.data.data.filter((u: any) => u.role === 'parent' || u.role === 'student'))
        } catch { }
    }, [])

    useEffect(() => {
        loadMessages()
        loadUsers()
        // Poll every 10 seconds for new messages
        pollingRef.current = setInterval(() => loadMessages(true), 10000)
        return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
    }, [])

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [allMessages, selectedContact])

    // Mark messages as read when selecting a contact
    useEffect(() => {
        if (!selectedContact || inMock) return
        const unread = allMessages.filter(m => m.senderId?._id === selectedContact && !m.isRead)
        unread.forEach(m => {
            apiFetch(`/messages/${m._id}/read`, { method: 'PUT', body: '{}' }).catch(() => { })
            m.isRead = true
        })
        if (unread.length > 0) {
            setContacts(prev => prev.map(c => c.id === selectedContact ? { ...c, unread: false } : c))
        }
    }, [selectedContact, allMessages])

    const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const selectedContactData = contacts.find(c => c.id === selectedContact) || null

    const chatMessages: ChatMessage[] = allMessages
        .filter(m => m.senderId?._id === selectedContact || m.receiverId?._id === selectedContact)
        .map(m => {
            const uData = JSON.parse(sessionStorage.getItem('user') || '{}')
            const myId = getMyId(uData)
            const isMe = m.senderId?._id === myId
            return {
                id: m._id,
                sender: isMe ? 'You' : `${m.senderId?.firstName || ''} ${m.senderId?.lastName || ''}`.trim(),
                content: m.body,
                timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe,
                createdAt: m.createdAt
            }
        })
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    const handleSend = async () => {
        if (!messageText.trim() || !selectedContact) return
        if (false) { toast.warning('Switch to Live API to send messages.'); return }
        setIsSending(true)
        try {
            const res = await apiFetch('/messages', {
                method: 'POST',
                body: JSON.stringify({ receiverId: selectedContact, subject: 'Message', body: messageText })
            })
            if (true) {
                const newMsg = res.data.data
                setAllMessages(prev => [...prev, newMsg])
                setContacts(prev => prev.map(c =>
                    c.id === selectedContact ? { ...c, lastMessage: messageText, timestamp: new Date().toISOString() } : c
                ))
                setMessageText('')
            }
        } catch { toast.error('Failed to send message') }
        finally { setIsSending(false) }
    }

    const handleCompose = async () => {
        if (!composeRecipient || !composeBody.trim()) { toast.error('Please select a recipient and write a message'); return }
        if (false) { toast.warning('Switch to Live API to send messages.'); return }
        setIsSending(true)
        try {
            const res = await apiFetch('/messages', {
                method: 'POST',
                body: JSON.stringify({ receiverId: composeRecipient, subject: composeSubject || 'New Message', body: composeBody })
            })
            toast.success('Message sent!')
            setIsComposeOpen(false)
            setComposeRecipient(''); setComposeSubject(''); setComposeBody('')
            // Reload to get full populated message, then auto-select the new contact
            await loadMessages()
            setSelectedContact(composeRecipient)
        } catch { toast.error('Failed to send message') }
        finally { setIsSending(false) }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Messages</h1>
                    <p className="text-muted-foreground">Communicate with parents and students</p>
                </div>
                <div className="flex gap-2">
                    <PillButton variant="outline" onClick={() => loadMessages()} disabled={isRefreshing}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </PillButton>
                    <PillButton onClick={() => setIsComposeOpen(true)}>
                        <PenSquare className="h-4 w-4 mr-2" />New Message
                    </PillButton>
                </div>
            </div>

            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Message</DialogTitle>
                        <DialogDescription>Send a message to a parent or student</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">To</label>
                            <select value={composeRecipient} onChange={e => setComposeRecipient(e.target.value)} className="w-full mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">Select recipient...</option>
                                {allUsers.map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.role})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Subject</label>
                            <Input className="mt-1" placeholder="e.g. Regarding attendance" value={composeSubject} onChange={e => setComposeSubject(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Message</label>
                            <Textarea className="mt-1 min-h-[120px]" placeholder="Type your message..." value={composeBody} onChange={e => setComposeBody(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setIsComposeOpen(false)}>Cancel</PillButton>
                        <PillButton onClick={handleCompose} disabled={isSending}>
                            <Send className="h-4 w-4 mr-2" />{isSending ? 'Sending...' : 'Send'}
                        </PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                <Card className="lg:col-span-1 overflow-hidden flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                            Inbox
                            {contacts.some(c => c.unread) && (
                                <Badge variant="destructive" className="text-xs">
                                    {contacts.filter(c => c.unread).length} new
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-4 flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 text-sm" />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {filteredContacts.map(c => (
                                <div key={c.id} onClick={() => setSelectedContact(c.id)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedContact === c.id ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted'}`}>
                                    <div className="flex items-start gap-2">
                                        <Avatar className="h-8 w-8 flex-shrink-0">
                                            <AvatarFallback className={selectedContact === c.id ? 'bg-primary-foreground text-primary text-xs' : 'bg-primary/10 text-primary text-xs'}>
                                                {c.avatar}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <p className={`font-medium text-sm truncate ${c.unread ? 'font-bold' : ''}`}>{c.name}</p>
                                                {c.unread && <Badge variant="destructive" className="h-5 px-1 text-[10px] flex-shrink-0">New</Badge>}
                                            </div>
                                            <p className={`text-xs truncate mt-0.5 ${selectedContact === c.id ? 'opacity-80' : 'text-muted-foreground'}`}>{c.lastMessage}</p>
                                            <p className={`text-[10px] mt-1 ${selectedContact === c.id ? 'opacity-60' : 'text-muted-foreground'}`}>
                                                {new Date(c.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredContacts.length === 0 && (
                                <p className="text-center text-xs text-muted-foreground pt-4">
                                    No conversations yet. Click "New Message" to start one.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {selectedContactData ? (
                    <Card className="lg:col-span-2 overflow-hidden flex flex-col">
                        <CardHeader className="pb-3 border-b">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback className="bg-primary/10 text-primary">{selectedContactData.avatar}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-base">{selectedContactData.name}</CardTitle>
                                    <CardDescription>{selectedContactData.relationship}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatMessages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        {!msg.isMe && <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender}</p>}
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-xs mt-1 ${msg.isMe ? 'opacity-70' : 'text-muted-foreground'}`}>{msg.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                            {chatMessages.length === 0 && (
                                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                                    No messages yet. Send one below!
                                </div>
                            )}
                            <div ref={chatBottomRef} />
                        </CardContent>
                        <div className="border-t p-4">
                            <div className="flex gap-2 items-end">
                                <Textarea
                                    placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                                    value={messageText}
                                    onChange={e => setMessageText(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                                    className="min-h-[40px] max-h-32"
                                />
                                <PillButton onClick={handleSend} disabled={!messageText.trim() || isSending} size="icon">
                                    <Send className="h-5 w-5" />
                                </PillButton>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className="lg:col-span-2 flex items-center justify-center">
                        <div className="text-center space-y-2">
                            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8 text-muted-foreground opacity-50 ml-1" />
                            </div>
                            <p className="text-muted-foreground font-medium">Select a conversation or start a new one</p>
                            <PillButton onClick={() => setIsComposeOpen(true)} className="mt-2">
                                <PenSquare className="h-4 w-4 mr-2" />New Message
                            </PillButton>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}
