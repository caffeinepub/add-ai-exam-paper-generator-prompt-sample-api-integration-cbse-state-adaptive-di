/**
 * Student dashboard showing recent progress, weekly summary, and quick action links.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, TrendingUp, Clock, Award } from 'lucide-react';
import { useGetCallerUserProfile } from '../../auth/useGetCallerUserProfile';
import { useStudentDashboardData } from './useStudentDashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type Page = 'dashboard' | 'tutor' | 'exam-generator';

interface StudentDashboardPageProps {
  onNavigate?: (page: Page) => void;
}

export function StudentDashboardPage({ onNavigate }: StudentDashboardPageProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { recentActivity, weeklySummary, isLoading } = useStudentDashboardData(
    userProfile?.id || BigInt(0)
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const handleNavigateToTutor = () => {
    onNavigate?.('tutor');
  };

  const handleNavigateToExamGenerator = () => {
    onNavigate?.('exam-generator');
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile?.name}!</h1>
        <p className="text-muted-foreground">Here's your learning progress for the past week</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklySummary?.sessionsCompleted.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Understanding Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklySummary?.averageUnderstanding.toString() || '0'}/5
            </div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correctness</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklySummary?.averageCorrectness.toString() || '0'}%
            </div>
            <p className="text-xs text-muted-foreground">Average score</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
          onClick={handleNavigateToTutor}
          onKeyDown={(e) => handleKeyDown(e, handleNavigateToTutor)}
          tabIndex={0}
          role="button"
          aria-label="Navigate to AI Tutor"
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>AI Tutor</CardTitle>
                <CardDescription>Get help with any topic</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Ask questions and get step-by-step explanations from your AI tutor
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
          onClick={handleNavigateToExamGenerator}
          onKeyDown={(e) => handleKeyDown(e, handleNavigateToExamGenerator)}
          tabIndex={0}
          role="button"
          aria-label="Navigate to Exam Generator"
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Exam Generator</CardTitle>
                <CardDescription>Practice with custom papers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Generate personalized exam papers based on your curriculum
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest tutoring sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((session, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.subject}</p>
                      <Badge variant="outline" className="text-xs">
                        {session.topic}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(Number(session.timestamp) / 1000000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      Understanding: {session.understandingScore.toString()}/5
                    </Badge>
                    <Badge variant="secondary">
                      Score: {session.correctnessScore.toString()}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activity yet. Start a tutoring session to see your progress here!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
