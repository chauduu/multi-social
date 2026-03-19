import { Plus, X, Edit2, Play, Check, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import { useImageGen } from '../../hooks/useImageGen'
import { useAIContent } from '../../hooks/useAIContent'

interface MediaPreviewProps {
  items: any[]
  onRemove: (id: number) => void
  onAdd: (item: any) => void
  onToggleSelect: (id: number) => void
  content: string
}

export default function MediaPreview({ items, onRemove, onAdd, onToggleSelect, content }: MediaPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { generateImage, loading: imgLoading } = useImageGen()
  const { generatePost, loading: aiLoading } = useAIContent()
  const [genCount, setGenCount] = useState(0) // Track how many generating

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

  const handleGenAIFromContent = async () => {
    if (!content || content.trim().length < 5 || imgLoading || aiLoading) return;
    
    setGenCount(3);
    try {
      const enhancePrompt = `Dựa vào bài đăng mạng xã hội sau, hãy viết 3 prompt tiếng Anh cực kỳ ngắn gọn (không đánh số, không dẫn dắt, mỗi prompt 1 dòng, từ 10-20 từ) mô tả hình ảnh minh họa cho bài viết này để tạo ảnh AI Flux.

Bài viết: "${content}"`;

      const aiResponse = await generatePost(enhancePrompt);
      const variations = aiResponse.split('\n').filter(p => p.trim().length > 5).slice(0, 3);

      // Fallback
      while (variations.length < 3) {
         variations.push(content);
      }

      for (let i = 0; i < 3; i++) {
         setGenCount(3 - i);
         const url = await generateImage(variations[i]);
         onAdd({
            id: Date.now() + i,
            type: 'image',
            url,
            name: `ai-suggest-${i+1}.jpg`
         });
      }
    } catch (error) {
       console.error("Lỗi khi tạo ảnh từ content:", error);
    } finally {
       setGenCount(0);
    }
  }

  const selectedCount = items.filter(m => m.selected).length;

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
          Media Assets ({selectedCount}/10 selected)
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleGenAIFromContent}
            disabled={imgLoading || aiLoading || !content || content.trim().length < 5}
            className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-50 px-2 py-1.5 rounded-lg text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition-all shadow-sm"
          >
            {imgLoading || aiLoading ? (
               <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{aiLoading ? 'Mô tả ảnh...' : imgLoading ? `Gen (${genCount})...` : 'Gen AI với Content'}</span>
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1 font-semibold transition-colors bg-slate-900 border border-slate-800 hover:border-slate-700 px-2 py-1.5 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`group relative aspect-video bg-slate-900 rounded-2xl border ${item.selected ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-800'} overflow-hidden hover:border-slate-700 transition-all duration-200`}
          >
            {/* Checkbox Overlay */}
            <button 
              onClick={() => {
                if (!item.selected && selectedCount >= 10) {
                     alert("Chỉ được chọn tối đa 10 ảnh cho mỗi bài đăng.");
                     return;
                }
                onToggleSelect(item.id);
              }}
              className={`absolute top-2 left-2 z-30 p-1 rounded-md border transition-all ${
                item.selected 
                  ? 'bg-blue-600 border-blue-500 text-white' 
                  : 'bg-black/50 border-slate-700 text-transparent hover:border-slate-500 group-hover:text-slate-400'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
            </button>

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
                    onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
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
