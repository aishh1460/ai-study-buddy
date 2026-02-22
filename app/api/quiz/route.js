import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || '').trim())

export async function POST(request) {
    try {
        const { topic, notes } = await request.json()

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return NextResponse.json({ quiz: getDemoQuiz(topic) })
        }

        const modelName = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim()
        const model = genAI.getGenerativeModel({ model: modelName })

        const prompt = `Based on the topic "${topic}", generate a quiz with the following structure. Respond ONLY with valid JSON:
{
  "mcq": [
    {
      "question": "Question text?",
      "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
      "answer": "A) Option A",
      "explanation": "Why this answer is correct"
    }
  ],
  "trueFalse": [
    {
      "statement": "Statement here",
      "answer": true,
      "explanation": "Explanation"
    }
  ],
  "shortAnswer": [
    {
      "question": "Short answer question?",
      "answer": "Model answer"
    }
  ]
}

Generate 4 MCQ, 4 True/False, and 3 Short Answer questions.`

        let result
        try {
            result = await model.generateContent(prompt)
        } catch (firstError) {
            console.error('Quiz attempt failed, trying fallback...', firstError)
            const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
            result = await fallbackModel.generateContent(prompt)
        }
        const text = result.response.text()
        let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const quiz = JSON.parse(cleaned)

        return NextResponse.json({ quiz })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

function getDemoQuiz(topic) {
    return {
        mcq: [
            {
                question: `What is the primary purpose of studying ${topic}?`,
                options: ['A) To memorize facts', 'B) To understand concepts', 'C) To pass exams only', 'D) To avoid other subjects'],
                answer: 'B) To understand concepts',
                explanation: 'Understanding concepts is more valuable than rote memorization as it enables application.',
            },
            {
                question: `Which approach is best for learning ${topic}?`,
                options: ['A) Read once and forget', 'B) Active recall and spaced repetition', 'C) Passive reading only', 'D) Skip difficult parts'],
                answer: 'B) Active recall and spaced repetition',
                explanation: 'Active recall with spaced repetition is scientifically proven to be the most effective learning strategy.',
            },
            {
                question: `What characterizes a strong understanding of ${topic}?`,
                options: ['A) Ability to recite facts', 'B) Speed of recall', 'C) Ability to apply knowledge to new problems', 'D) Number of notes taken'],
                answer: 'C) Ability to apply knowledge to new problems',
                explanation: 'True understanding is demonstrated by applying concepts to novel situations.',
            },
            {
                question: `Which learning mode is best for exam preparation on ${topic}?`,
                options: ['A) Deep Learning Mode', 'B) Quick Summary Mode', 'C) Exam Revision Mode', 'D) Voice Mode'],
                answer: 'C) Exam Revision Mode',
                explanation: 'Exam Revision Mode provides concise, exam-focused content optimized for test preparation.',
            },
        ],
        trueFalse: [
            { statement: `Understanding the basics of ${topic} is not necessary before advanced study.`, answer: false, explanation: 'Foundational knowledge is essential before advancing to complex topics.' },
            { statement: `${topic} has real-world applications beyond academic study.`, answer: true, explanation: `${topic} is widely applied in industry, research, and everyday life.` },
            { statement: `Consistent daily practice is more effective than long occasional study sessions.`, answer: true, explanation: 'Spaced, consistent practice leads to better retention than irregular cramming.' },
            { statement: `Visual aids like flowcharts do not help with understanding complex topics.`, answer: false, explanation: 'Visual representations significantly improve comprehension and retention of information.' },
        ],
        shortAnswer: [
            { question: `In your own words, explain the core concept of ${topic}.`, answer: `${topic} involves understanding fundamental principles and applying them to solve problems and explain phenomena in the real world.` },
            { question: `List three important applications of ${topic}.`, answer: 'Applications include: (1) Solving real-world problems, (2) Foundation for advanced research, (3) Industry implementations and innovations.' },
            { question: `What study strategies would you use to master ${topic}?`, answer: 'Effective strategies include: active recall practice, spaced repetition, visual note-taking, connecting concepts to real examples, and regular self-testing.' },
        ],
    }
}
