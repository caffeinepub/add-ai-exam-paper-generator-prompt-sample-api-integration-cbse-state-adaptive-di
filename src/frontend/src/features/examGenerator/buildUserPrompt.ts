/**
 * Builds a deterministic user prompt from UI inputs.
 * This prompt is combined with the system prompt to generate exam papers.
 */

import { Board } from './examTypes';

export interface ExamGenerationInputs {
  board: Board;
  grade: number;
  subject: string;
  chapters: string[];
  topics: string[];
  duration: number;
  totalMarks: number;
  difficultyTarget: string;
}

/**
 * Converts UI inputs into a structured user prompt for the LLM
 */
export function buildUserPrompt(inputs: ExamGenerationInputs): string {
  const boardText = inputs.board === Board.CBSE ? 'CBSE' : 'State Board';
  
  const chaptersText = inputs.chapters.length > 0 
    ? inputs.chapters.join(', ') 
    : 'All chapters';
  
  const topicsText = inputs.topics.length > 0 
    ? inputs.topics.join(', ') 
    : 'All topics';

  return `Generate a complete exam paper with the following specifications:

**Curriculum Details:**
- Board: ${boardText}
- Grade/Class: ${inputs.grade}
- Subject: ${inputs.subject}

**Syllabus Scope:**
- Chapters: ${chaptersText}
- Topics: ${topicsText}

**Exam Specifications:**
- Duration: ${inputs.duration} minutes
- Total Marks: ${inputs.totalMarks}
- Difficulty Target: ${inputs.difficultyTarget}

**Instructions:**
1. Create a balanced mix of MCQ, Short Answer, and Problem Solving questions
2. Distribute difficulty as: ${inputs.difficultyTarget}
3. Ensure total marks sum exactly to ${inputs.totalMarks}
4. All questions must be from the specified chapters and topics only
5. Make questions appropriate for Class ${inputs.grade} students

Generate the exam paper now in the specified JSON format.`;
}
