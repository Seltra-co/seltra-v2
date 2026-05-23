// Groq is primary (free, fast cloud)
// Ollama is fallback (offline, slower)

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const OLLAMA_API_URL = 'http://localhost:11434/api/chat'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AIResponse {
  content: string
  provider: 'groq' | 'ollama'
}

export async function chat(messages: ChatMessage[]): Promise<AIResponse> {
  //Try Groq first
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages,
          temperature: 0.7,
          max_tokens: 2000
        })
      })
      const data = await res.json()
      return {
        content: data.choices[0].message.content,
        provider: 'groq'
      }
    } catch (e) {
      console.warn('Groq failed, falling back to Ollama:', e)
    }
  }

  //Fallback to Ollama
  const res = await fetch(OLLAMA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5:3b',
      messages,
      stream: false
    })
  })
  const data = await res.json()
  return {
    content: data.message.content,
    provider: 'ollama'
  }
}