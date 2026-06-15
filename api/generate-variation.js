// POST /api/generate-variation
// Generates ONE fresh practice question testing the same concept as a given
// PYQ. Server-side only - never expose the Claude API key to the client.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'AI variations are not configured on the server' })
  }

  const { question, options, correctAnswer, concept, subject, topic, difficulty } = req.body || {}

  if (!question || !options || !correctAnswer || !concept) {
    return res.status(400).json({ error: 'Missing required PYQ fields' })
  }

  const prompt = buildPrompt({ question, options, correctAnswer, concept, subject, topic, difficulty })

  let claudeResponse
  try {
    claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
  } catch (err) {
    console.error('generate-variation: request to Claude failed', err)
    return res.status(502).json({ error: 'Failed to reach the AI service' })
  }

  if (!claudeResponse.ok) {
    const errorText = await claudeResponse.text()
    console.error('generate-variation: Claude API error', claudeResponse.status, errorText)
    return res.status(502).json({ error: 'AI service returned an error' })
  }

  const data = await claudeResponse.json()
  const rawText = data?.content?.[0]?.text ?? ''
  const variation = parseVariation(rawText, concept)

  if (!variation) {
    console.error('generate-variation: could not parse AI response', rawText)
    return res.status(502).json({ error: 'Could not parse the AI response' })
  }

  return res.status(200).json(variation)
}

function buildPrompt({ question, options, correctAnswer, concept, subject, topic, difficulty }) {
  return `You write practice questions for NEET-UG (India's medical entrance exam) aspirants.

A student just got this question wrong:
Subject: ${subject || 'unknown'}
Topic: ${topic || 'unknown'}
Concept being tested: ${concept}
Original question: ${question}
Original options: A) ${options.A}  B) ${options.B}  C) ${options.C}  D) ${options.D}
Correct answer: ${correctAnswer}

Write ONE new multiple-choice question that tests the same underlying concept
("${concept}") but uses a different scenario, numbers, or phrasing so it is
not the same question. Match the NEET-UG syllabus and a "${difficulty || 'medium'}"
difficulty level. Write the explanation in your own original words - do not
copy textbook or coaching-material wording.

Respond with ONLY a JSON object, no markdown fences and no extra text, in
exactly this shape:
{
  "question": "...",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "correctAnswer": "A",
  "explanation": "...",
  "concept": "${concept}"
}`
}

function parseVariation(rawText, fallbackConcept) {
  let text = rawText.trim()
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim()

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return null

  let parsed
  try {
    parsed = JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }

  const options = parsed.options
  const validOptions =
    options && ['A', 'B', 'C', 'D'].every((key) => typeof options[key] === 'string')

  if (
    typeof parsed.question !== 'string' ||
    !validOptions ||
    !['A', 'B', 'C', 'D'].includes(parsed.correctAnswer) ||
    typeof parsed.explanation !== 'string'
  ) {
    return null
  }

  return {
    question: parsed.question,
    options,
    correctAnswer: parsed.correctAnswer,
    explanation: parsed.explanation,
    concept: typeof parsed.concept === 'string' ? parsed.concept : fallbackConcept,
  }
}
