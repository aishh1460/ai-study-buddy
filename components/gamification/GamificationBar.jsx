'use client'
import { useState, useEffect } from 'react'
import { Trophy, Star, Zap, Award } from 'lucide-react'

const BADGES = [
    { id: 'first_study', icon: '📖', label: 'First Study', xpRequired: 10 },
    { id: 'quiz_master', icon: '🧩', label: 'Quiz Master', xpRequired: 50 },
    { id: 'streak_3', icon: '🔥', label: '3-Day Streak', xpRequired: 100 },
    { id: 'deep_diver', icon: '🌊', label: 'Deep Diver', xpRequired: 200 },
    { id: 'note_saver', icon: '📚', label: 'Note Keeper', xpRequired: 150 },
    { id: 'voice_user', icon: '🎤', label: 'Voice Explorer', xpRequired: 80 },
]

const LEVELS = [
    { name: 'Seedling 🌱', minXp: 0 },
    { name: 'Scholar 📘', minXp: 50 },
    { name: 'Thinker 💡', minXp: 150 },
    { name: 'Explorer 🔭', minXp: 300 },
    { name: 'Master 🏆', minXp: 500 },
    { name: 'Legend ⭐', minXp: 1000 },
]

function getLevel(xp) {
    let level = LEVELS[0]
    for (const l of LEVELS) {
        if (xp >= l.minXp) level = l
    }
    const idx = LEVELS.indexOf(level)
    const nextLevel = LEVELS[idx + 1]
    const progress = nextLevel
        ? ((xp - level.minXp) / (nextLevel.minXp - level.minXp)) * 100
        : 100
    return { level, nextLevel, progress: Math.min(progress, 100) }
}

export default function GamificationBar({ xp, streak }) {
    const { level, nextLevel, progress } = getLevel(xp)
    const earnedBadges = BADGES.filter(b => xp >= b.xpRequired)

    return (
        <div className="glass-card p-5 mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center shadow-lg">
                        <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="font-bold text-gray-700">{level.name}</div>
                        <div className="text-sm text-pink-500 font-medium flex items-center gap-1">
                            <Zap className="w-3 h-3" />{xp} XP
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-nunito font-800 text-orange-500">🔥 {streak}</div>
                        <div className="text-xs text-gray-500">Day Streak</div>
                    </div>
                </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{level.name}</span>
                    {nextLevel && <span>{nextLevel.name} ({nextLevel.minXp - xp} XP to go)</span>}
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
                {BADGES.map(badge => (
                    <span
                        key={badge.id}
                        className={`badge text-xs ${earnedBadges.find(b => b.id === badge.id) ? 'earned' : 'opacity-40'}`}
                        title={`${badge.xpRequired} XP required`}
                    >
                        {badge.icon} {badge.label}
                    </span>
                ))}
            </div>
        </div>
    )
}

export { BADGES }
