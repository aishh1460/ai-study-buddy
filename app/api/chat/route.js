import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || '').trim())

export async function POST(request) {
    try {
        const { messages, topic } = await request.json()

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            const lastMsg = messages[messages.length - 1]?.content || ''
            return NextResponse.json({
                reply: `Great question about "${lastMsg}"! This is a demo response. Add your Gemini API key in .env.local to enable real AI responses. In a real session, I would provide a detailed explanation related to ${topic || 'your topic'}, covering the key concepts and helping you understand the nuances. 🌸`,
            })
        }

        const modelName = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim()
        const model = genAI.getGenerativeModel({ model: modelName })

        // Build conversation history for Gemini
        const systemContext = `You are a friendly, encouraging AI study buddy. The student is currently studying: "${topic || 'a topic'}". 
Answer their doubts clearly, use simple language, give examples when helpful. Be warm and supportive. Keep responses concise (under 200 words).`

        // Filter messages to ensure history starts with 'user' and roles alternate
        // The first message is often a greeting from the assistant, which Gemini doesn't allow in history
        let history = []
        let processedMessages = messages.slice(0, -1)

        for (const m of processedMessages) {
            const role = m.role === 'user' ? 'user' : 'model'
            // Only add if it maintains the alternation or starts with user
            if (history.length === 0) {
                if (role === 'user') history.push({ role, parts: [{ text: m.content }] })
            } else {
                if (history[history.length - 1].role !== role) {
                    history.push({ role, parts: [{ text: m.content }] })
                }
            }
        }

        const chat = model.startChat({
            history,
            generationConfig: { maxOutputTokens: 500 },
        })

        const lastMessage = messages[messages.length - 1].content
        let result
        try {
            result = await chat.sendMessage(`[Context: studying ${topic}] ${lastMessage}`)
        } catch (firstError) {
            console.error('Chat attempt failed, starting new session with fallback model...', firstError)
            const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
            const fallbackChat = fallbackModel.startChat({ history })
            result = await fallbackChat.sendMessage(`[Context: studying ${topic}] ${lastMessage}`)
        }
        const reply = result.response.text()

        return NextResponse.json({ reply })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
