'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-client'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Send, User, MessageCircle } from 'lucide-react'

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  conversation_id: string
}

type Contact = {
  id: string
  name: string
  email: string
  user_type: 'student' | 'employer'
  company_name?: string
  last_message?: string
  last_message_time?: string
  unread_count?: number
}

type Conversation = {
  id: string
  other_user: Contact
  messages: Message[]
}

export default function Messages() {
  const { profile } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      fetchConversations()
      setupRealtimeSubscription()
    }
  }, [profile])

  useEffect(() => {
    scrollToBottom()
  }, [conversations, activeConversation])

  const fetchConversations = async () => {
    try {
      // Get all applications where user is involved (either as student or employer)
      let applicationsQuery = supabase
        .from('applications')
        .select(`
          *,
          job:jobs(*),
          student:users!applications_student_id_fkey(*),
          employer:users!applications_job_id_fkey(*)
        `)

      if (profile?.user_type === 'student') {
        applicationsQuery = applicationsQuery.eq('student_id', profile.id)
      } else {
        // For employers, get applications for their jobs
        const { data: jobIds } = await supabase
          .from('jobs')
          .select('id')
          .eq('employer_id', profile?.id)

        if (jobIds && jobIds.length > 0) {
          applicationsQuery = applicationsQuery.in('job_id', jobIds.map(job => job.id))
        } else {
          setLoading(false)
          return
        }
      }

      applicationsQuery = applicationsQuery.eq('status', 'accepted')

      const { data: applications, error: appError } = await applicationsQuery

      if (appError) throw appError

      if (!applications || applications.length === 0) {
        setLoading(false)
        return
      }

      // Build conversations
      const conversationMap = new Map<string, Conversation>()

      for (const app of applications) {
        const otherUser = profile?.user_type === 'student' 
          ? {
              id: app.job.employer_id,
              name: app.job.company_name,
              email: '',
              user_type: 'employer' as const,
              company_name: app.job.company_name
            }
          : {
              id: app.student.id,
              name: app.student.name,
              email: app.student.email,
              user_type: 'student' as const
            }

        const conversationId = [profile?.id, otherUser.id].sort().join('-')

        if (!conversationMap.has(conversationId)) {
          // Fetch messages for this conversation
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

          conversationMap.set(conversationId, {
            id: conversationId,
            other_user: otherUser,
            messages: messages || []
          })
        }
      }

      setConversations(Array.from(conversationMap.values()))
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${profile?.id},receiver_id=eq.${profile?.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message
          updateConversationWithNewMessage(newMessage)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const updateConversationWithNewMessage = (newMessage: Message) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === newMessage.conversation_id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage]
        }
      }
      return conv
    }))
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation || sending) return

    setSending(true)
    try {
      const conversation = conversations.find(c => c.id === activeConversation)
      if (!conversation) return

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: profile?.id!,
          receiver_id: conversation.other_user.id,
          content: newMessage.trim(),
          conversation_id: activeConversation
        })

      if (error) throw error

      setNewMessage('')
      // The message will be added via the realtime subscription
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  const activeConv = conversations.find(c => c.id === activeConversation)

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow overflow-hidden">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <p className="text-sm text-gray-600">Chat with your connections</p>
            </div>
            
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-sm text-gray-600">
                  {profile?.user_type === 'student' 
                    ? 'Apply to jobs and get accepted to start messaging employers.'
                    : 'Accept student applications to start conversations.'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      activeConversation === conversation.id ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                    }`}
                    onClick={() => setActiveConversation(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.other_user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {conversation.other_user.user_type === 'employer' ? 'Employer' : 'Student'}
                        </p>
                        {conversation.messages.length > 0 && (
                          <p className="text-xs text-gray-600 truncate mt-1">
                            {conversation.messages[conversation.messages.length - 1].content}
                          </p>
                        )}
                      </div>
                      {conversation.messages.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {formatTime(conversation.messages[conversation.messages.length - 1].created_at)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <User className="h-8 w-8 text-gray-400" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {activeConv.other_user.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {activeConv.other_user.user_type === 'employer' ? 'Employer' : 'Student'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeConv.messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    activeConv.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === profile?.id
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender_id === profile?.id ? 'text-primary-100' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim() || sending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the sidebar to start messaging.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}