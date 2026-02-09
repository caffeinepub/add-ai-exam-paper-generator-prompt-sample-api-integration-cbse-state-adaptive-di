/**
 * Authenticated app shell with role-based navigation and routing.
 * Handles login gate, profile setup, and renders appropriate dashboard based on user role.
 */

import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../features/auth/useGetCallerUserProfile';
import { LoginPage } from '../features/auth/LoginPage';
import { OnboardingProfilePage } from '../features/onboarding/OnboardingProfilePage';
import { StudentDashboardPage } from '../features/dashboards/student/StudentDashboardPage';
import { ParentDashboardPage } from '../features/dashboards/parent/ParentDashboardPage';
import { TutorPage } from '../features/tutor/TutorPage';
import { ExamGeneratorRoute } from '../features/examGenerator/ExamGeneratorRoute';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MyUserRole } from '../backend';
import { Loader2 } from 'lucide-react';

type Page = 'dashboard' | 'tutor' | 'exam-generator';

export function AppShell() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const isAuthenticated = !!identity;

  // Show loading during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show loading while fetching profile
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if profile doesn't exist
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;
  if (showProfileSetup) {
    return <OnboardingProfilePage />;
  }

  // Render appropriate page based on current navigation
  const renderPage = () => {
    if (currentPage === 'tutor') {
      return <TutorPage />;
    }
    if (currentPage === 'exam-generator') {
      return <ExamGeneratorRoute />;
    }
    
    // Dashboard (default)
    if (userProfile?.role === MyUserRole.parent) {
      return <ParentDashboardPage />;
    }
    return <StudentDashboardPage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        userProfile={userProfile} 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}
