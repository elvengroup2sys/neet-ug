// Placeholder sample questions for local development and demos, in the same
// shape as the `pyqs/{id}` Firestore documents described in PRODUCT.md.
// Replace with verified PYQs (with official NTA answers) once the Firebase
// project and PYQ bank exist.
export const samplePyqs = [
  {
    id: 'sample-physics-1',
    year: 2023,
    subject: 'Physics',
    topic: 'Laws of Motion',
    subtopic: "Newton's Second Law",
    question:
      'A force of 10 N acts on a body of mass 2 kg that is initially at rest. What is the acceleration of the body?',
    options: {
      A: '2 m/s²',
      B: '5 m/s²',
      C: '10 m/s²',
      D: '20 m/s²',
    },
    correctAnswer: 'B',
    explanation:
      "By Newton's second law, F = ma, so a = F / m = 10 N / 2 kg = 5 m/s².",
    concept: "Newton's second law of motion (F = ma)",
    difficulty: 'easy',
  },
  {
    id: 'sample-chemistry-1',
    year: 2022,
    subject: 'Chemistry',
    topic: 'Chemical Bonding',
    subtopic: 'Hybridisation',
    question: 'What is the hybridisation of the carbon atom in methane (CH₄)?',
    options: {
      A: 'sp',
      B: 'sp²',
      C: 'sp³',
      D: 'sp³d',
    },
    correctAnswer: 'C',
    explanation:
      'Carbon in methane forms four equivalent sigma bonds arranged tetrahedrally, which requires sp³ hybridisation of one s and three p orbitals.',
    concept: 'sp³ hybridisation in tetrahedral molecules',
    difficulty: 'easy',
  },
  {
    id: 'sample-biology-1',
    year: 2023,
    subject: 'Biology',
    topic: 'Cell Biology',
    subtopic: 'Cell Organelles',
    question: 'Which cell organelle is primarily responsible for ATP production through aerobic respiration?',
    options: {
      A: 'Golgi apparatus',
      B: 'Mitochondria',
      C: 'Ribosome',
      D: 'Lysosome',
    },
    correctAnswer: 'B',
    explanation:
      'Mitochondria carry out oxidative phosphorylation in their inner membrane, generating most of a cell’s ATP during aerobic respiration.',
    concept: 'Mitochondria as the site of aerobic ATP production',
    difficulty: 'easy',
  },
]
