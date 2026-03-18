import { create } from 'zustand'
import type { Message, Chat, ToolCall } from '../types'

interface ChatState {
 chats: Chat[]
 currentContext: string | null
 messages: Message[]
 toolCalls: ToolCall[]
 isLoading: boolean
 isStreaming: boolean
 error: string | null
 
 // Actions
 setCurrentContext: (context: string) => void
 addMessage: (message: Message) => void
 updateMessage: (id: string, content: string) => void
 setMessages: (messages: Message[]) => void
 addToolCall: (toolCall: ToolCall) => void
 updateToolCall: (id: string, updates: Partial<ToolCall>) => void
 clearToolCalls: () => void
 setLoading: (loading: boolean) => void
 setStreaming: (streaming: boolean) => void
 setError: (error: string | null) => void
 loadChats: () => Promise<void>
 createChat: () => Promise<string>
 removeChat: (context: string) => Promise<void>
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const useChatStore = create<ChatState>((set) => ({
 chats: [],
 currentContext: null,
 messages: [],
 toolCalls: [],
 isLoading: false,
 isStreaming: false,
 error: null,

 setCurrentContext: (context) => set({ currentContext: context }),

 addMessage: (message) => set((state) => ({
 messages: [...state.messages, message]
 })),

 updateMessage: (id, content) => set((state) => ({
 messages: state.messages.map(m => m.id === id ? { ...m, content } : m)
 })),

 setMessages: (messages) => set({ messages }),

 addToolCall: (toolCall) => set((state) => ({
 toolCalls: [...state.toolCalls, toolCall]
 })),

 updateToolCall: (id, updates) => set((state) => ({
 toolCalls: state.toolCalls.map(t => t.id === id ? { ...t, ...updates } : t)
 })),

 clearToolCalls: () => set({ toolCalls: [] }),

 setLoading: (loading) => set({ isLoading: loading }),
 setStreaming: (streaming) => set({ isStreaming: streaming }),
 setError: (error) => set({ error }),

 loadChats: async () => {
 try {
 const response = await fetch(`${API_URL}/chat_load`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ chats: [] })
 })
 const data = await response.json()
 if (data.ctxids) {
 const chats = data.ctxids.map((id: string) => ({
 id,
 name: id,
 createdAt: Date.now(),
 messageCount: 0
 }))
 set({ chats, currentContext: chats[0]?.id || null })
 }
 } catch (error) {
 console.error('Failed to load chats:', error)
 }
 },

 createChat: async () => {
 try {
 const response = await fetch(`${API_URL}/chat_create`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({})
 })
 const data = await response.json()
 if (data.ctxid) {
 const newChat: Chat = {
 id: data.ctxid,
 name: data.ctxid,
 createdAt: Date.now(),
 messageCount: 0
 }
 set((state) => ({
 chats: [newChat, ...state.chats],
 currentContext: data.ctxid,
 messages: []
 }))
 return data.ctxid
 }
 } catch (error) {
 console.error('Failed to create chat:', error)
 }
 return ''
 },

 removeChat: async (context) => {
 try {
 await fetch(`${API_URL}/chat_remove`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ context })
 })
 set((state) => ({
 chats: state.chats.filter(c => c.id !== context),
 currentContext: state.currentContext === context
 ? state.chats.find(c => c.id !== context)?.id || null
 : state.currentContext
 }))
 } catch (error) {
 console.error('Failed to remove chat:', error)
 }
 }
}))
