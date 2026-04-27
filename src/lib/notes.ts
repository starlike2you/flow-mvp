import type { StudyNoteContent } from './types'

export function createStudyNoteFromTranscript(transcript: string): StudyNoteContent {
  const shortTranscript = transcript.trim() || 'I wanted to explain my idea, but I needed more time.'

  return {
    expressions: [
      {
        phrase: 'What I mean is...',
        meaning: '내가 말하려는 건...',
        example: 'What I mean is that I need more practice speaking naturally.',
      },
      {
        phrase: 'Could you give me a second?',
        meaning: '잠깐만 시간을 줄래?',
        example: 'Could you give me a second? I am trying to find the right word.',
      },
      {
        phrase: 'That reminds me of...',
        meaning: '그건 ...을 떠올리게 해',
        example: 'That reminds me of my first team project.',
      },
      {
        phrase: 'I used to think...',
        meaning: '예전에는 ...라고 생각했어',
        example: 'I used to think speaking English had to be perfect.',
      },
      {
        phrase: 'I am getting more comfortable with...',
        meaning: '...에 점점 익숙해지고 있어',
        example: 'I am getting more comfortable with small talk.',
      },
    ],
    stuckMoments: [
      {
        original: shortTranscript.slice(0, 120),
        suggestion: 'I was trying to say that I needed a moment to organize my thoughts.',
      },
    ],
    feedback: [
      'Try finishing shorter sentences before adding more detail.',
      'Use fillers like "Let me think" instead of switching to Korean.',
      'Stress the main verb when you want your point to sound clearer.',
    ],
    nextPrepWords: ['comfortable', 'organize', 'reminds', 'specific', 'confidence'],
  }
}
