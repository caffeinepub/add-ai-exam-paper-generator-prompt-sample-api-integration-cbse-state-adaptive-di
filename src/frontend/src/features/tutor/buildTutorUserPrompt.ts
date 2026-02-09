/**
 * Helper function to build a structured user prompt for the tutor.
 * Supports optional explanation language and attachment context.
 */

interface TutorPromptParams {
  grade: number;
  subject: string;
  topic: string;
  question: string;
  explanationLanguage?: string;
  attachmentContext?: string;
}

export function buildTutorUserPrompt(params: TutorPromptParams): string {
  const { grade, subject, topic, question, explanationLanguage, attachmentContext } = params;

  let prompt = `Student Context:
- Grade/Class: ${grade}
- Subject: ${subject}
- Topic: ${topic}

Student Question:
${question}`;

  // Add attachment context if provided
  if (attachmentContext) {
    prompt += `\n\n${attachmentContext}`;
  }

  prompt += '\n\nPlease provide a clear, step-by-step explanation that helps the student understand this concept thoroughly.';

  // Add language instruction if not English
  if (explanationLanguage && explanationLanguage !== 'english') {
    const languageLabel = explanationLanguage.charAt(0).toUpperCase() + explanationLanguage.slice(1);
    prompt += `\n\nRespond in: ${languageLabel}`;
  }

  return prompt;
}
