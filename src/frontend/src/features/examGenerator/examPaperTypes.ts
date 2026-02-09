/**
 * TypeScript types for the exam paper JSON schema.
 * These types ensure type safety when parsing and validating LLM responses.
 */

export type QuestionType = 'MCQ' | 'SHORT_ANSWER' | 'PROBLEM_SOLVING';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface ExamMetadata {
  title: string;
  board: string;
  grade: number;
  subject: string;
  duration: number;
  totalMarks: number;
  instructions: string;
}

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  marks: number;
  chapter: string;
  topic: string;
  questionText: string;
  options?: string[]; // Only for MCQ
  correctAnswer?: string; // Only for MCQ
  solutionHint?: string;
}

export interface ExamPaper {
  metadata: ExamMetadata;
  questions: ExamQuestion[];
}

export interface ExamPaperResponse {
  examPaper: ExamPaper;
}

/**
 * Type guard to validate if an object is a valid ExamQuestion
 */
export function isValidExamQuestion(obj: unknown): obj is ExamQuestion {
  if (typeof obj !== 'object' || obj === null) return false;
  const q = obj as Partial<ExamQuestion>;
  
  return (
    typeof q.id === 'string' &&
    (q.type === 'MCQ' || q.type === 'SHORT_ANSWER' || q.type === 'PROBLEM_SOLVING') &&
    (q.difficulty === 'EASY' || q.difficulty === 'MEDIUM' || q.difficulty === 'HARD') &&
    typeof q.marks === 'number' &&
    typeof q.chapter === 'string' &&
    typeof q.topic === 'string' &&
    typeof q.questionText === 'string' &&
    (q.type !== 'MCQ' || (Array.isArray(q.options) && typeof q.correctAnswer === 'string'))
  );
}

/**
 * Type guard to validate if an object is a valid ExamPaper
 */
export function isValidExamPaper(obj: unknown): obj is ExamPaper {
  if (typeof obj !== 'object' || obj === null) return false;
  const paper = obj as Partial<ExamPaper>;
  
  return (
    typeof paper.metadata === 'object' &&
    paper.metadata !== null &&
    typeof paper.metadata.title === 'string' &&
    typeof paper.metadata.board === 'string' &&
    typeof paper.metadata.grade === 'number' &&
    typeof paper.metadata.subject === 'string' &&
    typeof paper.metadata.duration === 'number' &&
    typeof paper.metadata.totalMarks === 'number' &&
    typeof paper.metadata.instructions === 'string' &&
    Array.isArray(paper.questions) &&
    paper.questions.every(isValidExamQuestion)
  );
}

/**
 * Type guard to validate the full response structure
 */
export function isValidExamPaperResponse(obj: unknown): obj is ExamPaperResponse {
  if (typeof obj !== 'object' || obj === null) return false;
  const response = obj as Partial<ExamPaperResponse>;
  
  return (
    typeof response.examPaper === 'object' &&
    isValidExamPaper(response.examPaper)
  );
}
