/**
 * AI Tutor page for interactive learning sessions.
 * Students can ask questions and receive step-by-step explanations.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BookOpen, Save, AlertCircle } from 'lucide-react';
import { generateTutorResponse } from './generateTutorResponse';
import { useRecordTutoringSession } from './useRecordTutoringSession';
import { useGetCallerUserProfile } from '../auth/useGetCallerUserProfile';
import { toast } from 'sonner';

export function TutorPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const [grade, setGrade] = useState('10');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [understandingScore, setUnderstandingScore] = useState('3');

  const recordSessionMutation = useRecordTutoringSession();

  const handleAsk = async () => {
    if (!subject.trim() || !question.trim()) {
      toast.error('Please enter both subject and question');
      return;
    }

    setIsGenerating(true);
    setError('');
    setResponse('');

    try {
      const result = await generateTutorResponse({
        grade: parseInt(grade),
        subject: subject.trim(),
        topic: topic.trim() || 'General',
        question: question.trim(),
      });

      setResponse(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate response');
      toast.error('Failed to generate response');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSession = () => {
    if (!userProfile?.id || !subject.trim() || !response) {
      toast.error('Cannot save session');
      return;
    }

    recordSessionMutation.mutate({
      studentId: userProfile.id,
      subject: subject.trim(),
      topic: topic.trim() || 'General',
      understandingScore: BigInt(parseInt(understandingScore)),
      correctnessScore: BigInt(75), // Default score
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">AI Tutor</h1>
        <p className="text-muted-foreground text-lg">
          Get personalized help with any topic - ask questions and receive step-by-step explanations
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Ask Your Question</CardTitle>
            <CardDescription>Provide context to get the best answer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade/Class</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger id="grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                    <SelectItem key={g} value={g.toString()}>
                      Class {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics, Science, English"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic (Optional)</Label>
              <Input
                id="topic"
                placeholder="e.g., Algebra, Photosynthesis, Grammar"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">Your Question</Label>
              <Textarea
                id="question"
                placeholder="Ask anything you'd like help with..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={handleAsk}
              disabled={isGenerating || !subject.trim() || !question.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Ask Tutor
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Response Area */}
        <div className="space-y-4">
          {isGenerating && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">Generating your answer...</p>
                <p className="text-sm text-muted-foreground mt-2">This may take a few seconds</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-destructive">
              <CardContent className="flex items-start gap-3 py-6">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Error</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {response && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Tutor Response</CardTitle>
                  <CardDescription>
                    {subject} {topic && `- ${topic}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap">{response}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Save This Session</CardTitle>
                  <CardDescription>Track your progress by saving this tutoring session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="understanding">How well did you understand? (1-5)</Label>
                    <Select value={understandingScore} onValueChange={setUnderstandingScore}>
                      <SelectTrigger id="understanding">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Didn't understand</SelectItem>
                        <SelectItem value="2">2 - Partially understood</SelectItem>
                        <SelectItem value="3">3 - Understood</SelectItem>
                        <SelectItem value="4">4 - Well understood</SelectItem>
                        <SelectItem value="5">5 - Completely understood</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleSaveSession}
                    disabled={recordSessionMutation.isPending}
                    className="w-full"
                  >
                    {recordSessionMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Session
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
