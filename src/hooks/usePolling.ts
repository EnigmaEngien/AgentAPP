import { useEffect, useRef, useCallback } from 'react'
import { useChatStore } from '../stores/chatStore'
import { useConnectionStore } from '../stores/connectionStore'
import { agentZeroApi } from '../services/api'
import type { LogEntry } from '../types'

export function usePolling() {
 const { currentContext, addMessage, addToolCall, updateToolCall } = useChatStore()
 const { status, socket } = useConnectionStore()
 const logFromRef = useRef(0)
 const notificationsFromRef = useRef(0)

 const poll = useCallback(async () => {
 if (!currentContext) return

 try {
 const snapshot = await agentZeroApi.poll(
 currentContext,
 logFromRef.current,
 notificationsFromRef.current
 )

 if (snapshot?.logs) {
 snapshot.logs.forEach((log: LogEntry) => {
 logFromRef.current = Math.max(logFromRef.current, parseInt(log.id) || 0)

 // Process different log types
 if (log.type === 'response') {
 addMessage({
 id: `agent-${log.id}`,
 role: 'agent',
 content: log.content,
 timestamp: log.timestamp || Date.now(),
 })
 }

 if (log.type === 'tool_call') {
 const toolData = JSON.parse(log.content || '{}')
 addToolCall({
 id: toolData.id || `tool-${Date.now()}`,
 name: toolData.name || 'unknown',
 status: 'running',
 args: toolData.args || {},
 timestamp: Date.now(),
 })
 }

 if (log.type === 'tool_result') {
 const toolData = JSON.parse(log.content || '{}')
 updateToolCall(toolData.id, {
 status: toolData.success ? 'success' : 'error',
 result: toolData.result,
 })
 }
 })
 }

 if (snapshot?.notifications) {
 notificationsFromRef.current = snapshot.notifications.length
 }
 } catch (error) {
 console.error('Polling error:', error)
 }
 }, [currentContext, addMessage, addToolCall, updateToolCall])

 useEffect(() => {
 // Use WebSocket events if connected, otherwise poll
 if (status === 'connected' && socket) {
 const handleStatePush = (data: { snapshot: { logs: LogEntry[] } }) => {
 if (data.snapshot?.logs) {
 data.snapshot.logs.forEach((log: LogEntry) => {
 if (log.type === 'response') {
 addMessage({
 id: `agent-${log.id}`,
 role: 'agent',
 content: log.content,
 timestamp: log.timestamp || Date.now(),
 })
 }
 })
 }
 }

 socket.on('state_push', handleStatePush)
 return () => {
 socket.off('state_push', handleStatePush)
 }
 } else {
 // Fallback to polling
 const interval = setInterval(poll, 1000)
 return () => clearInterval(interval)
 }
 }, [status, socket, poll, addMessage])
}
