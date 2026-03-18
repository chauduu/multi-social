import { Bold, Italic, List, AlignLeft, Sparkles } from 'lucide-react'

interface ContentEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function ContentEditor({ content, onChange }: ContentEditorProps) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
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
        placeholder="Nội dung bài viết sẽ hiển thị ở đây. Bạn có thể nhờ AI viết trước rồi chỉnh sửa..."
        className="w-full h-48 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-slate-200 text-sm placeholder-slate-600 scrollbar-thin scrollbar-thumb-slate-800"
      />

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-xs text-slate-500">
        <span>{content.length} characters</span>
        <span className="text-blue-500 cursor-pointer hover:underline flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Re-write with AI
        </span>
      </div>
    </div>
  )
}
