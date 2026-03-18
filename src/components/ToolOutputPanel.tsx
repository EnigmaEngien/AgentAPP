import { Terminal, CheckCircle, XCircle, Loader } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'

export default function ToolOutputPanel() {
 const { toolCalls } = useChatStore()

 if (toolCalls.length === 0) return null

 return (
 <div className="tool-output-panel">
 <div className="tool-header">
 <Terminal size={14} />
 <span>Tool Calls</span>
 </div>
 {toolCalls.map((tool) => (
 <div key={tool.id} className={`tool-item ${tool.status}`}>
 <div className="tool-name">
 {tool.status === 'running' && <Loader size={12} className="spin" />}
 {tool.status === 'success' && <CheckCircle size={12} />}
 {tool.status === 'error' && <XCircle size={12} />}
 <span>{tool.name}</span>
 </div>
 <div className="tool-args">
 {Object.entries(tool.args).map(([key, value]) => (
 <span key={key} className="arg">
 {key}: {typeof value === 'string' ? value : JSON.stringify(value).slice(0, 50)}
 </span>
 ))}
 </div>
 {tool.result && (
 <div className="tool-result">
 {tool.result.slice(0, 200)}
 {tool.result.length > 200 && '...'}
 </div>
 )}
 </div>
 ))}
 </div>
 )
}
