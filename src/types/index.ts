export interface Message {
 id: string
 role: 'user' | 'agent'
 content: string
 timestamp: number
 attachments?: Attachment[]
}

export interface Attachment {
 id: string
 name: string
 path: string
 type: string
}

export interface ToolCall {
 id: string
 name: string
 status: 'running' | 'success' | 'error'
 args: Record<string, unknown>
 result?: string
 timestamp: number
}

export interface Chat {
 id: string
 name: string
 createdAt: number
 messageCount: number
}

export interface ConnectionState {
 status: 'connected' | 'disconnected' | 'connecting'
 serverVersion?: string
 runtimeId?: string
}

export interface Snapshot {
 logs: LogEntry[]
 notifications: Notification[]
}

export interface LogEntry {
 id: string
 type: string
 content: string
 timestamp: number
}

export interface Notification {
 id: string
 type: string
 message: string
 timestamp: number
}
