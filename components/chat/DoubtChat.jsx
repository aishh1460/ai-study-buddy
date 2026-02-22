'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Mic, MicOff, Volume2 } from 'lucide-react'

export default function DoubtChat({ topic }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Hi! 🌸 I'm your AI Study Buddy. Ask me anything about **${topic || 'your topic'}** and I'll help you understand it better!` },
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [listening, setListening] = useState(false)
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const send = async () => {
        if (!input.trim() || loading) return
        const userMsg = { role: 'user', content: input.trim() }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg], topic }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: '❌ Sorry, something went wrong. Please try again!' }])
        } finally {
            setLoading(false)
        }
    }

    const startVoice = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SR) return alert('Voice not supported')
        const r = new SR()
        r.lang = 'en-US'
        r.onresult = e => { setInput(e.results[0][0].transcript); setListening(false) }
        r.onerror = r.onend = () => setListening(false)
        r.start()
        setListening(true)
    }

    const speakMsg = (text) => {
        if (!window.speechSynthesis) return
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(text)
        u.rate = 0.9
        window.speechSynthesis.speak(u)
    }

    const formatMsg = (text) =>
        text.split('**').map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        )

    return (
        <div className="glass-card p-5 mb-6 flex flex-col">
            <h3 className="section-header text-xl font-bold mb-4 flex items-center gap-2">
                💬 Doubt Solver
                {topic && <span className="text-sm font-normal text-gray-400">• {topic}</span>}
            </h3>

            {/* Messages */}
            <div className="flex-1 space-y-3 max-h-80 overflow-y-auto pr-1 mb-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble'}>
                            <p className="text-sm leading-relaxed">{formatMsg(msg.content)}</p>
                            {msg.role === 'assistant' && (
                                <button
                                    onClick={() => speakMsg(msg.content)}
                                    className="mt-1.5 text-pink-400 hover:text-pink-600 transition-colors"
                                    title="Read aloud"
                                >
                                    <Volume2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="chat-bubble flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                            <span className="text-sm text-gray-400">Thinking…</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && send()}
                        placeholder="Ask a doubt…"
                        className="w-full px-4 py-2.5 rounded-2xl border-2 border-pink-200 bg-white/70 text-sm focus:outline-none focus:border-pink-400 pr-10"
                    />
                    <button
                        onClick={startVoice}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600"
                    >
                        {listening ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
                    </button>
                </div>
                <button onClick={send} disabled={loading || !input.trim()} className="btn-glow p-2.5 disabled:opacity-50">
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
