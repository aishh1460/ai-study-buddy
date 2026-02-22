'use client'
import { useState, useEffect } from 'react'
import { BookOpen, Star, Zap } from 'lucide-react'

const QUOTES = [
    { text: 'Study now, shine later. ✨', author: 'Study Buddy' },
    { text: 'Small steps every day lead to big success. 🌱', author: 'Study Buddy' },
    { text: 'Consistency beats intensity. 🔥', author: 'Study Buddy' },
    { text: 'Your future self is watching you. 👀', author: 'Study Buddy' },
    { text: "Don't stop until you're proud. 💪", author: 'Study Buddy' },
    { text: 'The secret of getting ahead is getting started. 🚀', author: 'Mark Twain' },
    { text: 'One page a day builds a library of knowledge. 📚', author: 'Study Buddy' },
    {
        text: "Hard work beats talent when talent doesn't work hard. ⭐", author: 'Tim Notke'
    },
    { text: 'You are exactly where you need to be. 🌸', author: 'Study Buddy' },
    { text: 'Progress, not perfection. 🌈', author: 'Study Buddy' },
]

export default function MotivationBanner() {
    const [quoteIdx, setQuoteIdx] = useState(() => new Date().getDate() % QUOTES.length)
    const [isChanging, setIsChanging] = useState(false)
    const [speaking, setSpeaking] = useState(false)

    const changeQuote = () => {
        setIsChanging(true)
        setTimeout(() => {
            setQuoteIdx(prev => (prev + 1) % QUOTES.length)
            setIsChanging(false)
        }, 300)
    }

    const speakQuote = () => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return
        if (speaking) {
            window.speechSynthesis.cancel()
            setSpeaking(false)
            return
        }
        const utter = new SpeechSynthesisUtterance(QUOTES[quoteIdx].text)
        utter.rate = 0.85
        utter.pitch = 1.1
        utter.onend = () => setSpeaking(false)
        setSpeaking(true)
        window.speechSynthesis.speak(utter)
    }

    const quote = QUOTES[quoteIdx]

    return (
        <div className="glass-card p-6 md:p-8 text-center relative overflow-hidden mb-6">
            {/* Decorative blobs */}
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-pink-200 opacity-30 blur-2xl" />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-purple-200 opacity-30 blur-2xl" />

            <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="w-5 h-5 text-pink-400 fill-pink-400" />
                <h2 className="section-header text-xl md:text-2xl">Need Motivation?</h2>
                <Star className="w-5 h-5 text-pink-400 fill-pink-400" />
            </div>

            <div
                className="my-4 transition-all duration-300"
                style={{ opacity: isChanging ? 0 : 1, transform: isChanging ? 'translateY(8px)' : 'translateY(0)' }}
            >
                <p className="text-lg md:text-2xl font-nunito font-700 text-gray-700 italic leading-relaxed">
                    &ldquo;{quote.text}&rdquo;
                </p>
                <p className="text-sm text-pink-400 mt-1 font-medium">— {quote.author}</p>
            </div>

            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                <button onClick={changeQuote} className="btn-glow text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    New Quote
                </button>
                <button
                    onClick={speakQuote}
                    className={`btn-ghost text-sm flex items-center gap-2 ${speaking ? 'ring-2 ring-pink-400' : ''}`}
                    title="Read quote aloud"
                >
                    🔊 {speaking ? 'Stop' : 'Read Aloud'}
                </button>
            </div>
        </div>
    )
}
