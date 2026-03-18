import { Facebook, Instagram, Twitter, MessageSquare, ToggleLeft, ToggleRight, Music } from 'lucide-react'
import { useState, useEffect } from 'react'

const PLATFORMS = [
  { id: 'fb', name: 'Facebook', icon: Facebook, color: 'text-blue-600', activeColor: 'bg-blue-600/10', envKey: 'VITE_FACEBOOK_APP_ID', placeholder: 'your_fb_app_id' },
  { id: 'ig', name: 'Instagram', icon: Instagram, color: 'text-pink-600', activeColor: 'bg-pink-600/10', envKey: 'VITE_INSTAGRAM_CLIENT_ID', placeholder: 'your_ig_id' },
  { id: 'tiktok', name: 'TikTok', icon: Music, color: 'text-teal-400', activeColor: 'bg-teal-400/10', envKey: 'VITE_TIKTOK_CLIENT_KEY', placeholder: 'your_tiktok_key' },
  { id: 'x', name: 'X (Twitter)', icon: Twitter, color: 'text-white', activeColor: 'bg-white/10', envKey: 'VITE_X_API_KEY', placeholder: 'your_x_api_key' },
  { id: 'threads', name: 'Threads', icon: MessageSquare, color: 'text-purple-600', activeColor: 'bg-purple-600/10', envKey: 'VITE_THREADS_APP_ID', placeholder: 'your_threads_id' },
]

interface SidebarRightProps {
  className?: string
  onSelectionChange?: (selection: Record<string, { post: boolean; story: boolean }>) => void
}

export default function SidebarRight({ className = '', onSelectionChange }: SidebarRightProps) {
  const [activeChannels, setActiveChannels] = useState<string[]>([])
  const [settings, setSettings] = useState<Record<string, { post: boolean, story: boolean }>>({})

  const isConnected = (envKey: string, placeholder: string) => {
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
      initSettings[p.id] = { post: true, story: false } // Default: post=true, story=false
    })
    setSettings(initSettings)
  }, [])

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

  const toggleOption = (channelId: string, option: 'post' | 'story') => {
    setSettings(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        [option]: !prev[channelId][option]
      }
    }))
  }

  return (
    <aside className={`h-full flex flex-col p-6 space-y-6 ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Publishing Channels
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Select where to publish your content
        </p>
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

              {isActive && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={settings[platform.id]?.post ?? true}
                      onChange={() => toggleOption(platform.id, 'post')}
                      className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/20"
                    />
                    <span>Đăng bài viết</span>
                  </label>
                </div>
              )}
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
    </aside>
  )
}
