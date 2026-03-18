import { Wifi, WifiOff, Loader } from 'lucide-react'
import { useConnectionStore } from '../stores/connectionStore'

export default function StatusBar() {
 const { status, runtimeId, error } = useConnectionStore()

 return (
 <div className="status-bar">
 <div className="connection-status">
 {status === 'connected' && (
 <>
 <Wifi size={14} />
 <span className="status-dot connected"></span>
 <span>Connected</span>
 </>
 )}
 {status === 'disconnected' && (
 <>
 <WifiOff size={14} />
 <span className="status-dot disconnected"></span>
 <span>Disconnected</span>
 </>
 )}
 {status === 'connecting' && (
 <>
 <Loader size={14} className="spin" />
 <span className="status-dot connecting"></span>
 <span>Connecting...</span>
 </>
 )}
 </div>
 
 {runtimeId && (
 <div className="runtime-info">
 <span className="runtime-id">Runtime: {runtimeId.slice(0, 8)}</span>
 </div>
 )}
 
 {error && (
 <div className="error-message">
 <span>{error}</span>
 </div>
 )}
 </div>
 )
}
