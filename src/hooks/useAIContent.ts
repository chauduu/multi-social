import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

export function useAIContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePost = async (prompt: string): Promise<string> => {
    setLoading(true)
    setError(null)
    try {
      let apiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (apiKey) {
        apiKey = apiKey.replace(/^["']|["']$/g, '') // Strip quotes
      }

      if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === '') {
        // Fallback to Mock data for demonstration
        await new Promise(resolve => setTimeout(resolve, 1500))
        return `🤖 [AI Generated Post]\n\n🌟 Chào mừng bạn đến với hệ thống Tự động hóa Nội dung Đa kênh!\n\nChúng tôi hỗ trợ bạn tạo bài viết, hình ảnh và phân phối nhanh chóng lên facebook, instagram...\n\n#AI #Automation #Marketing`
      }

      const genAI = new GoogleGenerativeAI(apiKey)
      // Using gemini-2.5-flash as used in agent.ts
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }) 
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (err: any) {
      console.error('Gemini API Error Detail:', err)
      setError(err.message || 'Failed to generate content')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { generatePost, loading, error }
}
