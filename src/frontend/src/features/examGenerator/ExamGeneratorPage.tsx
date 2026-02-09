/**
 * Main Exam Generator page with form inputs and exam paper preview.
 * Allows users to specify exam parameters and generate papers using AI.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import { useGenerateExamPaper } from './useGenerateExamPaper';
import { ExamPaperPreview } from './ExamPaperPreview';
import { Board } from './examTypes';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export function ExamGeneratorPage() {
  const { identity } = useInternetIdentity();
  const [board, setBoard] = useState<Board>(Board.CBSE);
  const [grade, setGrade] = useState('10');
  const [subject, setSubject] = useState('');
  const [chapters, setChapters] = useState('');
  const [topics, setTopics] = useState('');
  const [duration, setDuration] = useState('180');
  const [totalMarks, setTotalMarks] = useState('100');
  const [difficultyTarget, setDifficultyTarget] = useState('Balanced (50% Easy, 35% Medium, 15% Hard)');
  const [showAnswers, setShowAnswers] = useState(false);

  const generateMutation = useGenerateExamPaper();

  const handleGenerate = () => {
    if (!subject.trim()) {
      alert('Please enter a subject');
      return;
    }

    const chaptersArray = chapters
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);
    
    const topicsArray = topics
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const request = {
      requester: identity?.getPrincipal() || { toText: () => 'anonymous' } as any,
      board: board,
      grade: BigInt(parseInt(grade)),
      subject: subject.trim(),
      syllabusScope: {
        chapters: chaptersArray,
        topics: topicsArray
      },
      duration: BigInt(parseInt(duration)),
      totalMarks: BigInt(parseInt(totalMarks)),
      difficultyTarget,
      timestamp: BigInt(Date.now() * 1000000) // Convert to nanoseconds
    };

    generateMutation.mutate(request);
  };

  const handleBoardChange = (value: string) => {
    switch (value) {
      case 'CBSE':
        setBoard(Board.CBSE);
        break;
      case 'State':
        setBoard(Board.State);
        break;
      case 'ICSE':
        setBoard(Board.ICSE);
        break;
      case 'IB':
        setBoard(Board.IB);
        break;
      case 'IGCSE':
        setBoard(Board.IGCSE);
        break;
      default:
        setBoard(Board.CBSE);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">AI Exam Paper Generator</h1>
          <p className="text-muted-foreground text-lg">
            Generate customized exam papers for CBSE, State Board, ICSE, IB, and IGCSE curricula
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Exam Specifications</CardTitle>
              <CardDescription>
                Configure your exam paper parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Board Selection */}
              <div className="space-y-2">
                <Label htmlFor="board">Board</Label>
                <Select value={board} onValueChange={handleBoardChange}>
                  <SelectTrigger id="board">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="State">State Board</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                    <SelectItem value="IB">IB</SelectItem>
                    <SelectItem value="IGCSE">IGCSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <Label htmlFor="grade">Grade/Class</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger id="grade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
                      <SelectItem key={g} value={g.toString()}>
                        Class {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics, Science, English"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Chapters */}
              <div className="space-y-2">
                <Label htmlFor="chapters">Chapters (comma-separated)</Label>
                <Textarea
                  id="chapters"
                  placeholder="e.g., Algebra, Geometry, Trigonometry"
                  value={chapters}
                  onChange={(e) => setChapters(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Topics */}
              <div className="space-y-2">
                <Label htmlFor="topics">Topics (comma-separated)</Label>
                <Textarea
                  id="topics"
                  placeholder="e.g., Linear equations, Pythagoras theorem, Sine and cosine"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Duration and Marks */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="180"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    min="1"
                    max="200"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                  />
                </div>
              </div>

              {/* Difficulty Target */}
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Distribution</Label>
                <Select value={difficultyTarget} onValueChange={setDifficultyTarget}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy Focus (60% Easy, 30% Medium, 10% Hard)">
                      Easy Focus (60% Easy, 30% Medium, 10% Hard)
                    </SelectItem>
                    <SelectItem value="Balanced (50% Easy, 35% Medium, 15% Hard)">
                      Balanced (50% Easy, 35% Medium, 15% Hard)
                    </SelectItem>
                    <SelectItem value="Challenging (40% Easy, 40% Medium, 20% Hard)">
                      Challenging (40% Easy, 40% Medium, 20% Hard)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !subject.trim()}
                className="w-full"
                size="lg"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Exam Paper...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Exam Paper
                  </>
                )}
              </Button>

              {/* Debug Toggle */}
              {generateMutation.isSuccess && generateMutation.data?.success && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Label htmlFor="showAnswers" className="cursor-pointer">
                    Show Answers (Debug Mode)
                  </Label>
                  <Switch
                    id="showAnswers"
                    checked={showAnswers}
                    onCheckedChange={setShowAnswers}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Area */}
          <div className="space-y-4">
            {generateMutation.isPending && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-lg font-medium">Generating your exam paper...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This may take 10-30 seconds
                  </p>
                </CardContent>
              </Card>
            )}

            {generateMutation.isError && (
              <Card className="border-destructive">
                <CardContent className="flex items-start gap-3 py-6">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Generation Failed</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {generateMutation.error?.message || 'An unexpected error occurred'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {generateMutation.isSuccess && !generateMutation.data?.success && (
              <Card className="border-destructive">
                <CardContent className="py-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Parse Error</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {generateMutation.data.error}
                      </p>
                    </div>
                  </div>
                  {generateMutation.data.rawResponse && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Show raw response
                      </summary>
                      <pre className="mt-2 p-3 bg-muted rounded overflow-auto max-h-40">
                        {generateMutation.data.rawResponse}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            )}

            {generateMutation.isSuccess && generateMutation.data?.success && generateMutation.data.data && (
              <ExamPaperPreview
                examPaper={generateMutation.data.data.examPaper}
                showAnswers={showAnswers}
              />
            )}

            {!generateMutation.isPending && !generateMutation.isSuccess && !generateMutation.isError && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No exam paper generated yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Fill in the form and click "Generate Exam Paper" to start
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
