import { useState } from 'react'
import { HfInference } from '@huggingface/inference'

export function useImageGen() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateImage = async (prompt: string): Promise<string> => {
    setLoading(true)
    setError(null)
    try {
      let apiKey = (import.meta as any).env.VITE_HF_API_KEY
      if (apiKey) {
        apiKey = apiKey.replace(/^["']|["']$/g, '') // Strip quotes
      }

      if (!apiKey || apiKey === 'your_hf_api_key_here' || apiKey === '') {
        throw new Error('Hugging Face API Key is missing or invalid')
      }

      const hf = new HfInference(apiKey)
      const response = await hf.textToImage({
        model: 'black-forest-labs/FLUX.1-schnell',
        inputs: prompt,
      })

      // Robust conversion
      let imageUrl = ''
      const res = response as any
      if (res instanceof Blob) {
        imageUrl = URL.createObjectURL(res)
      } else if (typeof res === 'string') {
        imageUrl = res
      } else {
        throw new Error('Unexpected response format from Hugging Face')
      }
      return imageUrl
    } catch (err: any) {
      console.error('Hugging Face API Error:', err)
      setError(err.message || 'Failed to generate image')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { generateImage, loading, error }
}
