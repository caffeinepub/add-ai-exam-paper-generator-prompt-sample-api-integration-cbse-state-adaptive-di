/**
 * Parent dashboard for viewing linked students and their progress.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Clock, Award, BookOpen } from 'lucide-react';
import { useGetCallerUserProfile } from '../../auth/useGetCallerUserProfile';
import { useParentDashboardData } from './useParentDashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '../../../backend';

export function ParentDashboardPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { linkedStudents, isLoading: studentsLoading } = useParentDashboardData(
    userProfile?.id || BigInt(0)
  );
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const { studentProgress, studentSummary, isLoading: progressLoading } = useParentDashboardData(
    userProfile?.id || BigInt(0),
    selectedStudent?.id
  );

  if (studentsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Parent Dashboard</h1>
        <p className="text-muted-foreground">Monitor your children's learning progress</p>
      </div>

      {/* Linked Students */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Linked Students
          </CardTitle>
          <CardDescription>Select a student to view their progress</CardDescription>
        </CardHeader>
        <CardContent>
          {linkedStudents && linkedStudents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {linkedStudents.map((student) => (
                <Button
                  key={student.id.toString()}
                  variant={selectedStudent?.id === student.id ? 'default' : 'outline'}
                  className="h-auto p-4 justify-start"
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="text-left">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No linked students yet. Contact your school admin to link students.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Student Progress */}
      {selectedStudent && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{selectedStudent.name}'s Progress</h2>
            <p className="text-muted-foreground">Last 7 days</p>
          </div>

          {progressLoading ? (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {studentSummary?.sessionsCompleted.toString() || '0'}
                    </div>
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
                      {studentSummary?.averageUnderstanding.toString() || '0'}/5
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
                      {studentSummary?.averageCorrectness.toString() || '0'}%
                    </div>
                    <p className="text-xs text-muted-foreground">Average score</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest tutoring sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {studentProgress && studentProgress.length > 0 ? (
                    <div className="space-y-4">
                      {studentProgress.slice(0, 5).map((session, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between p-4 rounded-lg border bg-card"
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
                      <p>No activity yet for this student.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
