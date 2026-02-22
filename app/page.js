'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import StarBackground from '@/components/layout/StarBackground'
import MotivationBanner from '@/components/motivation/MotivationBanner'
import MoodSelector from '@/components/mood/MoodSelector'
import StudyBox from '@/components/study/StudyBox'
import GamificationBar from '@/components/gamification/GamificationBar'
import PomodoroTimer from '@/components/timer/PomodoroTimer'
import StudyPlanner from '@/components/planner/StudyPlanner'
import DoubtChat from '@/components/chat/DoubtChat'
import NotesLibrary from '@/components/notes/NotesLibrary'

// Dynamic imports for chart.js components (avoids SSR issues)
const QuizGenerator = dynamic(() => import('@/components/quiz/QuizGenerator'), { ssr: false })
const ProductivityChart = dynamic(() => import('@/components/timer/ProductivityChart'), { ssr: false })

const NAV_SECTIONS = [
    { id: 'study', label: '🎓 Study', icon: '🎓' },
    { id: 'quiz', label: '🧩 Quiz', icon: '🧩' },
    { id: 'timer', label: '⏱️ Timer', icon: '⏱️' },
    { id: 'planner', label: '🎯 Planner', icon: '🎯' },
    { id: 'chat', label: '💬 Chat', icon: '💬' },
    { id: 'library', label: '📚 Library', icon: '📚' },
]

export default function Home() {
    const [mood, setMood] = useState('calm')
    const [xp, setXp] = useState(0)
    const [streak, setStreak] = useState(0)
    const [currentTopic, setCurrentTopic] = useState('')
    const [activeSection, setActiveSection] = useState('study')
    const [studyData, setStudyData] = useState([0, 0, 0, 0, 0, 0, 0])

    // Load persisted state
    useEffect(() => {
        const savedXp = parseInt(localStorage.getItem('studyXp') || '0')
        const savedStreak = parseInt(localStorage.getItem('studyStreak') || '0')
        const lastStudy = localStorage.getItem('lastStudyDate')
        const today = new Date().toDateString()

        setXp(savedXp)

        if (lastStudy === today) {
            setStreak(savedStreak)
        } else if (lastStudy === new Date(Date.now() - 86400000).toDateString()) {
            setStreak(savedStreak + 1)
            localStorage.setItem('studyStreak', String(savedStreak + 1))
        } else {
            setStreak(1)
            localStorage.setItem('studyStreak', '1')
        }
        localStorage.setItem('lastStudyDate', today)

        // Load study data for chart
        const savedStudyData = JSON.parse(localStorage.getItem('weeklyStudyMins') || 'null')
        if (savedStudyData) setStudyData(savedStudyData)
    }, [])

    const handleXpGain = (amount, reason) => {
        setXp(prev => {
            const newXp = prev + amount
            localStorage.setItem('studyXp', String(newXp))
            return newXp
        })
        if (reason === 'pomodoro') {
            setStudyData(prev => {
                const updated = [...prev]
                updated[6] = (updated[6] || 0) + 25
                localStorage.setItem('weeklyStudyMins', JSON.stringify(updated))
                return updated
            })
        }
    }

    const handleNotesGenerated = ({ topic }) => {
        setCurrentTopic(topic)
        setActiveSection('study')
    }

    return (
        <main className="relative min-h-screen">
            <StarBackground />

            {/* Top Navbar */}
            <nav className="sticky top-0 z-50 px-4 py-3">
                <div className="max-w-6xl mx-auto glass-card px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        <div>
                            <div className="font-nunito font-800 text-lg text-gray-800 leading-none">AI Study Buddy</div>
                            <div className="text-xs text-pink-400">Your cozy study companion</div>
                        </div>
                    </div>

                    {/* Nav links */}
                    <div className="flex items-center gap-1 flex-wrap">
                        {NAV_SECTIONS.map(sec => (
                            <button
                                key={sec.id}
                                onClick={() => setActiveSection(sec.id)}
                                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${activeSection === sec.id
                                        ? 'bg-pink-500 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-pink-50'
                                    }`}
                            >
                                {sec.label}
                            </button>
                        ))}
                    </div>

                    {/* XP chip */}
                    <div className="flex items-center gap-2 bg-pink-50 rounded-full px-3 py-1">
                        <span className="text-xs font-bold text-pink-600">⚡ {xp} XP</span>
                        <span className="text-xs text-orange-500 font-semibold">🔥 {streak}</span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
                {/* Always visible: Motivation Banner, Mood */}
                <MotivationBanner />
                <MoodSelector currentMood={mood} onMoodChange={setMood} />
                <GamificationBar xp={xp} streak={streak} />

                {/* Section-based content */}
                {activeSection === 'study' && (
                    <>
                        <StudyBox onXpGain={handleXpGain} onNotesGenerated={handleNotesGenerated} />
                    </>
                )}

                {activeSection === 'quiz' && (
                    <QuizGenerator topic={currentTopic} onXpGain={handleXpGain} />
                )}

                {activeSection === 'timer' && (
                    <>
                        <PomodoroTimer onXpGain={handleXpGain} />
                        <ProductivityChart studyData={studyData} />
                    </>
                )}

                {activeSection === 'planner' && (
                    <StudyPlanner onXpGain={handleXpGain} />
                )}

                {activeSection === 'chat' && (
                    <DoubtChat topic={currentTopic} />
                )}

                {activeSection === 'library' && (
                    <NotesLibrary onLoadTopic={(entry) => {
                        setCurrentTopic(entry.topic)
                        setActiveSection('study')
                    }} />
                )}

                {/* Footer */}
                <div className="text-center mt-8 pb-6">
                    <p className="text-sm text-pink-400 font-medium">
                        Made with 💖 for students everywhere • AI Study Buddy ✨
                    </p>
                </div>
            </div>
        </main>
    )
}
