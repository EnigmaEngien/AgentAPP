import { useEffect, useRef } from 'react'
import { useChatStore } from '../stores/chatStore'
import MessageBubble from './MessageBubble'

export default function ChatWindow() {
 const { messages, isLoading } = useChatStore()
 const messagesEndRef = useRef<HTMLDivElement>(null)

 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
 }, [messages])

 return (
 <div className="chat-window">
 {messages.length === 0 && !isLoading && (
 <div className="empty-state">
 <h2>Welcome to Agent Zero</h2>
 <p>Start a conversation by typing a message below.</p>
 </div>
 )}
 {messages.map((message) => (
 <MessageBubble key={message.id} message={message} />
 ))}
 {isLoading && (
 <div className="message-bubble message-agent">
 <div className="typing-indicator">
 <span></span>
 <span></span>
 <span></span>
 </div>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>
 )
}
