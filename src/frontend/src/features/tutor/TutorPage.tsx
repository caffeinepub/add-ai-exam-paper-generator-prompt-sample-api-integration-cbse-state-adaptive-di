/**
 * AI Tutor page for interactive learning sessions.
 * Students can ask questions, attach files, select explanation language, and receive step-by-step explanations.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BookOpen, Save, AlertCircle, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { generateTutorResponse } from './generateTutorResponse';
import { useRecordTutoringSession } from './useRecordTutoringSession';
import { useGetCallerUserProfile } from '../auth/useGetCallerUserProfile';
import { IndiaLanguageSelect } from '../language/IndiaLanguageSelect';
import { toast } from 'sonner';

interface AttachedFile {
  file: File;
  preview?: string;
  extractedText?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const ACCEPTED_DOC_TYPES = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

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
  const [explanationLanguage, setExplanationLanguage] = useState('english');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const recordSessionMutation = useRecordTutoringSession();

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('tutorExplanationLanguage');
    if (savedLanguage) {
      setExplanationLanguage(savedLanguage);
    }
  }, []);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('tutorExplanationLanguage', explanationLanguage);
  }, [explanationLanguage]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      attachedFiles.forEach((af) => {
        if (af.preview) {
          URL.revokeObjectURL(af.preview);
        }
      });
    };
  }, [attachedFiles]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" exceeds 5MB limit`);
        continue;
      }

      // Validate file type
      const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
      const isDoc = ACCEPTED_DOC_TYPES.includes(file.type);
      
      if (!isImage && !isDoc) {
        toast.error(`File "${file.name}" has unsupported format`);
        continue;
      }

      const attachedFile: AttachedFile = { file };

      // Create preview for images
      if (isImage) {
        attachedFile.preview = URL.createObjectURL(file);
      }

      // Extract text from .txt files
      if (file.type === 'text/plain') {
        try {
          const text = await file.text();
          attachedFile.extractedText = text;
        } catch (err) {
          console.error('Failed to read text file:', err);
        }
      }

      setAttachedFiles((prev) => [...prev, attachedFile]);
    }

    // Reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const buildAttachmentContext = (): string => {
    let context = '';
    
    // Add extracted text from .txt files
    const textFiles = attachedFiles.filter((af) => af.extractedText);
    if (textFiles.length > 0) {
      context += '\n\nAttached Document Content:\n';
      textFiles.forEach((af) => {
        context += `\n--- ${af.file.name} ---\n${af.extractedText}\n`;
      });
    }

    // Add notes for non-text documents
    const nonTextDocs = attachedFiles.filter(
      (af) => !af.extractedText && ACCEPTED_DOC_TYPES.includes(af.file.type)
    );
    if (nonTextDocs.length > 0) {
      context += '\n\nAttached Documents (content not extracted):\n';
      nonTextDocs.forEach((af) => {
        context += `- ${af.file.name}\n`;
      });
    }

    // Add notes for images
    const images = attachedFiles.filter((af) => ACCEPTED_IMAGE_TYPES.includes(af.file.type));
    if (images.length > 0) {
      context += '\n\nAttached Images:\n';
      images.forEach((af) => {
        context += `- ${af.file.name}\n`;
      });
    }

    return context;
  };

  const handleAsk = async () => {
    if (!subject.trim() || !question.trim()) {
      toast.error('Please enter both subject and question');
      return;
    }

    setIsGenerating(true);
    setError('');
    setResponse('');

    try {
      const attachmentContext = attachedFiles.length > 0 ? buildAttachmentContext() : undefined;
      
      const result = await generateTutorResponse({
        grade: parseInt(grade),
        subject: subject.trim(),
        topic: topic.trim() || 'General',
        question: question.trim(),
        explanationLanguage,
        attachmentContext,
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
              <Label htmlFor="explanationLanguage">Explanation language</Label>
              <IndiaLanguageSelect
                id="explanationLanguage"
                value={explanationLanguage}
                onValueChange={setExplanationLanguage}
              />
              <p className="text-xs text-muted-foreground">
                Choose your preferred language for the tutor's explanation
              </p>
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

            <div className="space-y-2">
              <Label htmlFor="fileAttachment">Attach files (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="fileAttachment"
                  type="file"
                  multiple
                  accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOC_TYPES].join(',')}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('fileAttachment')?.click()}
                >
                  <Paperclip className="mr-2 h-4 w-4" />
                  Attach Files
                </Button>
                <span className="text-xs text-muted-foreground">
                  Images, PDF, TXT, DOC/DOCX (max 5MB)
                </span>
              </div>

              {/* File previews */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2 mt-3">
                  {attachedFiles.map((af, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 border rounded-lg bg-muted/30"
                    >
                      {af.preview ? (
                        <img
                          src={af.preview}
                          alt={af.file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : ACCEPTED_IMAGE_TYPES.includes(af.file.type) ? (
                        <div className="w-12 h-12 flex items-center justify-center bg-muted rounded">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-muted rounded">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{af.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(af.file.size / 1024).toFixed(1)} KB
                          {af.extractedText && ' • Text extracted'}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {attachedFiles.some((af) => ACCEPTED_DOC_TYPES.includes(af.file.type) && !af.extractedText) && (
                <p className="text-xs text-muted-foreground mt-2">
                  Note: For PDF/DOC files, please paste key text from the document into your question for best results.
                </p>
              )}
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
