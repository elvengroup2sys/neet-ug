import { useEffect, useState } from 'react'
import { samplePyqs } from '../data/samplePyqs'
import { fetchPyqs, isFirebaseConfigured, recordAttempt } from '../firebase'
import { generateVariation } from '../api'

const OPTION_KEYS = ['A', 'B', 'C', 'D']

export default function Practice({ user }) {
  const [pyqs, setPyqs] = useState(samplePyqs)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [index, setIndex] = useState(0)
  const [current, setCurrent] = useState(samplePyqs[0])
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [variationLoading, setVariationLoading] = useState(false)
  const [variationError, setVariationError] = useState(null)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    let cancelled = false
    fetchPyqs()
      .then((fetched) => {
        if (!cancelled && fetched.length > 0) {
          setPyqs(fetched)
          setCurrent(fetched[0])
        }
      })
      .catch((err) => console.error('Failed to fetch PYQs', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const isCorrect = selected === current.correctAnswer
  const isVariation = current.id?.startsWith('variation-')

  if (loading) {
    return (
      <p role="status" aria-live="polite">
        Loading questions…
      </p>
    )
  }

  const handleSelect = (key) => {
    if (revealed) return
    setSelected(key)
  }

  const handleCheck = () => {
    if (!selected) return
    setRevealed(true)
    recordAttempt(user?.uid, current, isCorrect).catch((err) =>
      console.error('Failed to record attempt', err),
    )
  }

  const handleNext = () => {
    const nextIndex = (index + 1) % pyqs.length
    setIndex(nextIndex)
    setCurrent(pyqs[nextIndex])
    setSelected(null)
    setRevealed(false)
    setVariationError(null)
  }

  const handleDrillConcept = async () => {
    setVariationLoading(true)
    setVariationError(null)
    try {
      const variation = await generateVariation(current)
      setCurrent({
        ...variation,
        id: `variation-${Date.now()}`,
        subject: current.subject,
        topic: current.topic,
        year: null,
        difficulty: current.difficulty,
      })
      setSelected(null)
      setRevealed(false)
    } catch (err) {
      setVariationError(err.message || 'Could not generate a variation. Try again.')
    } finally {
      setVariationLoading(false)
    }
  }

  return (
    <section className="practice" aria-labelledby="practice-heading">
      <div className="practice__meta">
        <span className="practice__tag">{current.subject}</span>
        <span className="practice__tag">{current.topic}</span>
        {isVariation ? (
          <span className="practice__tag practice__tag--variation">AI variation</span>
        ) : (
          <span className="practice__tag">{current.year}</span>
        )}
      </div>

      <h2 id="practice-heading" className="practice__question">
        {current.question}
      </h2>

      <div className="practice__options" role="radiogroup" aria-labelledby="practice-heading">
        {OPTION_KEYS.map((key) => {
          const isSelected = selected === key
          const isAnswer = key === current.correctAnswer
          let state = ''
          if (revealed) {
            if (isAnswer) state = 'option--correct'
            else if (isSelected) state = 'option--incorrect'
          } else if (isSelected) {
            state = 'option--selected'
          }

          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`option ${state}`}
              onClick={() => handleSelect(key)}
              disabled={revealed}
            >
              <span className="option__key">{key}</span>
              <span className="option__text">{current.options[key]}</span>
              {revealed && isAnswer && <span className="option__badge">Correct answer</span>}
              {revealed && isSelected && !isAnswer && <span className="option__badge">Your answer</span>}
            </button>
          )
        })}
      </div>

      {!revealed && (
        <button className="btn btn--primary" onClick={handleCheck} disabled={!selected}>
          Check answer
        </button>
      )}

      {revealed && (
        <div className="practice__result" role="status">
          <p className={`practice__verdict ${isCorrect ? 'practice__verdict--correct' : 'practice__verdict--incorrect'}`}>
            {isCorrect ? 'Correct!' : 'Not quite.'}
          </p>
          <p className="practice__explanation">
            <strong>Why:</strong> {current.explanation}
          </p>

          {variationError && <p className="practice__error">{variationError}</p>}

          <div className="practice__actions">
            {!isCorrect && (
              <button className="btn btn--ghost" onClick={handleDrillConcept} disabled={variationLoading}>
                {variationLoading ? 'Generating…' : 'Drill this concept again'}
              </button>
            )}
            <button className="btn btn--primary" onClick={handleNext}>
              Next question
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
