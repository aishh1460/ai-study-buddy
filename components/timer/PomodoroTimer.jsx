'use client'
import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react'

const WORK_MINUTES = 25
const BREAK_MINUTES = 5

export default function PomodoroTimer({ onXpGain }) {
    const [phase, setPhase] = useState('work') // 'work' | 'break'
    const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60)
    const [running, setRunning] = useState(false)
    const [sessions, setSessions] = useState(0)
    const intervalRef = useRef(null)

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setSecondsLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current)
                        setRunning(false)
                        if (phase === 'work') {
                            setSessions(s => s + 1)
                            onXpGain(15, 'pomodoro')
                            setPhase('break')
                            setSecondsLeft(BREAK_MINUTES * 60)
                            playBeep('work-done')
                        } else {
                            setPhase('work')
                            setSecondsLeft(WORK_MINUTES * 60)
                            playBeep('break-done')
                        }
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(intervalRef.current)
    }, [running, phase])

    const playBeep = (type) => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.type = 'sine'
            osc.frequency.value = type === 'work-done' ? 880 : 440
            gain.gain.setValueAtTime(0.3, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1)
            osc.start()
            osc.stop(ctx.currentTime + 1)
        } catch { }
    }

    const toggle = () => setRunning(r => !r)
    const reset = () => {
        setRunning(false)
        setPhase('work')
        setSecondsLeft(WORK_MINUTES * 60)
        clearInterval(intervalRef.current)
    }

    const totalSecs = phase === 'work' ? WORK_MINUTES * 60 : BREAK_MINUTES * 60
    const progress = ((totalSecs - secondsLeft) / totalSecs) * 100
    const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
    const secs = String(secondsLeft % 60).padStart(2, '0')

    const radius = 54
    const circumference = 2 * Math.PI * radius
    const strokeDash = circumference - (progress / 100) * circumference

    return (
        <div className="glass-card p-6 mb-6">
            <h3 className="section-header text-xl font-bold mb-4 flex items-center gap-2">
                ⏱️ Focus Timer
            </h3>

            <div className="flex flex-col items-center">
                {/* SVG ring */}
                <div className="relative w-36 h-36 mb-5">
                    <svg className="w-full h-full timer-ring" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r={radius} fill="none" stroke="#fce7f3" strokeWidth="10" />
                        <circle
                            cx="60" cy="60" r={radius}
                            fill="none"
                            stroke={phase === 'work' ? '#ec4899' : '#a78bfa'}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDash}
                            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold font-nunito text-gray-800">{mins}:{secs}</span>
                        <span className="text-xs text-gray-500">{phase === 'work' ? '🎯 Focus' : '☕ Break'}</span>
                    </div>
                </div>

                {/* Phase indicator */}
                <div className="flex gap-2 mb-4">
                    <span className={`badge ${phase === 'work' ? 'earned' : ''}`}>🎯 Work</span>
                    <span className={`badge ${phase === 'break' ? 'earned' : ''}`}>☕ Break</span>
                </div>

                {/* Controls */}
                <div className="flex gap-3 mb-4">
                    <button onClick={toggle} className="btn-glow flex items-center gap-2">
                        {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {running ? 'Pause' : 'Start'}
                    </button>
                    <button onClick={reset} className="btn-ghost flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Reset
                    </button>
                </div>

                <div className="text-center text-sm text-pink-600 font-semibold bg-pink-50 rounded-xl px-4 py-2">
                    🍅 Sessions completed today: <strong>{sessions}</strong>
                </div>
            </div>
        </div>
    )
}
