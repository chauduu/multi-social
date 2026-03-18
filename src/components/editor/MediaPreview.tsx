import { Plus, X, Edit2, Play } from 'lucide-react'
import { useRef } from 'react'

interface MediaPreviewProps {
  items: any[]
  onRemove: (id: number) => void
  onAdd: (item: any) => void
}

export default function MediaPreview({ items, onRemove, onAdd }: MediaPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    const type = file.type.startsWith('image/') ? 'image' : 'video'
    
    onAdd({
      id: Date.now(),
      type,
      url,
      name: file.name
    })
  }

  return (
    <div className="space-y-3">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*,video/*" 
        onChange={handleUpload} 
      />
      
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Media Assets
        </h3>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1 font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm mới
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="group relative aspect-video bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all duration-200"
          >
            {item.type === 'video' ? (
              <video 
                src={item.url} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                muted 
                loop 
                playsInline
              />
            ) : (
              <img 
                src={item.url} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}

            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="p-3 bg-black/50 backdrop-blur-sm rounded-full text-white group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current" />
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 z-20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 truncate max-w-[120px]">
                  {item.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <button className="p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="p-1.5 bg-red-900/80 hover:bg-red-800 rounded-lg text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Empty Slate */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-video border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-colors"
        >
          <div className="p-2 bg-slate-900 rounded-xl group-hover:bg-slate-800 transition-colors">
            <Plus className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
          </div>
          <span className="text-xs text-slate-500 group-hover:text-slate-400">
            Upload Media
          </span>
        </button>
      </div>
    </div>
  )
}
