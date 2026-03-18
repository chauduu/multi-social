import { useState } from 'react'
import { Send, Sparkles, Image, Video } from 'lucide-react'
import { useAIContent } from '../../hooks/useAIContent'
import { useImageGen } from '../../hooks/useImageGen'

interface ChatBoxProps {
  onGenerateContent: (content: string) => void
  onImageGenerated: (item: { id: number; type: 'image' | 'video'; url: string; name: string }) => void
}

export default function ChatBox({ onGenerateContent, onImageGenerated }: ChatBoxProps) {
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai', text: string }[]>([
    { sender: 'ai', text: 'Xin chào! Tôi là trợ lý AI. Hãy cho tôi biết ý tưởng bài đăng của bạn nhé!' }
  ])
  const [input, setInput] = useState('')
  const { generatePost, loading } = useAIContent()
  const { generateImage, loading: imgLoading } = useImageGen()

  const handleGenImage = async () => {
    if (!input.trim() || imgLoading) return
    try {
      setMessages(prev => [...prev, { sender: 'user', text: `Tạo hình ảnh: ${input}` }])
      const url = await generateImage(input)
      onImageGenerated({ id: Date.now(), type: 'image', url, name: `ai-gen-${Date.now()}.jpg` })
      setMessages(prev => [...prev, { sender: 'ai', text: 'Đã tạo hình ảnh thành công! Hình ảnh đã được thêm vào khu vực Media.' }])
    } catch (error: any) {
      setMessages(prev => [...prev, { sender: 'ai', text: `Có lỗi xảy ra khi tạo ảnh: ${error.message}` }])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }])
    setInput('')

    try {
      const promptedMessage = `Tạo một bài post viết bằng tiếng việt mang tính marketing về "${userMessage}". Lưu ý: Chỉ trả về nội dung bài bài đăng (tiêu đề, thân bài, hashtag), TUYỆT ĐỐI không bao gồm lời chào, lời dẫn dắt hay giải thích mở đầu/kết thúc.`
      const aiResponse = await generatePost(promptedMessage)
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }])
      onGenerateContent(aiResponse) // Update editor
    } catch (error: any) {
      setMessages(prev => [...prev, { sender: 'ai', text: `Có lỗi xảy ra khi gọi AI: ${error.message || 'Lỗi không xác định'}` }])
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-300">
          AI Assistant
        </h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
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
