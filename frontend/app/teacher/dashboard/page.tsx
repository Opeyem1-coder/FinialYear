'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, BookOpen, MessageSquare, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

export default function TeacherDashboard() {
  const [userName, setUserName] = useState('Teacher')
  const [courses, setCourses] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    const loadDashboard = async () => {
      try {
        const uStr = sessionStorage.getItem('user')
        if (uStr) {
          const u = JSON.parse(uStr)
          setUserName(u.firstName || u.name || 'Teacher')
        }

        const [courseRes, msgRes] = await Promise.all([
          apiFetch('/courses').catch(() => ({ isMock: true, data: { data: [] } })),
          apiFetch('/messages').catch(() => ({ isMock: true, data: { data: [] } }))
        ])

        if (mounted) {
          if (!courseRes.isMock) {
            setCourses(courseRes.data?.data || [])
          } else {
            setCourses([
              { _id: '1', courseName: 'CSC 301 — Data Structures', subject: 'Computer Science', students: 28 },
              { _id: '2', courseName: 'CSC 305 — Operating Systems', subject: 'Computer Science', students: 30 },
              { _id: '3', courseName: 'MTH 201 — Linear Algebra', subject: 'Mathematics', students: 26 },
            ])
          }

          if (!msgRes.isMock) {
            setMessages(msgRes.data?.data || [])
          } else {
            setMessages([
              { _id: 'm1', senderName: 'Sarah Johnson', subject: 'Question about homework', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
              { _id: 'm2', senderName: 'Michael Brown', subject: 'Concern about exam', createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
              { _id: 'm3', senderName: 'Robert Wilson', subject: 'Child progress update', createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
            ])
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      }
    }
    loadDashboard()
    return () => { mounted = false }
  }, [])

  const stats = [
    { title: 'Courses', value: courses.length.toString(), description: courses.slice(0, 3).map(c => c.courseName.split(' ')[0]).join(', ') || 'No active courses', icon: <BookOpen className="h-8 w-8" />, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
    { title: 'Students', value: courses.length > 0 ? '84' : '0', description: 'Total across all courses', icon: <Users className="h-8 w-8" />, color: 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-500' },
    { title: 'Unread Messages', value: messages.length.toString(), description: 'From students and parents', icon: <MessageSquare className="h-8 w-8" />, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
    { title: 'Pending Tasks', value: '5', description: 'Grades to submit', icon: <Calendar className="h-8 w-8" />, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
          Welcome Back, {userName}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your classes today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div>
                <CardDescription>{stat.title}</CardDescription>
                <CardTitle className="text-3xl mt-2">{stat.value}</CardTitle>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              My Classes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {courses.slice(0, 3).map((course, idx) => (
                <div key={course._id || idx} className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm text-foreground">{course.courseName}</p>
                      <p className="text-xs text-muted-foreground">{course.students || 0} students</p>
                    </div>
                    <Badge>{course.subject || 'General'}</Badge>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-lg">
                  No courses assigned yet.
                </div>
              )}
            </div>
            <Link href="/teacher/classes">
              <PillButton fullWidth variant="secondary">
                Manage Classes
              </PillButton>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-500" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {messages.slice(0, 4).map((msg, idx) => (
                <div key={msg._id || idx} className="p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted/70 transition-colors cursor-pointer">
                  <p className="font-medium text-sm text-foreground">{msg.senderName || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground truncate">{msg.subject || 'No Subject'}</p>
                  <div className="flex items-center text-xs text-accent mt-1 gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-lg">
                  No recent messages.
                </div>
              )}
            </div>
            <Link href="/teacher/messages">
              <PillButton fullWidth variant="secondary">
                View All Messages
              </PillButton>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Tasks</CardTitle>
          <CardDescription>
            Items requiring your attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="font-medium text-sm text-foreground">Submit mid-term grades</p>
                <p className="text-xs text-muted-foreground">Deadline: March 15, 2024</p>
              </div>
              <Badge variant="warning">Urgent</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="font-medium text-sm text-foreground">Update attendance records</p>
                <p className="text-xs text-muted-foreground">March 5-10 absences</p>
              </div>
              <Badge variant="info">Pending</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="font-medium text-sm text-foreground">Review discipline reports</p>
                <p className="text-xs text-muted-foreground">3 new reports this week</p>
              </div>
              <Badge variant="outline">Review</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
