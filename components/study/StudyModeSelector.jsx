'use client'

const MODES = [
    {
        id: 'exam',
        icon: '📝',
        label: 'Exam Revision',
        desc: 'Concise & exam-focused',
        color: 'from-red-400 to-pink-400',
    },
    {
        id: 'deep',
        icon: '🔬',
        label: 'Deep Learning',
        desc: 'Detailed explanations',
        color: 'from-blue-400 to-violet-400',
    },
    {
        id: 'quick',
        icon: '⚡',
        label: 'Quick Summary',
        desc: 'Fast revision bullets',
        color: 'from-amber-400 to-orange-400',
    },
    {
        id: 'simplified',
        icon: '🌟',
        label: 'Concept Simplified',
        desc: 'Beginner friendly',
        color: 'from-green-400 to-teal-400',
    },
]

export default function StudyModeSelector({ selectedMode, onModeChange }) {
    return (
        <div className="mb-5">
            <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                🧠 Choose Learning Mode
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {MODES.map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        className={`p-3 rounded-2xl text-left transition-all duration-300 border-2 cursor-pointer ${selectedMode === mode.id
                                ? `border-transparent bg-gradient-to-br ${mode.color} text-white shadow-lg scale-105`
                                : 'border-pink-100 bg-white/60 hover:bg-pink-50 hover:border-pink-200'
                            }`}
                    >
                        <div className="text-xl mb-1">{mode.icon}</div>
                        <div className={`text-xs font-bold ${selectedMode === mode.id ? 'text-white' : 'text-gray-700'}`}>
                            {mode.label}
                        </div>
                        <div className={`text-xs mt-0.5 ${selectedMode === mode.id ? 'text-white/80' : 'text-gray-400'}`}>
                            {mode.desc}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
