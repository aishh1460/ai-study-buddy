'use client'
import { useState } from 'react'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function QuizGenerator({ topic, onXpGain }) {
    const [quiz, setQuiz] = useState(null)
    const [loading, setLoading] = useState(false)
    const [answers, setAnswers] = useState({})
    const [checked, setChecked] = useState(false)
    const [tab, setTab] = useState('mcq')

    const generateQuiz = async () => {
        if (!topic) return
        setLoading(true)
        setQuiz(null)
        setAnswers({})
        setChecked(false)
        try {
            const res = await fetch('/api/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setQuiz(data.quiz)
            onXpGain(10, 'quiz-generated')
        } catch (err) {
            alert('Quiz generation failed: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const selectAnswer = (key, value) => {
        if (checked) return
        setAnswers(prev => ({ ...prev, [key]: value }))
    }

    const checkAnswers = () => {
        setChecked(true)
        let score = 0
        if (quiz?.mcq) {
            quiz.mcq.forEach((q, i) => {
                if (answers[`mcq-${i}`] === q.answer) score += 10
            })
        }
        if (quiz?.trueFalse) {
            quiz.trueFalse.forEach((q, i) => {
                if (String(answers[`tf-${i}`]) === String(q.answer)) score += 10
            })
        }
        onXpGain(score, 'quiz-answered')
    }

    const TABS = [
        { id: 'mcq', label: '📝 MCQ', count: quiz?.mcq?.length },
        { id: 'tf', label: '✅ True/False', count: quiz?.trueFalse?.length },
        { id: 'sa', label: '💬 Short Answer', count: quiz?.shortAnswer?.length },
    ]

    return (
        <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h3 className="section-header text-xl font-bold">🧩 Quiz Generator</h3>
                {topic && (
                    <button onClick={generateQuiz} disabled={loading} className="btn-glow text-sm flex items-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🎲'}
                        {loading ? 'Generating…' : `Quiz: ${topic}`}
                    </button>
                )}
            </div>

            {!topic && !quiz && (
                <div className="text-center py-8 text-pink-300">
                    <p className="text-4xl mb-2">🧩</p>
                    <p className="text-sm">Generate study notes first, then come back to take a quiz!</p>
                </div>
            )}

            {quiz && (
                <>
                    {/* Tabs */}
                    <div className="flex gap-2 mb-5 border-b border-pink-100 pb-2 flex-wrap">
                        {TABS.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-pink-500 text-white shadow' : 'text-gray-500 hover:bg-pink-50'
                                    }`}
                            >
                                {t.label} {t.count != null && <span className="ml-1 opacity-70">({t.count})</span>}
                            </button>
                        ))}
                    </div>

                    {/* MCQ Tab */}
                    {tab === 'mcq' && quiz.mcq && (
                        <div className="space-y-6">
                            {quiz.mcq.map((q, i) => (
                                <div key={i}>
                                    <p className="font-semibold text-gray-700 mb-2 text-sm">
                                        Q{i + 1}. {q.question}
                                    </p>
                                    <div className="space-y-1.5">
                                        {q.options.map((opt, j) => {
                                            const selected = answers[`mcq-${i}`] === opt
                                            const isCorrect = opt === q.answer
                                            let cls = 'quiz-option'
                                            if (checked) {
                                                if (isCorrect) cls += ' correct'
                                                else if (selected && !isCorrect) cls += ' wrong'
                                            } else if (selected) {
                                                cls += ' border-pink-400 bg-pink-50'
                                            }
                                            return (
                                                <div key={j} className={cls} onClick={() => selectAnswer(`mcq-${i}`, opt)}>
                                                    <span className="text-sm">{opt}</span>
                                                    {checked && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500 inline ml-2" />}
                                                    {checked && selected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 inline ml-2" />}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {checked && (
                                        <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-xl p-2">
                                            💡 {q.explanation}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* True/False Tab */}
                    {tab === 'tf' && quiz.trueFalse && (
                        <div className="space-y-5">
                            {quiz.trueFalse.map((q, i) => (
                                <div key={i}>
                                    <p className="font-semibold text-gray-700 mb-2 text-sm">
                                        Q{i + 1}. {q.statement}
                                    </p>
                                    <div className="flex gap-3">
                                        {[true, false].map(val => {
                                            const selected = answers[`tf-${i}`] === val
                                            const isCorrect = val === q.answer
                                            let cls = 'quiz-option flex-1 text-center'
                                            if (checked) {
                                                if (isCorrect) cls += ' correct'
                                                else if (selected && !isCorrect) cls += ' wrong'
                                            } else if (selected) {
                                                cls += ' border-pink-400 bg-pink-50'
                                            }
                                            return (
                                                <div key={String(val)} className={cls} onClick={() => selectAnswer(`tf-${i}`, val)}>
                                                    <span className="text-sm font-medium">{val ? '✅ True' : '❌ False'}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {checked && (
                                        <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-xl p-2">
                                            💡 {q.explanation}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Short Answer Tab */}
                    {tab === 'sa' && quiz.shortAnswer && (
                        <div className="space-y-5">
                            {quiz.shortAnswer.map((q, i) => (
                                <div key={i}>
                                    <p className="font-semibold text-gray-700 mb-2 text-sm">Q{i + 1}. {q.question}</p>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-pink-100 bg-white/70 text-sm focus:outline-none focus:border-pink-400 resize-none"
                                        placeholder="Type your answer here…"
                                        value={answers[`sa-${i}`] || ''}
                                        onChange={(e) => selectAnswer(`sa-${i}`, e.target.value)}
                                    />
                                    {checked && (
                                        <div className="mt-2 bg-green-50 border border-green-200 rounded-xl p-3">
                                            <p className="text-xs text-green-700"><strong>Model Answer:</strong> {q.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {!checked && (
                        <button onClick={checkAnswers} className="btn-glow mt-5 w-full">
                            ✅ Check Answers
                        </button>
                    )}
                    {checked && (
                        <div className="mt-4 text-center bg-pink-50 rounded-2xl p-4">
                            <p className="text-pink-600 font-bold text-lg">🎉 Quiz Complete! XP awarded!</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
