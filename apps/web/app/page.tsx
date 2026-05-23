//apps/web/app/page.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Store, Zap, CheckCircle, Circle, Loader } from 'lucide-react'

const EXAMPLES = [
  'Launch a skincare brand for Gen Z women in Accra',
  'Build a digital art marketplace with Paystack',
  'Create a fashion store for Ghanaian streetwear',
  'Start a handmade jewelry shop with local delivery',
]

const PIPELINE_STEPS = [
  { id: 'intent', label: 'Parsing business intent', icon: '🧠' },
  { id: 'blueprint', label: 'Generating store blueprint', icon: '📐' },
  { id: 'products', label: 'Creating product catalog', icon: '📦' },
  { id: 'db', label: 'Persisting to database', icon: '💾' },
  { id: 'storefront', label: 'Building storefront', icon: '🏪' },
  { id: 'complete', label: 'Store is live', icon: '🚀' },
]

interface BuildResult {
  success: boolean
  tenantId: string
  storeUrl: string
  blueprint: {
    businessName: string
    businessType: string
    targetAudience: string
    storeSlug: string
    productCategories: string[]
    estimatedLaunchTime: string
  }
  products: Array<{
    id: string
    name: string
    description: string
    price: string
    currency: string
    category: string
  }>
  categoriesCreated: number
  message: string
}

