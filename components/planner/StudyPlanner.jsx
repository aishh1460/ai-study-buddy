'use client'
import { useState } from 'react'
import { Loader2, Plus, X, Calendar } from 'lucide-react'

export default function StudyPlanner({ onXpGain }) {
    const [subjects, setSubjects] = useState([''])
    const [examDate, setExamDate] = useState('')
    const [schedule, setSchedule] = useState(null)
    const [loading, setLoading] = useState(false)

    const addSubject = () => setSubjects(s => [...s, ''])
    const removeSubject = (i) => setSubjects(s => s.filter((_, idx) => idx !== i))
    const updateSubject = (i, val) => setSubjects(s => s.map((sv, idx) => idx === i ? val : sv))

    const generate = async () => {
        const filtered = subjects.filter(s => s.trim())
        if (!filtered.length || !examDate) return
        setLoading(true)
        setSchedule(null)
        try {
            const res = await fetch('/api/planner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjects: filtered, examDate }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setSchedule(data.schedule)
            onXpGain(20, 'planner')
        } catch (err) {
            alert('Planner error: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return (
        <div className="glass-card p-6 mb-6">
            <h3 className="section-header text-xl font-bold mb-4 flex items-center gap-2">
                🎯 AI Study Planner
            </h3>

            {/* Inputs */}
            <div className="space-y-3 mb-4">
                <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 block">📅 Exam Date</label>
                    <input
                        type="date"
                        value={examDate}
                        onChange={e => setExamDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-pink-200 bg-white/70 text-gray-700 focus:outline-none focus:border-pink-400 text-sm"
                    />
                </div>
                <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 block">📚 Subjects</label>
                    <div className="space-y-2">
                        {subjects.map((s, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="text"
                                    value={s}
                                    onChange={e => updateSubject(i, e.target.value)}
                                    placeholder={`Subject ${i + 1}`}
                                    className="flex-1 px-4 py-2 rounded-xl border-2 border-pink-100 bg-white/70 text-sm focus:outline-none focus:border-pink-400"
                                />
                                {subjects.length > 1 && (
                                    <button onClick={() => removeSubject(i)} className="p-2 text-pink-400 hover:text-red-400 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={addSubject} className="text-sm text-pink-500 font-medium flex items-center gap-1 hover:underline">
                            <Plus className="w-4 h-4" /> Add Subject
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={generate}
                disabled={loading || !subjects.filter(s => s.trim()).length || !examDate}
                className="btn-glow w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                {loading ? 'Building Schedule…' : 'Generate Study Schedule'}
            </button>

            {/* Schedule Output */}
            {schedule && (
                <div className="mt-6 animate-fade-in space-y-5">
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="glass-card p-3 text-center">
                            <div className="text-2xl font-bold text-pink-500">{schedule.totalDays}</div>
                            <div className="text-xs text-gray-500">Days Remaining</div>
                        </div>
                        <div className="glass-card p-3 text-center">
                            <div className="text-2xl font-bold text-purple-500">{schedule.dailyHours}h</div>
                            <div className="text-xs text-gray-500">Daily Study Goal</div>
                        </div>
                    </div>

                    {/* Phases */}
                    {schedule.phases?.length > 0 && (
                        <div>
                            <h4 className="font-bold text-gray-700 mb-3 text-sm">📈 Study Phases</h4>
                            <div className="space-y-2">
                                {schedule.phases.map((phase, i) => (
                                    <div key={i} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="font-semibold text-gray-700 text-sm">{phase.name}</div>
                                                <div className="text-xs text-pink-500 mt-0.5">{phase.days}</div>
                                                <div className="text-xs text-gray-500 mt-1">{phase.focus}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Weekly Schedule */}
                    {schedule.weeklySchedule && (
                        <div>
                            <h4 className="font-bold text-gray-700 mb-3 text-sm">📅 Weekly Schedule</h4>
                            <div className="space-y-1.5">
                                {DAYS.filter(d => schedule.weeklySchedule[d]).map(day => (
                                    <div key={day} className="flex gap-3 items-start">
                                        <div className="w-20 flex-shrink-0 text-xs font-semibold text-pink-600 pt-1">{day}</div>
                                        <div className="flex-1 flex flex-wrap gap-1">
                                            {schedule.weeklySchedule[day].map((task, i) => (
                                                <span key={i} className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-lg">{task}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reminders */}
                    {schedule.weakTopicReminders?.length > 0 && (
                        <div>
                            <h4 className="font-bold text-gray-700 mb-2 text-sm">⚠️ Weak Topic Reminders</h4>
                            <ul className="space-y-1">
                                {schedule.weakTopicReminders.map((r, i) => (
                                    <li key={i} className="text-xs text-gray-600 flex gap-2 items-start">
                                        <span className="text-amber-400">📌</span>{r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {schedule.revisionStrategy && (
                        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
                            <p className="text-xs text-purple-700"><strong>💡 Strategy:</strong> {schedule.revisionStrategy}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
