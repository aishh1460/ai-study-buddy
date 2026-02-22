'use client'
import { useState, useEffect } from 'react'
import { Trash2, BookOpen, Download } from 'lucide-react'

export default function NotesLibrary({ onLoadTopic }) {
    const [library, setLibrary] = useState([])
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('studyLibrary') || '[]')
        setLibrary(saved)
    }, [])

    const refresh = () => {
        const saved = JSON.parse(localStorage.getItem('studyLibrary') || '[]')
        setLibrary(saved)
    }

    const deleteEntry = (idx) => {
        const updated = library.filter((_, i) => i !== idx)
        localStorage.setItem('studyLibrary', JSON.stringify(updated))
        setLibrary(updated)
    }

    if (!expanded) {
        return (
            <div className="glass-card p-4 mb-6">
                <button
                    onClick={() => { refresh(); setExpanded(true) }}
                    className="w-full flex items-center justify-between"
                >
                    <span className="section-header text-lg font-bold flex items-center gap-2">
                        📚 My Notes Library
                        <span className="text-sm font-normal text-gray-400">({library.length} saved)</span>
                    </span>
                    <span className="text-pink-400 text-sm">View →</span>
                </button>
            </div>
        )
    }

    return (
        <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="section-header text-xl font-bold flex items-center gap-2">
                    📚 My Notes Library
                </h3>
                <button onClick={() => setExpanded(false)} className="text-gray-400 hover:text-gray-600 text-sm">
                    ✕ Close
                </button>
            </div>

            {library.length === 0 ? (
                <div className="text-center py-8 text-pink-300">
                    <p className="text-4xl mb-2">📂</p>
                    <p className="text-sm">No saved notes yet. Generate notes and click Save!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {library.map((entry, i) => (
                        <div key={i} className="bg-white/60 rounded-2xl p-4 border border-pink-100 hover:border-pink-300 transition-all">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 text-sm">{entry.topic}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-pink-500 capitalize bg-pink-50 px-2 py-0.5 rounded-full">
                                            {entry.mode === 'deep' ? '🔬 Deep' :
                                                entry.mode === 'exam' ? '📝 Exam' :
                                                    entry.mode === 'quick' ? '⚡ Quick' : '🌟 Simplified'} Mode
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(entry.savedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {entry.notes?.keyPoints?.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">
                                            • {entry.notes.keyPoints[0]}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onLoadTopic && onLoadTopic(entry)}
                                        className="p-2 rounded-xl text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                        title="Load notes"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteEntry(i)}
                                        className="p-2 rounded-xl text-red-300 hover:bg-red-50 hover:text-red-500 transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
