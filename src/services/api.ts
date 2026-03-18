import axios from 'axios'
import type { Snapshot } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
 baseURL: API_URL,
 headers: {
 'Content-Type': 'application/json',
 },
})

export interface SendMessageParams {
 text: string
 context: string
 message_id?: string
 attachments?: File[]
}

export const agentZeroApi = {
 async sendMessage({ text, context, message_id, attachments }: SendMessageParams) {
 const formData = new FormData()
 formData.append('text', text)
 formData.append('context', context)
 if (message_id) formData.append('message_id', message_id)
 if (attachments) {
 attachments.forEach((file) => {
 formData.append('attachments', file)
 })
 }

 const response = await api.post('/message_async', formData, {
 headers: { 'Content-Type': 'multipart/form-data' },
 })
 return response.data
 },

 async poll(context: string, logFrom: number = 0, notificationsFrom: number = 0) {
 const response = await api.post('/poll', {
 context,
 log_from: logFrom,
 notifications_from: notificationsFrom,
 timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
 })
 return response.data as Snapshot
 },

 async createChat(currentContext?: string) {
 const response = await api.post('/chat_create', {
 current_context: currentContext,
 })
 return response.data
 },

 async loadChats(chats: string[] = []) {
 const response = await api.post('/chat_load', { chats })
 return response.data
 },

 async removeChat(context: string) {
 const response = await api.post('/chat_remove', { context })
 return response.data
 },

 async resetChat(context: string) {
 const response = await api.post('/chat_reset', { context })
 return response.data
 },

 async getHealth() {
 const response = await api.get('/health')
 return response.data
 },
}

export default api
