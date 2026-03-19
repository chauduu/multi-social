import { Facebook, Instagram, Twitter, MessageSquare, ToggleLeft, ToggleRight, Music, Settings, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const PLATFORMS = [
  { id: 'fb', name: 'Facebook', icon: Facebook, color: 'text-blue-600', activeColor: 'bg-blue-600/10', envKey: 'VITE_FACEBOOK_APP_ID', placeholder: 'your_fb_app_id' },
  { id: 'ig', name: 'Instagram', icon: Instagram, color: 'text-pink-600', activeColor: 'bg-pink-600/10', envKey: 'VITE_FACEBOOK_APP_ID', placeholder: 'your_fb_app_id' },
  { id: 'tiktok', name: 'TikTok', icon: Music, color: 'text-teal-400', activeColor: 'bg-teal-400/10', envKey: 'VITE_TIKTOK_CLIENT_KEY', placeholder: 'your_tiktok_key' },
  { id: 'x', name: 'X (Twitter)', icon: Twitter, color: 'text-white', activeColor: 'bg-white/10', envKey: 'VITE_X_API_KEY', placeholder: 'your_x_api_key' },
  { id: 'threads', name: 'Threads', icon: MessageSquare, color: 'text-purple-600', activeColor: 'bg-purple-600/10', envKey: 'VITE_THREAD_CLIENT_KEY', placeholder: 'your_threads_key' },
]

interface SidebarRightProps {
  className?: string
  onSelectionChange?: (selection: Record<string, { post: boolean; story: boolean }>) => void
  onKeysChange?: (keys: Record<string, string>) => void
}

export default function SidebarRight({ className = '', onSelectionChange, onKeysChange }: SidebarRightProps) {
  const [activeChannels, setActiveChannels] = useState<string[]>([])
  const [settings, setSettings] = useState<Record<string, { post: boolean, story: boolean }>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [customKeys, setCustomKeys] = useState<Record<string, string>>({
    fb: '',
    threads: '',
    x: ''
  })

  useEffect(() => {
    // Tải key từ localStorage hoặc fallback về .env
    const saved = localStorage.getItem('custom_api_keys')
    const initialKeys = saved ? JSON.parse(saved) : {
      fb: (import.meta as any).env.VITE_FACEBOOK_APP_ID || '',
      threads: (import.meta as any).env.VITE_THREAD_CLIENT_KEY || '',
      x: (import.meta as any).env.VITE_X_API_KEY || ''
    }
    setCustomKeys(initialKeys)
    if (onKeysChange) onKeysChange(initialKeys)
  }, [])

  const isConnected = (envKey: string, placeholder: string) => {
    // Nếu có customKey thì ưu tiên dùng customKey để check Connected
    if (envKey === 'VITE_FACEBOOK_APP_ID' && customKeys.fb) return true;
    if (envKey === 'VITE_THREAD_CLIENT_KEY' && customKeys.threads) return true;
    if (envKey === 'VITE_X_API_KEY' && customKeys.x) return true;
    if (envKey === 'VITE_TIKTOK_CLIENT_KEY' && customKeys.tiktok) return true;

    const value = (import.meta as any).env[envKey]
    return value && value !== placeholder && value.trim() !== ''
  }

  // Effect to auto-turn on connected platforms on mount
  useEffect(() => {
    const connected = PLATFORMS.filter(p => isConnected(p.envKey, p.placeholder)).map(p => p.id)
    setActiveChannels(connected)

    // Initialize settings
    const initSettings: Record<string, { post: boolean; story: boolean }> = {}
    PLATFORMS.forEach(p => {
      initSettings[p.id] = { post: true, story: false }
    })
    setSettings(initSettings)
  }, [customKeys]) // Chạy lại khi customKeys cập nhật để toggle ON đúng kênh

  // Push updates to parent when selection or options change
  useEffect(() => {
    if (onSelectionChange) {
      const activeSelection = activeChannels.reduce((acc, id) => {
        acc[id] = settings[id] || { post: true, story: false }
        return acc
      }, {} as Record<string, { post: boolean; story: boolean }>)
      onSelectionChange(activeSelection)
    }
  }, [activeChannels, settings, onSelectionChange])

  const toggleChannel = (id: string) => {
    setActiveChannels(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const saveKeys = () => {
    localStorage.setItem('custom_api_keys', JSON.stringify(customKeys))
    if (onKeysChange) onKeysChange(customKeys)
    setIsModalOpen(false)
  }

  return (
    <aside className={`h-full flex flex-col p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Publishing Channels
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Select where to publish your content
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Cấu hình API Keys"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {PLATFORMS.map((platform) => {
          const isActive = activeChannels.includes(platform.id)
          const Icon = platform.icon
          const connected = isConnected(platform.envKey, platform.placeholder)

          return (
            <div
              key={platform.id}
              className={`p-4 rounded-xl border ${isActive ? 'border-slate-700 bg-slate-900/40' : 'border-slate-800/50 bg-slate-950'} transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isActive ? platform.activeColor : 'bg-slate-800/50'}`}>
                    <Icon className={`w-5 h-5 ${platform.color}`} />
                  </div>
                  <div>
                    <span className="font-medium text-sm">{platform.name}</span>
                    <p className={`text-xs ${connected ? 'text-green-400 font-medium' : 'text-slate-500'}`}>
                      {connected ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                </div>
                <button onClick={() => toggleChannel(platform.id)}>
                  {isActive ? (
                    <ToggleRight className="w-8 h-8 text-blue-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <span>AI Suggestions</span>
          <span className="text-blue-500 text-xs font-semibold">Active</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Optimization for peak engagement time is enabled.
        </p>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                Cấu hình API Keys
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">Thay đổi giá trị dưới này sẽ được dùng trực tiếp khi Publish bài viết.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Facebook & Instagram</label>
                <input
                  type="text"
                  value={customKeys.fb}
                  onChange={e => setCustomKeys(prev => ({ ...prev, fb: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Nhập Token Facebook..."
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Threads</label>
                <input
                  type="text"
                  value={customKeys.threads}
                  onChange={e => setCustomKeys(prev => ({ ...prev, threads: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Nhập Token Threads..."
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">X/Twitter</label>
                <input
                  type="text"
                  value={customKeys.x}
                  onChange={e => setCustomKeys(prev => ({ ...prev, x: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Nhập Token X..."
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Tiktok</label>
                <input
                  type="text"
                  value={customKeys.tiktok}
                  onChange={e => setCustomKeys(prev => ({ ...prev, tiktok: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Nhập Token Tiktok..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={saveKeys}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
