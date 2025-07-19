import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Paperclip, Smile, MoreHorizontal } from 'lucide-react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { ScrollArea } from '../ui/scroll-area'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { blink } from '../../blink/client'
import { formatDistanceToNow } from 'date-fns'

interface User {
  id: string
  email: string
  displayName?: string
}

interface Channel {
  id: string
  teamId: string
  name: string
  description?: string
  type: string
  createdAt: string
  createdBy: string
}

interface Message {
  id: string
  channelId: string
  userId: string
  content: string
  messageType: string
  replyTo?: string
  createdAt: string
  updatedAt: string
  isDeleted: boolean
}

interface ChatAreaProps {
  selectedChannel: Channel | null
  user: User
}

export function ChatArea({ selectedChannel, user }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (selectedChannel) {
      loadMessages()
      setupRealtimeSubscription()
    }
  }, [selectedChannel, loadMessages, setupRealtimeSubscription])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = useCallback(async () => {
    if (!selectedChannel) return

    try {
      setLoading(true)
      const channelMessages = await blink.db.messages.list({
        where: { 
          channelId: selectedChannel.id,
          isDeleted: "0"
        },
        orderBy: { createdAt: 'asc' },
        limit: 100
      })
      setMessages(channelMessages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedChannel])

  const setupRealtimeSubscription = useCallback(() => {
    if (!selectedChannel) return

    const channelName = `channel_${selectedChannel.id}`
    
    const unsubscribe = blink.realtime.subscribe(channelName, (message) => {
      if (message.type === 'new_message') {
        setMessages(prev => [...prev, message.data])
      } else if (message.type === 'message_updated') {
        setMessages(prev => prev.map(msg => 
          msg.id === message.data.id ? message.data : msg
        ))
      } else if (message.type === 'message_deleted') {
        setMessages(prev => prev.filter(msg => msg.id !== message.data.id))
      }
    })

    return unsubscribe
  }, [selectedChannel])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !user) return

    try {
      const messageData = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId: selectedChannel.id,
        userId: user.id,
        content: newMessage.trim(),
        messageType: 'text',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false
      }

      // Optimistic update
      setMessages(prev => [...prev, messageData])
      setNewMessage('')

      // Save to database
      await blink.db.messages.create(messageData)

      // Broadcast to other users
      await blink.realtime.publish(`channel_${selectedChannel.id}`, 'new_message', messageData)

    } catch (error) {
      console.error('Failed to send message:', error)
      // Remove optimistic update on error
      setMessages(prev => prev.filter(msg => msg.id !== `msg_${Date.now()}`))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getInitials = (email: string, displayName?: string) => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return 'just now'
    }
  }

  if (!selectedChannel) {
    return (
      <div className="flex-1 teams-chat-area flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Welcome to Teams</h3>
          <p className="text-muted-foreground">Select a channel to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 teams-chat-area flex flex-col">
      {/* Channel header */}
      <div className="h-14 border-b border-border flex items-center px-6">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">#{selectedChannel.name}</h3>
          {selectedChannel.description && (
            <span className="text-sm text-muted-foreground">
              | {selectedChannel.description}
            </span>
          )}
        </div>
        <div className="ml-auto">
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const showAvatar = index === 0 || messages[index - 1].userId !== message.userId
              const isOwnMessage = message.userId === user.id

              return (
                <div
                  key={message.id}
                  className={`teams-message group flex gap-3 p-2 rounded hover:bg-muted/50 ${
                    showAvatar ? 'mt-4' : 'mt-1'
                  }`}
                >
                  <div className="w-8">
                    {showAvatar && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(message.userId, isOwnMessage ? user.displayName : undefined)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {isOwnMessage ? (user.displayName || user.email.split('@')[0]) : message.userId}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>

                  <div className="message-actions opacity-0 group-hover:opacity-100 flex items-start gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Smile className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
            
            {messages.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t border-border">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message #${selectedChannel.name}`}
            className="min-h-[44px] max-h-32 resize-none pr-20 py-3"
            rows={1}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Smile className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}