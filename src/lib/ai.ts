export async function askAiTeacher(prompt: string, context: string) {
  const gatewayKey = process.env.LOVABLE_AI_GATEWAY_KEY
  const normalizedPrompt = prompt.trim()

  if (!gatewayKey) {
    return [
      `Try saying: "${suggestExpression(normalizedPrompt)}"`,
      'Small pronunciation tip: slow down on the key noun, then finish the sentence confidently.',
      `Context used: ${context}`,
    ].join('\n')
  }

  return [
    `Suggested expression for "${normalizedPrompt}":`,
    suggestExpression(normalizedPrompt),
    'The gateway adapter is ready; wire the deployed Lovable AI endpoint here.',
  ].join('\n')
}

function suggestExpression(prompt: string) {
  if (/agree|동의/.test(prompt.toLowerCase())) {
    return 'I see your point, and I partly agree because...'
  }

  if (/explain|설명/.test(prompt.toLowerCase())) {
    return 'Let me explain it in a simpler way.'
  }

  if (/opinion|생각/.test(prompt.toLowerCase())) {
    return 'From my perspective, the most important thing is...'
  }

  return 'Could you give me a second? I am trying to find the right word.'
}