export default function HomePage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [result, setResult] = useState<BuildResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const addLine = (line: string) => {
    setTerminalLines(prev => [...prev, line])
  }

  const simulatePipeline = async () => {
    const delays = [600, 800, 1200, 600, 500, 400]
    const lines = [
      '> Analyzing business intent...',
      '> Generating commerce blueprint...',
      '> Creating 6 products with variants...',
      '> Seeding PostgreSQL database...',
      '> Scaffolding storefront...',
      '> Store deployed successfully ✓',
    ]

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, delays[i]))
      setCurrentStep(i)
      addLine(lines[i])
    }
  }

  const handleBuild = async () => {
    if (!prompt.trim() || loading) return

    setLoading(true)
    setCurrentStep(0)
    setTerminalLines([`$ seltra build "${prompt}"`])
    setResult(null)
    setError(null)

    try {
      const [apiResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/agent/build`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        }).then(r => r.json()),
        simulatePipeline(),
      ])

      if (!apiResponse.success) {
        setError(apiResponse.error || 'Build failed')
        return
      }

      setResult(apiResponse)
      addLine(`> Live at: ${apiResponse.storeUrl}`)
    } catch {
      setError('Failed to connect to Seltra API')
      addLine('> Error: Connection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen grid-bg flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00A86B] flex items-center justify-center">
            <Store size={16} className="text-black" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Seltra</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#6b7280] border border-[#1f1f1f] px-3 py-1 rounded-full">
            Beta
          </span>
          <a
            href="#"
            className="text-sm text-[#00A86B] hover:text-white transition-colors"
          >
            View stores →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-[#00A86B15] border border-[#00A86B33] rounded-full px-4 py-1.5 mb-6">
            <Zap size={12} className="text-[#00A86B]" />
            <span className="text-xs text-[#00A86B] font-medium">
              AI-native commerce agent · Built in Ghana
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Describe your store.
            <br />
            <span className="text-[#00A86B]">We build and run it.</span>
          </h1>

          <p className="text-[#6b7280] text-lg max-w-xl mx-auto">
            One prompt. Full ecommerce store — products, payments, storefront.
            Live in minutes.
          </p>
        </motion.div>

        {/* Prompt Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-2xl mb-4"
        >
          <div className="relative bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden focus-within:border-[#00A86B] transition-colors">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleBuild()
                }
              }}
              placeholder="e.g. Launch a skincare brand for Gen Z women in Accra..."
              className="w-full bg-transparent text-white placeholder-[#374151] px-5 py-4 pr-16 resize-none outline-none text-sm leading-relaxed"
              rows={2}
              disabled={loading}
            />
            <button
              onClick={handleBuild}
              disabled={!prompt.trim() || loading}
              className="absolute right-3 bottom-3 w-9 h-9 bg-[#00A86B] hover:bg-[#00c47a] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
            >
              {loading ? (
                <Loader size={14} className="text-black animate-spin" />
              ) : (
                <Send size={14} className="text-black" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Example chips */}
        {!loading && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 justify-center mb-10"
          >
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="text-xs text-[#6b7280] hover:text-[#00A86B] border border-[#1f1f1f] hover:border-[#00A86B33] px-3 py-1.5 rounded-full transition-all"
              >
                ✦ {ex}
              </button>
            ))}
          </motion.div>
        )}

        {/* Pipeline + Terminal */}
        <AnimatePresence>
          {loading || result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl grid grid-cols-2 gap-4"
            >
              {/* Pipeline nodes */}
              <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
                <p className="text-xs text-[#6b7280] font-mono mb-3 uppercase tracking-wider">
                  Agent Pipeline
                </p>
                <div className="space-y-2">
                  {PIPELINE_STEPS.map((step, i) => {
                    const done = i < currentStep || (!loading && result !== null)
                    const active = i === currentStep && loading

                    return (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          done ? 'bg-[#00A86B]' :
                          active ? 'bg-[#00A86B33] node-active border border-[#00A86B]' :
                          'bg-[#1f1f1f]'
                        }`}>
                          {done ? (
                            <CheckCircle size={10} className="text-black" />
                          ) : active ? (
                            <Loader size={8} className="text-[#00A86B] animate-spin" />
                          ) : (
                            <Circle size={8} className="text-[#374151]" />
                          )}
                        </div>
                        <span className={`text-xs font-mono transition-colors ${
                          done ? 'text-[#00A86B]' :
                          active ? 'text-white' :
                          'text-[#374151]'
                        }`}>
                          {step.icon} {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Terminal */}
              <div className="bg-[#050505] border border-[#1f1f1f] rounded-xl p-4 font-mono">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="text-[10px] text-[#374151] ml-2">seltra terminal</span>
                </div>
                <div className="space-y-1 overflow-y-auto max-h-40">
                  {terminalLines.map((line, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-xs leading-relaxed ${
                        line.includes('Error') ? 'text-red-400' :
                        line.includes('✓') || line.includes('live') ? 'text-[#00A86B]' :
                        line.startsWith('$') ? 'text-white' :
                        'text-[#6b7280]'
                      }`}
                    >
                      {line}
                    </motion.p>
                  ))}
                  {loading && (
                    <span className="text-[#00A86B] text-xs cursor-blink">▋</span>
                  )}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Result Card */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl mt-4 bg-[#111111] border border-[#00A86B33] rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-white font-bold text-lg">
                    {result.blueprint.businessName}
                  </h2>
                  <p className="text-[#6b7280] text-sm">
                    {result.blueprint.businessType} · {result.blueprint.targetAudience}
                  </p>
                </div>
                <span className="bg-[#00A86B15] text-[#00A86B] text-xs px-2 py-1 rounded-full border border-[#00A86B33]">
                  Live
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-[#0a0a0a] rounded-lg p-3 text-center">
                  <p className="text-[#00A86B] font-bold text-xl">{result.products.length}</p>
                  <p className="text-[#6b7280] text-xs">Products</p>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-3 text-center">
                  <p className="text-[#00A86B] font-bold text-xl">{result.categoriesCreated}</p>
                  <p className="text-[#6b7280] text-xs">Categories</p>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-3 text-center">
                  <p className="text-[#00A86B] font-bold text-xl">
                    {result.blueprint.estimatedLaunchTime.replace(' minutes', 'm')}
                  </p>
                  <p className="text-[#6b7280] text-xs">Launch time</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`http://localhost:3001/store/${result.blueprint.storeSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#00A86B] hover:bg-[#00c47a] text-black font-semibold text-sm py-2.5 rounded-lg text-center transition-colors"
                >
                  View Live Store →
                </a>
                <button
                  onClick={() => {
                    setResult(null)
                    setPrompt('')
                    setTerminalLines([])
                    setCurrentStep(-1)
                  }}
                  className="px-4 py-2.5 border border-[#1f1f1f] hover:border-[#374151] text-[#6b7280] text-sm rounded-lg transition-colors"
                >
                  Build another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="w-full max-w-2xl mt-4 bg-red-950 border border-red-800 rounded-xl p-4">
            <p className="text-red-400 text-sm font-mono">{error}</p>
          </div>
        )}
      </div>
    </main>
  )
}