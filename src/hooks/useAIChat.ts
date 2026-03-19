import { useState, useCallback } from 'react'
import { GoogleGenerativeAI, ChatSession, Content } from '@google/generative-ai'

interface Message {
  sender: 'user' | 'ai'
  text: string
  timestamp: number
}

interface ChatContext {
  content: string
  mediaItems: any[]
}

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: 'Xin chào! Tôi là trợ lý AI. Hãy cho tôi biết ý tưởng bài đăng của bạn nhé!', timestamp: Date.now() }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)

  const systemInstruction = `
Bạn là Trợ lý AI sáng tạo nội dung mạng xã hội chuyên nghiệp.
Nhiệm vụ của bạn là hỗ trợ người dùng tạo nội dung bài đăng (Post), lên ý tưởng, chỉnh sửa văn bản hoặc trả lời các câu hỏi khác.

QUY TẮC LÀM VIỆC:
1. **Ghi nhớ đa nhiệm**: Đây là cuộc hội thoại nhiều lượt. Hãy ghi nhớ thông tin từ các câu hỏi trước để trả lời câu tiếp theo một cách hợp lý.
2. **Linh hoạt**: Nếu người dùng hỏi các nội dung ngoài lề (ví dụ: "hello", "mấy giờ rồi", "kể chuyện cười"), hãy trả lời lịch sự và tự nhiên, không làm gián đoạn luồng thông tin.
3. **Trọng tâm (Đặc biệt Quan trọng)**: Luôn ưu tiên tham chiếu đến "Post Draft" và "Media" (được đính kèm trong mỗi tin nhắn) để đưa ra câu trả lời chính xác nhất. Nếu người dùng hỏi "Sửa lại bài này", "Tạo ảnh từ nội dung này", hãy dùng dữ liệu đó.
4. **Định dạng Post**: Khi tạo hoặc sửa bài đăng, hãy trả về kết quả có cấu trúc: Tiêu đề, Thân bài (có icon), Hashtags. **TUYỆT ĐỐI không** viết lời dẫn dắt thừa thãi như "Đây là bài viết của bạn:", "Chúc bạn thành công!", v.v. để người dùng có thể copy trực tiếp.
`

  const initChat = useCallback(() => {
    let apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (apiKey) {
      apiKey = apiKey.replace(/^["']|["']$/g, '')
    }

    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === '') {
       // Mock fallback will be handled in sendMessage if session is missing
       return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction
    })
    
    // Convert current messages to Google format if starting fresh, or just Start empty.
    // Usually start empty to let continuous appending work.
    const session = model.startChat({
        history: []
    })
    setChatSession(session)
    return session;
  }, [])

  const sendMessage = async (text: string, context: ChatContext) => {
    setLoading(true)
    setError(null)

    // Add user message immediately
    const userMsg: Message = { sender: 'user', text, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])

    try {
      let currentSession = chatSession;
      if (!currentSession) {
        currentSession = initChat();
      }

      // Check for API Key fallback
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === '' || !currentSession) {
         // Mock API for local dev without key
         await new Promise(resolve => setTimeout(resolve, 1500))
         let mockReply = "🤖 [AI Response (Mock Mode)]\n\nTôi thấy bạn đang hỏi về: " + text;
         if (text.toLowerCase().includes("post") || text.toLowerCase().includes("bài")) {
             mockReply = `📌 **[Được gợi ý cho Bài Đăng]**\n\n💡 Ý tưởng: ${text}\n\n📝 **Nội dung bài viết gợi ý:**\nChào cả nhà! Hôm nay mình muốn chia sẻ về... [Nội dung từ AI]\n\n#AI #Marketing #Automation`;
         }
         const aiMsg: Message = { sender: 'ai', text: mockReply, timestamp: Date.now() }
         setMessages(prev => [...prev, aiMsg])
         setLoading(false)
         return mockReply;
      }

      // Construct Prompt with Context
      const promptWithContext = `
[CONTEXT_START]
Post Draft: "${context.content || 'Trống'}"
Media Items: ${JSON.stringify(context.mediaItems.map(m => ({ id: m.id, type: m.type, name: m.name })), null, 2)}
[CONTEXT_END]

Câu hỏi của người dùng: ${text}
`

      const result = await currentSession.sendMessage(promptWithContext)
      const responseText = result.response.text()

      const aiMsg: Message = { sender: 'ai', text: responseText, timestamp: Date.now() }
      setMessages(prev => [...prev, aiMsg])
      return responseText;

    } catch (err: any) {
      console.error('AIChat Error:', err)
      setError(err.message || 'Failed to send message')
      const errorMsg: Message = { sender: 'ai', text: `⚠️ Có lỗi xảy ra: ${err.message}`, timestamp: Date.now() }
      setMessages(prev => [...prev, errorMsg])
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { messages, sendMessage, loading, error, setMessages }
}
