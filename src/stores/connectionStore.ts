import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

interface ConnectionState {
 status: 'connected' | 'disconnected' | 'connecting'
 serverVersion: string | null
 runtimeId: string | null
 socket: Socket | null
 error: string | null
 initialize: () => void
 disconnect: () => void
 reconnect: () => void
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const useConnectionStore = create<ConnectionState>((set, get) => ({
 status: 'disconnected',
 serverVersion: null,
 runtimeId: null,
 socket: null,
 error: null,

 initialize: () => {
 set({ status: 'connecting', error: null })

 const socket = io(API_URL, {
 transports: ['websocket', 'polling'],
 reconnection: true,
 reconnectionAttempts: 10,
 reconnectionDelay: 1000,
 reconnectionDelayMax: 5000,
 })

 socket.on('connect', () => {
 console.log('[Socket] Connected to Agent Zero')
 set({ status: 'connected', socket, error: null })
 })

 socket.on('disconnect', (reason) => {
 console.log('[Socket] Disconnected:', reason)
 set({ status: 'disconnected' })
 })

 socket.on('connect_error', (error) => {
 console.error('[Socket] Connection error:', error)
 set({ status: 'disconnected', error: error.message })
 })

 socket.on('state_push', (data: { runtime_epoch: string; snapshot: unknown }) => {
 set({ runtimeId: data.runtime_epoch })
 })

 set({ socket })
 },

 disconnect: () => {
 const { socket } = get()
 if (socket) {
 socket.disconnect()
 set({ socket: null, status: 'disconnected' })
 }
 },

 reconnect: () => {
 const { socket } = get()
 if (socket) {
 socket.connect()
 }
 },
}))
