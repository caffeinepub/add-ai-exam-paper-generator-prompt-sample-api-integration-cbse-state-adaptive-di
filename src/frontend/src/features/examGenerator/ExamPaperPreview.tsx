/**
 * Component to render a generated exam paper with metadata and questions.
 * Supports grouping by question type and optional debug mode to show answers.
 */

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ExamPaper, QuestionType } from './examPaperTypes';

interface ExamPaperPreviewProps {
  examPaper: ExamPaper;
  showAnswers?: boolean;
}

const questionTypeLabels: Record<QuestionType, string> = {
  MCQ: 'Multiple Choice Questions',
  SHORT_ANSWER: 'Short Answer Questions',
  PROBLEM_SOLVING: 'Problem Solving Questions'
};

const difficultyColors = {
  EASY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  HARD: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export function ExamPaperPreview({ examPaper, showAnswers = false }: ExamPaperPreviewProps) {
  const { metadata, questions } = examPaper;

  // Group questions by type
  const questionsByType = questions.reduce((acc, question) => {
    if (!acc[question.type]) {
      acc[question.type] = [];
    }
    acc[question.type].push(question);
    return acc;
  }, {} as Record<QuestionType, typeof questions>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">{metadata.title}</CardTitle>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span>Board: {metadata.board}</span>
            <span>•</span>
            <span>Class: {metadata.grade}</span>
            <span>•</span>
            <span>Subject: {metadata.subject}</span>
          </div>
          <div className="flex justify-center gap-4 text-sm font-medium">
            <span>Duration: {metadata.duration} minutes</span>
            <span>•</span>
            <span>Total Marks: {metadata.totalMarks}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">General Instructions:</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{metadata.instructions}</p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Questions by Type */}
      {Object.entries(questionsByType).map(([type, typeQuestions]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="text-xl">{questionTypeLabels[type as QuestionType]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {typeQuestions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-lg shrink-0">{question.id}.</span>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-base leading-relaxed">{question.questionText}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={difficultyColors[question.difficulty]}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="secondary">{question.marks} marks</Badge>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Chapter: {question.chapter} • Topic: {question.topic}
                    </div>

                    {/* MCQ Options */}
                    {question.type === 'MCQ' && question.options && (
                      <div className="mt-3 space-y-1.5 pl-4">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded border ${
                              showAnswers && option === question.correctAnswer
                                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                : 'border-border'
                            }`}
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            {option}
                            {showAnswers && option === question.correctAnswer && (
                              <Badge className="ml-2 bg-green-600">Correct</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Solution Hint (Debug Mode) */}
                    {showAnswers && question.solutionHint && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          💡 Solution Hint:
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                          {question.solutionHint}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {index < typeQuestions.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
