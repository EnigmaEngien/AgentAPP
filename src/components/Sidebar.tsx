import { Plus, MessageSquare, Trash2, Settings } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'

export default function Sidebar() {
 const { chats, currentContext, setCurrentContext, createChat, removeChat } = useChatStore()

 const handleNewChat = async () => {
 await createChat()
 }

 const handleDeleteChat = async (context: string, e: React.MouseEvent) => {
 e.stopPropagation()
 if (confirm('Delete this chat?')) {
 await removeChat(context)
 }
 }

 return (
 <aside className="sidebar">
 <div className="sidebar-header">
 <h1>🤖 Agent Zero</h1>
 </div>

 <button className="new-chat-btn" onClick={handleNewChat}>
 <Plus size={16} />
 <span>New Chat</span>
 </button>

 <div className="sidebar-section">
 <h3>Conversations</h3>
 <ul className="chat-list">
 {chats.map((chat) => (
 <li
 key={chat.id}
 className={`chat-item ${currentContext === chat.id ? 'active' : ''}`}
 onClick={() => setCurrentContext(chat.id)}
 >
 <MessageSquare size={14} />
 <span className="chat-name">{chat.name}</span>
 {chats.length > 1 && (
 <button
 className="delete-chat-btn"
 onClick={(e) => handleDeleteChat(chat.id, e)}
 title="Delete chat"
 >
 <Trash2 size={12} />
 </button>
 )}
 </li>
 ))}
 </ul>
 </div>

 <div className="sidebar-section" style={{ marginTop: 'auto' }}>
 <h3>Settings</h3>
 <div className="settings-placeholder">
 <Settings size={14} />
 <span>Model Settings (Coming Soon)</span>
 </div>
 </div>
 </aside>
 )
}
