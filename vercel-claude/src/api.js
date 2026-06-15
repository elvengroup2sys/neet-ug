// Calls the server-side AI variation generator for one PYQ at a time.
export async function generateVariation(pyq) {
  const res = await fetch('/api/generate-variation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: pyq.question,
      options: pyq.options,
      correctAnswer: pyq.correctAnswer,
      concept: pyq.concept,
      subject: pyq.subject,
      topic: pyq.topic,
      difficulty: pyq.difficulty,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Failed to generate a variation')
  }

  return res.json()
}
