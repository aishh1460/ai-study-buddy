import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || '').trim())

export async function POST(request) {
    try {
        const { subjects, examDate } = await request.json()
        const today = new Date()
        const exam = new Date(examDate)
        const daysUntilExam = Math.ceil((exam - today) / (1000 * 60 * 60 * 24))

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return NextResponse.json({ schedule: getDemoSchedule(subjects, daysUntilExam) })
        }

        const modelName = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim()
        const model = genAI.getGenerativeModel({ model: modelName })

        const prompt = `Create a study schedule for a student.
Subjects: ${subjects.join(', ')}
Days until exam: ${daysUntilExam}
Today's date: ${today.toDateString()}

Generate a JSON study schedule:
{
  "totalDays": ${daysUntilExam},
  "dailyHours": 3,
  "phases": [
    {
      "name": "Phase 1: Foundation",
      "days": "Days 1-X",
      "focus": "What to study",
      "subjects": ["subject1", "subject2"]
    }
  ],
  "weeklySchedule": {
    "Monday": ["Subject - Topic (2h)", "Subject - Topic (1h)"],
    "Tuesday": ["..."],
    "Wednesday": ["..."],
    "Thursday": ["..."],
    "Friday": ["..."],
    "Saturday": ["..."],
    "Sunday": ["Review (1h)", "Rest"]
  },
  "weakTopicReminders": ["Reminder 1", "Reminder 2", "Reminder 3"],
  "revisionStrategy": "Brief revision strategy advice"
}

Respond with ONLY valid JSON.`

        let result
        try {
            result = await model.generateContent(prompt)
        } catch (firstError) {
            console.error('Planner attempt failed, trying fallback...', firstError)
            const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
            result = await fallbackModel.generateContent(prompt)
        }
        const text = result.response.text()
        let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const schedule = JSON.parse(cleaned)

        return NextResponse.json({ schedule })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

function getDemoSchedule(subjects, days) {
    const phase1Days = Math.floor(days * 0.4)
    const phase2Days = Math.floor(days * 0.35)
    const phase3Days = days - phase1Days - phase2Days

    return {
        totalDays: days,
        dailyHours: 4,
        phases: [
            { name: 'Phase 1: Foundation Building', days: `Days 1-${phase1Days}`, focus: 'Cover all basics and core concepts', subjects },
            { name: 'Phase 2: Practice & Application', days: `Days ${phase1Days + 1}-${phase1Days + phase2Days}`, focus: 'Practice problems, past papers, and applications', subjects },
            { name: 'Phase 3: Revision & Mock Tests', days: `Days ${phase1Days + phase2Days + 1}-${days}`, focus: 'Quick revision, full mock exams, and weak area focus', subjects },
        ],
        weeklySchedule: {
            Monday: subjects.map((s, i) => `${s} - Core Concepts (${i === 0 ? 2 : 1}h)`),
            Tuesday: subjects.map((s, i) => `${s} - Practice Problems (${i === 0 ? 1.5 : 1.5}h)`),
            Wednesday: subjects.map((s, i) => `${s} - Deep Dive (${i === 0 ? 2 : 1}h)`),
            Thursday: subjects.map(s => `${s} - Revision Notes (1h)`),
            Friday: subjects.map(s => `${s} - Mock Test (1h)`),
            Saturday: ['Full Mock Exam (3h)', 'Review Mistakes (1h)'],
            Sunday: ['Light Review (1h)', 'Rest & Relax 🌸'],
        },
        weakTopicReminders: subjects.map(s => `Review difficult sections of ${s} regularly`),
        revisionStrategy: `With ${days} days remaining, focus on understanding fundamentals first, then practice extensively. Use spaced repetition for key facts and do full mock exams in the final week.`,
    }
}
