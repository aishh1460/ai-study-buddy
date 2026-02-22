import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || '').trim())

const MODE_PROMPTS = {
    exam: `You are a study helper. Generate concise, exam-focused notes. Focus on key definitions, formulas, and likely exam questions. Be brief and precise.`,
    deep: `You are an expert teacher. Generate comprehensive, in-depth explanations with examples, analogies, and detailed breakdowns for every concept.`,
    quick: `You are a study assistant. Generate a very quick summary with bullet points only. Maximum 3 bullets per section. Fast and scannable.`,
    simplified: `You are explaining to a curious 12-year-old. Use very simple language, fun analogies, and avoid jargon. Make it relatable and easy to understand.`,
}

export async function POST(request) {
    try {
        const { topic, mode = 'deep' } = await request.json()

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            // Return demo content if no API key
            return NextResponse.json({ notes: getDemoContent(topic, mode) })
        }

        const modelName = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim()
        const model = genAI.getGenerativeModel({ model: modelName })

        const modeInstruction = MODE_PROMPTS[mode] || MODE_PROMPTS.deep

        const prompt = `${modeInstruction}

Topic: ${topic}

Generate structured study notes in the following JSON format (respond with ONLY valid JSON, no markdown):
{
  "title": "Topic Title",
  "beginner": "Beginner-friendly explanation in 2-4 sentences",
  "intermediate": "Intermediate concepts and key ideas (200-300 words)",
  "advanced": "Advanced insights and nuances (200-300 words)",
  "applications": ["application 1", "application 2", "application 3", "application 4"],
  "definitions": [{"term": "term1", "definition": "definition1"}, {"term": "term2", "definition": "definition2"}],
  "keyPoints": ["key point 1", "key point 2", "key point 3", "key point 4", "key point 5"],
  "examQuestions": ["question 1?", "question 2?", "question 3?", "question 4?"],
  "mermaidDiagram": "graph TD\\n  A[\"Start\"] --> B[\"Step 1\"]\\n  B --> C[\"Step 2\"]",
  "comparisonTable": {
    "headers": ["Aspect", "Option A", "Option B"],
    "rows": [["Row 1", "Val A", "Val B"]]
  },
  "formulas": ["formula or important rule 1", "formula or important rule 2"]
}

STRICT RULE FOR mermaidDiagram:
1. Every node label MUST be in double quotes, e.g., A["Label"].
2. Avoid using parentheses ( ) or brackets [ ] inside valid labels unless they are inside double quotes.
3. Keep the diagram simple and easy to read.
4. Use ONLY 'graph TD' (top-down) for consistency.`

        let result
        try {
            result = await model.generateContent(prompt)
        } catch (firstError) {
            console.error('First model attempt failed, trying fallback...', firstError)
            // Fallback to gemini-flash-latest if 2.0 fails
            const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
            result = await fallbackModel.generateContent(prompt)
        }

        const text = result.response.text()

        // Parse JSON from response (handle potential markdown code blocks)
        let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const notes = JSON.parse(cleaned)

        return NextResponse.json({ notes })
    } catch (error) {
        console.error('Study API error:', error)
        return NextResponse.json({ error: error.message || 'Failed to generate notes' }, { status: 500 })
    }
}

function getDemoContent(topic, mode) {
    return {
        title: topic,
        beginner: `${topic} is a fascinating subject that forms the foundation of many important concepts. Let's explore it step by step! Think of it as a building block that connects to many real-world situations.`,
        intermediate: `At an intermediate level, ${topic} involves understanding core principles and their interconnections. This includes analyzing patterns, relationships, and the underlying mechanisms that drive the subject forward. Students at this stage begin to see how theoretical concepts translate into practical applications.`,
        advanced: `Advanced study of ${topic} delves into nuanced theories, edge cases, and cutting-edge research. This level requires critical thinking, synthesis of multiple concepts, and the ability to evaluate competing frameworks. Researchers and professionals engage with ${topic} at this depth to push boundaries.`,
        applications: [
            `Real-world application 1 of ${topic}`,
            `Real-world application 2 of ${topic}`,
            `Industry use case involving ${topic}`,
            `Science and technology applications`,
        ],
        definitions: [
            { term: 'Core Concept', definition: `The fundamental principle underlying ${topic}` },
            { term: 'Key Term', definition: `An important term specific to the study of ${topic}` },
        ],
        keyPoints: [
            `${topic} is foundational to understanding related subjects`,
            'Break complex ideas into smaller components',
            'Connect theory to real-world examples',
            'Practice regularly to reinforce understanding',
            'Review and revise consistently',
        ],
        examQuestions: [
            `What are the main principles of ${topic}?`,
            `Explain the practical applications of ${topic}.`,
            `Compare and contrast key aspects of ${topic}.`,
            `What are common misconceptions about ${topic}?`,
        ],
        mermaidDiagram: `graph TD\n  A["Start: ${topic}"] --> B["Core Concepts"]\n  B --> C["Applications"]\n  B --> D["Theory"]\n  C --> E["Real World"]\n  D --> F["Advanced Study"]`,
        comparisonTable: {
            headers: ['Aspect', 'Basic Level', 'Advanced Level'],
            rows: [
                ['Complexity', 'Low', 'High'],
                ['Prerequisites', 'None', 'Foundational knowledge'],
                ['Time to learn', '1-2 weeks', '3-6 months'],
            ],
        },
        formulas: [
            `Key formula or rule related to ${topic}`,
            'Important principle or theorem to remember',
        ],
    }
}
