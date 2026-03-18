import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Message } from '../types'

interface MessageBubbleProps {
 message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
 const isUser = message.role === 'user'

 return (
 <div className={`message-bubble ${isUser ? 'message-user' : 'message-agent'}`}>
 <div className="message-header">
 <span className="message-role">
 {isUser ? '👤 You' : '🤖 Agent Zero'}
 </span>
 <span className="message-time">
 {new Date(message.timestamp).toLocaleTimeString()}
 </span>
 </div>
 <div className="message-content">
 <ReactMarkdown
 children={message.content}
 components={{
 code({ className, children }) {
 const match = /language-(\w+)/.exec(className || '')
 const isInline = !match && !className

 if (isInline) {
 return <code className="inline-code">{children}</code>
 }

 return (
 <SyntaxHighlighter
 style={vscDarkPlus as any}
 language={match ? match[1] : 'text'}
 PreTag="div"
 >
 {String(children).replace(/\n$/, '')}
 </SyntaxHighlighter>
 )
 }
 }}
 />
 </div>
 {message.attachments && message.attachments.length > 0 && (
 <div className="message-attachments">
 {message.attachments.map((att) => (
 <span key={att.id} className="attachment-badge">
 📎 {att.name}
 </span>
 ))}
 </div>
 )}
 </div>
 )
}
