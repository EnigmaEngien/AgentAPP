import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import { agentZeroApi } from '../services/api'

export default function InputBar() {
 const [text, setText] = useState('')
 const [attachments, setAttachments] = useState<File[]>([])
 const textareaRef = useRef<HTMLTextAreaElement>(null)
 const fileInputRef = useRef<HTMLInputElement>(null)
 
 const { currentContext, setLoading, addMessage, setError } = useChatStore()

 useEffect(() => {
 if (textareaRef.current) {
 textareaRef.current.style.height = 'auto'
 textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
 }
 }, [text])

 const handleSubmit = async () => {
 if (!text.trim() && attachments.length === 0) return
 if (!currentContext) return

 const messageId = `msg-${Date.now()}`
 
 // Add user message to UI
 addMessage({
 id: messageId,
 role: 'user',
 content: text,
 timestamp: Date.now(),
 attachments: attachments.map(f => ({
 id: `att-${Date.now()}-${f.name}`,
 name: f.name,
 path: '',
 type: f.type
 }))
 })

 setLoading(true)

 try {
 await agentZeroApi.sendMessage({
 text,
 context: currentContext,
 message_id: messageId,
 attachments
 })
 setText('')
 setAttachments([])
 } catch (error) {
 setError('Failed to send message')
 console.error('Send error:', error)
 } finally {
 setLoading(false)
 }
 }

 const handleKeyDown = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault()
 handleSubmit()
 }
 }

 const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files) {
 setAttachments(prev => [...prev, ...Array.from(e.target.files!)])
 }
 }

 const removeAttachment = (index: number) => {
 setAttachments(prev => prev.filter((_, i) => i !== index))
 }

 return (
 <div className="input-bar">
 <input
 type="file"
 ref={fileInputRef}
 onChange={handleFileSelect}
 multiple
 style={{ display: 'none' }}
 />
 
 <button
 className="icon-btn"
 onClick={() => fileInputRef.current?.click()}
 title="Attach files"
 >
 <Paperclip size={20} />
 </button>

 {attachments.length > 0 && (
 <div className="attachments-preview">
 {attachments.map((file, i) => (
 <span key={i} className="attachment-chip" onClick={() => removeAttachment(i)}>
 {file.name} ×
 </span>
 ))}
 </div>
 )}

 <textarea
 ref={textareaRef}
 value={text}
 onChange={(e) => setText(e.target.value)}
 onKeyDown={handleKeyDown}
 placeholder="Type a message... (Shift+Enter for new line)"
 disabled={!currentContext}
 />

 <button
 onClick={handleSubmit}
 disabled={!text.trim() && attachments.length === 0}
 title="Send message"
 >
 <Send size={20} />
 </button>
 </div>
 )
}
