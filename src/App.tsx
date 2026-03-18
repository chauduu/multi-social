import { useState, useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import SidebarRight from './components/layout/SidebarRight'
import ChatBox from './components/chat/ChatBox'
import ContentEditor from './components/editor/ContentEditor'
import MediaPreview from './components/editor/MediaPreview'
import { CheckCircle2, ExternalLink, X, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { publishToFacebook, publishToInstagram, publishToThreads, checkTokenValidity } from './services/apiPublish'

function App() {
  const [content, setContent] = useState('')
  const [mediaItems, setMediaItems] = useState<any[]>([
    { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop', name: 'abstract-1.jpg' },
  ])
  
  const [publishing, setPublishing] = useState(false)
  const [publishResults, setPublishResults] = useState<Record<string, { status: 'pending' | 'success' | 'failed'; link?: string; error?: string }>>({})

  const [publishSchedule, setPublishSchedule] = useState<'now' | 'scheduled'>('now')
  const [scheduleTime, setScheduleTime] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<Record<string, { post: boolean; story: boolean }>>({})

  useEffect(() => {
    // Current time + 30 mins default
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30)
    const formatted = now.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
    setScheduleTime(formatted)
  }, [])

  const handlePublish = async () => {
    const channels = Object.keys(selectedChannels)
    if (channels.length === 0) {
      alert('Vui lòng bật bật/kết nối ít nhất một mạng xã hội để đăng bài.')
      return
    }

    setPublishing(true)
    
    // Initialize results as pending
    const initialResults: Record<string, { status: 'pending' }> = {}
    channels.forEach(id => {
      initialResults[id] = { status: 'pending' }
    })
    setPublishResults(initialResults as any)

    for (const id of channels) {
      // Seq delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 300))

      if (id === 'fb') {
        const token = (import.meta as any).env.VITE_FACEBOOK_APP_ID // User token
        if (checkTokenValidity(token)) {
          const result = await publishToFacebook(content, mediaItems, token)
          setPublishResults(prev => ({
            ...prev,
            [id]: result.success 
              ? { status: 'success', link: result.link, details: result.pageName ? `Đã đăng lên: ${result.pageName}` : '' } 
              : { status: 'failed', error: result.error }
          }))
          continue
        }
      }

      if (id === 'ig') {
        const token = (import.meta as any).env.VITE_INSTAGRAM_CLIENT_ID
        if (checkTokenValidity(token)) {
          const result = await publishToInstagram(content, mediaItems, token)
          setPublishResults(prev => ({
            ...prev,
            [id]: result.success 
              ? { status: 'success', link: result.link } 
              : { status: 'failed', error: result.error }
          }))
          continue
        }
      }

      if (id === 'threads') {
        const token = (import.meta as any).env.VITE_INSTAGRAM_CLIENT_ID // Thử dùng chung Token User (Nếu hữu dụng)
        const result = await publishToThreads(content, mediaItems, token)
        setPublishResults(prev => ({
          ...prev,
          [id]: result.success 
            ? { status: 'success', link: result.link } 
            : { status: 'failed', error: result.error }
        }))
        continue
      }

      // Default feedback for unimplemented/failed cases
      setPublishResults(prev => ({
        ...prev,
        [id]: { 
          status: 'failed', 
          error: `Tính năng đăng bài tự động cho tài khoản ${id.toUpperCase()} chưa hỗ trợ token trực tiếp FE hoặc thiếu token thật cấu hình 'EAA...'.` 
        }
      }))
    }
  }

  const handleAddMedia = (item: any) => {
    setMediaItems(prev => [...prev, item])
  }

  const handleRemoveMedia = (id: number) => {
    setMediaItems(prev => prev.filter(item => item.id !== id))
  }

  const getPlatformName = (id: string) => {
    const names: any = { fb: 'Facebook', ig: 'Instagram', tiktok: 'TikTok', x: 'X (Twitter)', threads: 'Threads' }
    return names[id] || id
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 antialiased relative">
      <Navbar />
      <main className="flex flex-1 overflow-hidden">
        {/* Left column: Chatbox */}
        <div className="w-1/4 border-r border-slate-800 flex flex-col">
          <ChatBox onGenerateContent={setContent} onImageGenerated={handleAddMedia} />
        </div>
        
        {/* Center column: Editor & Media */}
        <div className="w-2/4 flex flex-col p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          <ContentEditor content={content} onChange={setContent} />
          <MediaPreview items={mediaItems} onRemove={handleRemoveMedia} onAdd={handleAddMedia} />
          
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" /> Thời gian đăng bài
              </span>
              
              <div className="flex bg-slate-800 rounded-lg p-0.5 text-xs">
                <button 
                  onClick={() => setPublishSchedule('now')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${publishSchedule === 'now' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
                >
                  Đăng Ngay
                </button>
                <button 
                  onClick={() => setPublishSchedule('scheduled')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${publishSchedule === 'scheduled' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
                >
                  Lên Lịch
                </button>
              </div>
            </div>

            {publishSchedule === 'scheduled' && (
              <input 
                type="datetime-local" 
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
              />
            )}

            <button 
              onClick={handlePublish}
              disabled={publishing && Object.values(publishResults).some(r => r.status === 'pending')}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {publishing && Object.values(publishResults).some(r => r.status === 'pending') ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>{publishSchedule === 'now' ? 'PUBLISH NOW' : 'SCHEDULE POST'}</span>
              )}
            </button>
          </div>
        </div>
        
        {/* Right column: Social Channels */}
        <SidebarRight onSelectionChange={setSelectedChannels} className="w-1/4 border-l border-slate-800 flex flex-col" />
      </main>

      {/* Sequential Publishing Modal */}
      {publishing && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-[400px] shadow-2xl space-y-4 relative">
            <button 
              onClick={() => setPublishing(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-2">
              {Object.values(publishResults).some(r => r.status === 'pending') ? (
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : Object.values(publishResults).some(r => r.status === 'failed') ? (
                <AlertCircle className="w-12 h-12 text-yellow-500" />
              ) : (
                <CheckCircle2 className="w-12 h-12 text-green-500 animate-scaleIn" />
              )}
              <h3 className="text-xl font-bold">
                {Object.values(publishResults).some(r => r.status === 'pending') ? 'Đang đăng bài...' : 'Hoàn tất đăng bài'}
              </h3>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Trạng thái kênh</span>
              <div className="space-y-2">
                {Object.entries(publishResults).map(([id, result]) => (
                  <div key={id} className="p-3 bg-slate-800/50 border border-slate-800 rounded-xl text-sm flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">{getPlatformName(id)}</span>
                      {result.status === 'pending' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                      {result.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {result.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </div>
                    {result.status === 'success' && result.link && (
                      <div className="flex flex-col gap-1 mt-0.5">
                        {(result as any).details && (
                          <span className="text-xs text-green-400/80">{(result as any).details}</span>
                        )}
                        <a href={result.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors break-all">
                          <span>Link bài viết</span> <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {result.status === 'failed' && result.error && (
                      <span className="text-xs text-red-400 mt-0.5">Lỗi: {result.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
