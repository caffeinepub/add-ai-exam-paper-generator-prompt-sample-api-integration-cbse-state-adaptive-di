/**
 * Helper function to build a structured user prompt for the tutor.
 */

interface TutorPromptParams {
  grade: number;
  subject: string;
  topic: string;
  question: string;
}

export function buildTutorUserPrompt(params: TutorPromptParams): string {
  const { grade, subject, topic, question } = params;

  return `Student Context:
- Grade/Class: ${grade}
- Subject: ${subject}
- Topic: ${topic}

Student Question:
${question}

Please provide a clear, step-by-step explanation that helps the student understand this concept thoroughly.`;
}
