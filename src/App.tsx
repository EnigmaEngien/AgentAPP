import { useEffect } from 'react'
import { useConnectionStore } from './stores/connectionStore'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'
import StatusBar from './components/StatusBar'
import ToolOutputPanel from './components/ToolOutputPanel'

function App() {
 const { initialize, status } = useConnectionStore()

 useEffect(() => {
 initialize()
 }, [initialize])

 return (
 <div className="app" data-connected={status === 'connected'}>
 <Sidebar />
 <main className="main-content">
 <StatusBar />
 <ChatWindow />
 <ToolOutputPanel />
 <InputBar />
 </main>
 </div>
 )
}

export default App
