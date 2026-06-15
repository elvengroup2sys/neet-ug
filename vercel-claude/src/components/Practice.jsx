import { useState } from 'react'
import { samplePyqs } from '../data/samplePyqs'
import { recordAttempt } from '../firebase'

const OPTION_KEYS = ['A', 'B', 'C', 'D']

export default function Practice({ user }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const pyq = samplePyqs[index]
  const isCorrect = selected === pyq.correctAnswer

  const handleSelect = (key) => {
    if (revealed) return
    setSelected(key)
  }

  const handleCheck = () => {
    if (!selected) return
    setRevealed(true)
    recordAttempt(user?.uid, pyq, isCorrect).catch((err) =>
      console.error('Failed to record attempt', err),
    )
  }

  const handleNext = () => {
    setIndex((i) => (i + 1) % samplePyqs.length)
    setSelected(null)
    setRevealed(false)
  }

  return (
    <section className="practice" aria-labelledby="practice-heading">
      <div className="practice__meta">
        <span className="practice__tag">{pyq.subject}</span>
        <span className="practice__tag">{pyq.topic}</span>
        <span className="practice__tag">{pyq.year}</span>
      </div>

      <h2 id="practice-heading" className="practice__question">
        {pyq.question}
      </h2>

      <div className="practice__options" role="radiogroup" aria-labelledby="practice-heading">
        {OPTION_KEYS.map((key) => {
          const isSelected = selected === key
          const isAnswer = key === pyq.correctAnswer
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
              <span className="option__text">{pyq.options[key]}</span>
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
            <strong>Why:</strong> {pyq.explanation}
          </p>
          <button className="btn btn--primary" onClick={handleNext}>
            Next question
          </button>
        </div>
      )}
    </section>
  )
}
