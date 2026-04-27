import { describe, expect, it } from 'vitest'
import { createStudyNoteFromTranscript } from '../src/lib/notes'

describe('study note generation shape', () => {
  it('returns the required MVP note sections', () => {
    const note = createStudyNoteFromTranscript('I need time because I forgot the right phrase.')

    expect(note.expressions).toHaveLength(5)
    expect(note.stuckMoments[0]?.suggestion).toContain('organize my thoughts')
    expect(note.feedback.length).toBeGreaterThan(0)
    expect(note.nextPrepWords).toContain('confidence')
  })
})
