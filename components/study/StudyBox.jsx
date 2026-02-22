'use client'
import { useState, useEffect } from 'react'
import StudyModeSelector from './StudyModeSelector'
import VisualAids from './VisualAids'
import { Sparkles, Send, BookmarkPlus, FileDown, Loader2, Mic, MicOff } from 'lucide-react'

const SECTION_CONFIG = [
    { key: 'beginner', icon: '🌱', title: 'Beginner Explanation', color: 'text-green-600' },
    { key: 'intermediate', icon: '📘', title: 'Intermediate Concepts', color: 'text-blue-600' },
    { key: 'advanced', icon: '🚀', title: 'Advanced Insights', color: 'text-purple-600' },
    { key: 'applications', icon: '🌍', title: 'Real-World Applications', color: 'text-orange-600' },
    { key: 'definitions', icon: '📖', title: 'Key Definitions', color: 'text-pink-600' },
    { key: 'formulas', icon: '🔢', title: 'Formulas & Rules', color: 'text-red-600' },
    { key: 'keyPoints', icon: '⭐', title: 'Key Points for Revision', color: 'text-amber-600' },
    { key: 'examQuestions', icon: '📝', title: 'Important Exam Questions', color: 'text-violet-600' },
]

export default function StudyBox({ onXpGain, onNotesGenerated }) {
    const [topic, setTopic] = useState('')
    const [mode, setMode] = useState('deep')
    const [notes, setNotes] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [listening, setListening] = useState(false)
    const recognitionRef = { current: null }

    const generateNotes = async () => {
        if (!topic.trim()) return
        setLoading(true)
        setError(null)
        setNotes(null)
        try {
            const res = await fetch('/api/study', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, mode }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setNotes(data.notes)
            onXpGain(25, 'studying')
            onNotesGenerated({ topic, notes: data.notes })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const startVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert('Voice input not supported in this browser.')
            return
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.onresult = (e) => {
            setTopic(e.results[0][0].transcript)
            setListening(false)
        }
        recognition.onerror = () => setListening(false)
        recognition.onend = () => setListening(false)
        recognition.start()
        setListening(true)
    }

    const saveNotes = () => {
        if (!notes) return
        const saved = JSON.parse(localStorage.getItem('studyLibrary') || '[]')
        const entry = { topic, notes, mode, savedAt: new Date().toISOString() }
        const existing = saved.findIndex(e => e.topic === topic)
        if (existing >= 0) saved[existing] = entry
        else saved.unshift(entry)
        localStorage.setItem('studyLibrary', JSON.stringify(saved.slice(0, 20)))
        onXpGain(10, 'saving')
        alert('Notes saved to your library! 📚')
    }

    const exportPDF = async () => {
        if (!notes) return
        try {
            const { default: jsPDF } = await import('jspdf')
            const doc = new jsPDF()
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(18)
            doc.setTextColor(236, 72, 153)
            doc.text(notes.title || topic, 15, 20)

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(11)
            doc.setTextColor(60, 60, 60)

            let y = 35
            const addSection = (title, content) => {
                if (y > 270) { doc.addPage(); y = 20 }
                doc.setFont('helvetica', 'bold')
                doc.setTextColor(236, 72, 153)
                doc.text(title, 15, y)
                y += 7
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(60, 60, 60)
                const lines = doc.splitTextToSize(content, 175)
                lines.forEach(line => {
                    if (y > 280) { doc.addPage(); y = 20 }
                    doc.text(line, 15, y)
                    y += 6
                })
                y += 5
            }

            if (notes.beginner) addSection('🌱 Beginner:', notes.beginner)
            if (notes.intermediate) addSection('📘 Intermediate:', notes.intermediate)
            if (notes.advanced) addSection('🚀 Advanced:', notes.advanced)
            if (notes.keyPoints) addSection('⭐ Key Points:', notes.keyPoints.join('\n• '))
            if (notes.examQuestions) addSection('📝 Exam Questions:', notes.examQuestions.join('\n• '))

            doc.save(`${topic.replace(/\s/g, '_')}_StudyNotes.pdf`)
            onXpGain(5, 'export')
        } catch (err) {
            alert('PDF export failed: ' + err.message)
        }
    }

    const speakNotes = (text) => {
        if (!window.speechSynthesis) return
        window.speechSynthesis.cancel()
        const utter = new SpeechSynthesisUtterance(text)
        utter.rate = 0.9
        window.speechSynthesis.speak(utter)
    }

    return (
        <div className="glass-card p-6 md:p-8 mb-6">
            <h2 className="section-header text-2xl font-bold mb-5 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-pink-400" />
                AI Study Notes Generator
            </h2>

            <StudyModeSelector selectedMode={mode} onModeChange={setMode} />

            {/* Input */}
            <div className="flex gap-2 mb-5">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && generateNotes()}
                        placeholder="Enter a topic to generate complete study notes…"
                        className="w-full px-5 py-3.5 rounded-2xl border-2 border-pink-200 bg-white/70 focus:outline-none focus:border-pink-400 font-poppins text-gray-700 placeholder-pink-300 pr-12"
                    />
                    <button
                        onClick={startVoiceInput}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600 transition-colors"
                        title="Voice input"
                    >
                        {listening ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
                    </button>
                </div>
                <button
                    onClick={generateNotes}
                    disabled={loading || !topic.trim()}
                    className="btn-glow flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? 'Generating…' : 'Generate'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-4 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="space-y-3 animate-pulse mt-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 bg-pink-100 rounded-2xl" />
                    ))}
                </div>
            )}

            {/* Notes output */}
            {notes && !loading && (
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                        <h3 className="text-xl font-bold font-nunito text-gray-800">{notes.title || topic}</h3>
                        <div className="flex gap-2">
                            <button onClick={saveNotes} className="btn-ghost text-sm flex items-center gap-1.5">
                                <BookmarkPlus className="w-4 h-4" /> Save
                            </button>
                            <button onClick={exportPDF} className="btn-ghost text-sm flex items-center gap-1.5">
                                <FileDown className="w-4 h-4" /> PDF
                            </button>
                        </div>
                    </div>

                    {SECTION_CONFIG.map(sec => {
                        const content = notes[sec.key]
                        if (!content) return null
                        return (
                            <div key={sec.key} className="study-section mb-5">
                                <h4 className={`font-bold text-base mb-2 flex items-center gap-2 ${sec.color}`}>
                                    {sec.icon} {sec.title}
                                </h4>
                                {Array.isArray(content) ? (
                                    <ul className="space-y-1.5">
                                        {content.map((item, i) => (
                                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                {typeof item === 'object' ? (
                                                    <span><strong className="text-gray-800">{item.term}:</strong> {item.definition}</span>
                                                ) : (
                                                    <><span className="text-pink-400 mt-0.5">•</span><span>{item}</span></>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm text-gray-600 leading-relaxed flex-1">{content}</p>
                                        <button
                                            onClick={() => speakNotes(content)}
                                            className="text-pink-300 hover:text-pink-500 transition-colors flex-shrink-0"
                                            title="Read aloud"
                                        >
                                            🔊
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    <VisualAids
                        mermaidCode={notes.mermaidDiagram}
                        comparisonTable={notes.comparisonTable}
                    />
                </div>
            )}
        </div>
    )
}
