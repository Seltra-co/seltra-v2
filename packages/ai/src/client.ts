//packages/ai/src/client.ts
//Groq and Ollama client for chat completions
//Groq is used if GROQ_API_KEY is set, otherwise falls back to Ollama
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const OLLAMA_API_URL = 'http://localhost:11434/api/chat'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  content: string
  provider: 'groq' | 'ollama'
}

export async function chat(messages: ChatMessage[]): Promise<AIResponse> {
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`Groq error ${res.status}: ${err}`)
      }

      const data = await res.json()
      return {
        content: data.choices[0].message.content,
        provider: 'groq',
      }
    } catch (e) {
      console.warn('Groq failed, falling back to Ollama:', e)
    }
  }

  const res = await fetch(OLLAMA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5:3b',
      messages,
      stream: false,
    }),
  })
  const data = await res.json()
  return {
    content: data.message.content,
    provider: 'ollama',
  }
}