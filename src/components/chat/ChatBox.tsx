import { useState } from 'react'
import { Send, Sparkles, Image, Video, FileText, ChevronUp } from 'lucide-react'
// import { useAIContent } from '../../hooks/useAIContent' // REPLACING
import { useAIChat } from '../../hooks/useAIChat'
import { useImageGen } from '../../hooks/useImageGen'

interface ChatBoxProps {
  content: string
  mediaItems: any[]
  onGenerateContent: (content: string) => void
  onImageGenerated: (item: { id: number; type: 'image' | 'video'; url: string; name: string }) => void
}

export default function ChatBox({ content, mediaItems, onGenerateContent, onImageGenerated }: ChatBoxProps) {
  // const [messages, setMessages] = useState<{ sender: 'user' | 'ai', text: string }[]>([
  //   { sender: 'ai', text: 'Xin chào! Tôi là trợ lý AI. Hãy cho tôi biết ý tưởng bài đăng của bạn nhé!' }
  // ])
  const [input, setInput] = useState('')
  const [showToolbox, setShowToolbox] = useState(false)
  // const { generatePost, loading } = useAIContent() // REPLACING
  const { messages, sendMessage, loading, error, setMessages } = useAIChat()
  const { generateImage, loading: imgLoading } = useImageGen()

  const handleGenImage = async () => {
    if (!input.trim() || imgLoading) return
    try {
      setMessages(prev => [...prev, { sender: 'user', text: `Tạo hình ảnh: ${input}`, timestamp: Date.now() }])
      const url = await generateImage(input)
      onImageGenerated({ id: Date.now(), type: 'image', url, name: `ai-gen-${Date.now()}.jpg` })
      setMessages(prev => [...prev, { sender: 'ai', text: 'Đã tạo hình ảnh thành công! Hình ảnh đã được thêm vào khu vực Media.', timestamp: Date.now() }])
    } catch (error: any) {
      setMessages(prev => [...prev, { sender: 'ai', text: `Có lỗi xảy ra khi tạo ảnh: ${error.message}`, timestamp: Date.now() }])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input
    setInput('')

    try {
      await sendMessage(userMessage, { content, mediaItems })
      // onGenerateContent(aiResponse) // Removed automatic update, now handled by [Gen Post] button
    } catch (error) {
      // Error is handled in hook
    }
  }

  const handleToolboxItem = async (prompt: string) => {
    setShowToolbox(false)
    setInput(prompt)
    // Optionally automatically send it
    // Wait for state update is not ideal for immediate send, so let's just prefill.
  }

  const applyToDraft = (text: string) => {
     // Clean up text if AI included intro (e.g., "Đây là bài viết...")
     // Based on instruction, hopefully it hasn't, but let's do a simple strip of anything before the first newline if it looks like an intro.
     // Better yet, usually title is bolded: **Tiêu đề**
     let cleanedText = text;
     const introMarkers = ["Tôi", "Đây là", "Xin gửi", "Dưới đây là"];
     const hasIntro = introMarkers.some(marker => cleanedText.startsWith(marker));
     
     if (hasIntro) {
        const lines = cleanedText.split('\n');
        // Find first title or content line
        const contentIndex = lines.findIndex(line => line.includes('**') || line.includes('#') || line.includes('Tiêu đề') || line.trim() === '');
        if (contentIndex > 0) {
             cleanedText = lines.slice(contentIndex).join('\n').trim();
        }
     }

     onGenerateContent(cleanedText);
  }

  const isPostResponse = (text: string) => {
     const hasHashtags = text.includes('#');
     const hasHeaders = text.includes('**') || text.includes('##') || text.includes('# ');
     const isLong = text.length > 80;
     // If it looks like a reply and not structured or tagged, unlikely to be a post template.
     return hasHashtags || (hasHeaders && isLong);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Sparkles className="w-5 h-5 text-blue-500" />
           <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-300">
             AI Assistant
           </h2>
        </div>
        <button 
          onClick={() => setShowToolbox(!showToolbox)}
          className={`p-1 rounded-md border border-slate-800 ${showToolbox ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          title="Công cụ nhanh"
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbox Overlay */}
      {showToolbox && (
        <div className="mx-4 mt-2 p-2 bg-slate-900 border border-slate-800 rounded-xl space-y-1 z-10 animate-fadeIn">
          <p className="text-xs text-slate-400 px-2 pb-1 border-b border-slate-800/50 mb-1">Công cụ soạn thảo nhanh</p>
          <button onClick={() => handleToolboxItem("Tạo bài viết marketing chuẩn SEO dựa trên ý tưởng: ")} className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-md flex items-center gap-1.5">
            📝 Viết Bài Marketing
          </button>
          <button onClick={() => handleToolboxItem("Tạo kịch bản review ngắn hấp dẫn (Storytelling) về: ")} className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-md flex items-center gap-1.5">
            📖 Kịch Bản Storytelling
          </button>
          <button onClick={() => handleToolboxItem("Rewrite lại bài đăng hiện tại để thu hút hơn: ")} className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-md flex items-center gap-1.5">
            🔄 Rewrite bài hiện tại
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`max-w-[85%] p-3 rounded-xl text-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
            
            {msg.sender === 'ai' && index > 0 && isPostResponse(msg.text) && (
              <button 
                onClick={() => applyToDraft(msg.text)}
                className="mt-1 ml-1 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium bg-slate-900/50 px-2 py-1 rounded-md border border-slate-800 hover:border-slate-700 transition-all duration-200"
              >
                <FileText className="w-3 h-3" /> Gen Post
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl rounded-bl-none flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        {error && (
            <div className="flex justify-center">
                <div className="bg-red-900/40 border border-red-800 text-red-200 p-2 rounded-lg text-xs">
                    {error}
                </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-900/40">
        <div className="flex gap-2">
          <button 
            onClick={handleGenImage}
            disabled={imgLoading || !input.trim()}
            className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 border border-slate-800 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
          >
            {imgLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Image className="w-3.5 h-3.5 text-blue-500" />
            )}
            <span>Gen Image</span>
          </button>
          <button className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors">
            <Video className="w-3.5 h-3.5 text-purple-500" />
            <span>Gen Video</span>
          </button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI..."
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

