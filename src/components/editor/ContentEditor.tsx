import { useState, useEffect } from 'react'
import { Bold, Italic, List, AlignLeft, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAIContent } from '../../hooks/useAIContent'

interface ContentEditorProps {
  content: string
  onChange: (content: string) => void
}

const STYLES = ['Ngắn gọn', 'Marketing', 'Storytelling', 'Văn học', 'Gần gũi', 'Trendy', 'Kiến thức', 'So sánh', 'Truyền cảm hứng']
const GOALS = ['Bán hàng', 'Thu hút', 'Thương hiệu', 'Niềm tin', 'Giá trị', 'Tương tác', 'Viral']

export default function ContentEditor({ content, onChange }: ContentEditorProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [prompt, setPrompt] = useState('')
  const { generatePost, loading } = useAIContent()

  // Version History State
  const [versions, setVersions] = useState<string[]>([])
  const [versionIndex, setVersionIndex] = useState(-1)

  // Sync initial content or external updates to history if empty or when content changes drastically?
  // Simply start with current content if not already there.
  useEffect(() => {
    if (content && versions.length === 0) {
       setVersions([content]);
       setVersionIndex(0);
    }
  }, [content, versions.length])

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style])
  }

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal])
  }

  const handleRewrite = async () => {
    try {
      const promptedMessage = `Hãy viết lại (Rewrite) bài đăng sau đây nâng cấp hơn.
**Phong cách**: ${selectedStyles.join(', ') || 'Tự do'}
**Mục tiêu**: ${selectedGoals.join(', ') || 'Tự do'}
**Yêu cầu bổ sung**: ${prompt || 'Không có'}

Bài viết hiện tại:
${content || 'Trống'}

Lưu ý: Chỉ trả về nội dung bài bài đăng. TUYỆT ĐỐI KHÔNG sử dụng các tiêu đề nhãn như "Tiêu đề:", "Mở bài:", "Thân bài:", "Hashtag:", "Hashtags:". Hãy viết liền mạch hoặc xuống dòng tự nhiên, không phân chia danh mục.`

      const aiResponse = await generatePost(promptedMessage)
      
      // Cleanup section labels
      const cleanedResponse = aiResponse
        .replace(/(?:\*\*|)?(Mở bài|Thân bài|Hashtag|Hashtags|Tiêu đề|Nội dung)[:：]?(?:\*\*|)?/gi, '')
        .trim();

      // Update History
      const newVersions = [...versions, cleanedResponse];
      setVersions(newVersions);
      setVersionIndex(newVersions.length - 1);

      onChange(cleanedResponse)
      setIsPopupOpen(false)
      setPrompt('') // Reset
    } catch (error) {
       // Error handled by hook
    }
  }

  const navigateVersion = (direction: 'prev' | 'next') => {
     if (direction === 'prev' && versionIndex > 0) {
         const i = versionIndex - 1;
         setVersionIndex(i);
         onChange(versions[i]);
     } else if (direction === 'next' && versionIndex < versions.length - 1) {
         const i = versionIndex + 1;
         setVersionIndex(i);
         onChange(versions[i]);
     }
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 relative">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-500" />
          Post Draft
        </h3>
        
        {/* Toolbar */}
        <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg">
          <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
            <Bold className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
            <Italic className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
            <List className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1"></div>
          <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
            <AlignLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nội dung bài viết sẽ hiển thị ở đây..."
        className="w-full h-48 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-slate-200 text-sm placeholder-slate-600 scrollbar-thin scrollbar-thumb-slate-800"
      />

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-xs text-slate-500">
        <div className="flex items-center gap-2">
            <span>{content.length} characters</span>
            {versions.length > 1 && (
               <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded-md text-[10px] text-slate-400">
                 <button 
                   disabled={versionIndex <= 0} 
                   onClick={() => navigateVersion('prev')}
                   className="p-0.5 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300"
                 >
                   <ChevronLeft className="w-3 h-3" />
                 </button>
                 <span className="font-semibold">{versionIndex + 1}/{versions.length}</span>
                 <button 
                   disabled={versionIndex >= versions.length - 1} 
                   onClick={() => navigateVersion('next')}
                   className="p-0.5 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300"
                 >
                   <ChevronRight className="w-3 h-3" />
                 </button>
               </div>
            )}
        </div>
        <button 
          onClick={() => setIsPopupOpen(true)}
          className="text-blue-500 hover:underline flex items-center gap-1.5 font-medium transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Re-write with AI
        </button>
      </div>

      {/* Rewrite Popup Modal */}
      {isPopupOpen && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4 z-40 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 w-full max-w-sm space-y-3 relative shadow-2xl">
            <button 
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold flex items-center gap-1.5 text-blue-400">
              <Sparkles className="w-4 h-4" /> Re-write with AI Options
            </h4>

            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Phong cách (Style)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {STYLES.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleStyle(s)}
                      className={`px-1.5 py-1 rounded-md text-[10px] border text-center transition-all ${
                        selectedStyles.includes(s) 
                          ? 'bg-blue-600 border-blue-500 text-white font-medium' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Mục tiêu (Goal)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {GOALS.map(g => (
                    <button
                      key={g}
                      onClick={() => toggleGoal(g)}
                      className={`px-1.5 py-1 rounded-md text-[10px] border text-center transition-all ${
                        selectedGoals.includes(g) 
                          ? 'bg-blue-600 border-blue-500 text-white font-medium' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Yêu cầu bổ sung (Prompt)</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ví dụ: Làm ngắn lại, Thêm hashtag..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white h-14 resize-none focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button 
              onClick={handleRewrite}
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Generate
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

