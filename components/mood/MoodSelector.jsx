'use client'

const MOODS = [
    {
        id: 'calm',
        emoji: '😊',
        label: 'Calm',
        message: 'Take a deep breath and flow with the study. 🌸',
        className: 'mood-calm',
    },
    {
        id: 'motivated',
        emoji: '🔥',
        label: 'Motivated',
        message: "Let's crush it today! Nothing can stop you! 💪",
        className: 'mood-motivated',
    },
    {
        id: 'tired',
        emoji: '😴',
        label: 'Tired',
        message: 'Short focused sessions today, you got this! ☕',
        className: 'mood-tired',
    },
    {
        id: 'stressed',
        emoji: '😰',
        label: 'Stressed',
        message: 'Breathe. Break it into small steps. One at a time. 🍃',
        className: 'mood-stressed',
    },
]

export default function MoodSelector({ currentMood, onMoodChange }) {
    const activeMood = MOODS.find(m => m.id === currentMood)

    const handleMood = (mood) => {
        document.body.className = mood.className
        onMoodChange(mood.id)
    }

    return (
        <div className="glass-card p-5 mb-6">
            <h3 className="section-header text-lg font-bold mb-3">🌈 How are you feeling?</h3>
            <div className="grid grid-cols-4 gap-2 mb-3">
                {MOODS.map(mood => (
                    <button
                        key={mood.id}
                        onClick={() => handleMood(mood)}
                        className={`p-3 rounded-2xl text-center transition-all duration-300 border-2 cursor-pointer ${currentMood === mood.id
                                ? 'border-pink-400 bg-pink-100 shadow-md scale-105'
                                : 'border-transparent bg-white/50 hover:bg-pink-50 hover:border-pink-200'
                            }`}
                    >
                        <div className="text-2xl mb-1">{mood.emoji}</div>
                        <div className="text-xs font-semibold text-gray-600">{mood.label}</div>
                    </button>
                ))}
            </div>
            {activeMood && (
                <div className="text-center text-sm text-pink-600 font-medium bg-pink-50 rounded-xl py-2 px-4 animate-fade-in">
                    {activeMood.message}
                </div>
            )}
        </div>
    )
}

export { MOODS }
