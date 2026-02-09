/**
 * Application header with role-based navigation and user menu.
 * Displays navigation links appropriate for the user's role.
 */

import { GraduationCap, BookOpen, FileText, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { UserProfile, MyUserRole } from '../backend';

interface HeaderProps {
  userProfile: UserProfile | null | undefined;
  currentPage: string;
  onNavigate: (page: 'dashboard' | 'tutor' | 'exam-generator') => void;
}

export function Header({ userProfile, currentPage, onNavigate }: HeaderProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const isStudent = userProfile?.role === MyUserRole.student;
  const isParent = userProfile?.role === MyUserRole.parent;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 font-bold text-xl hover:text-primary transition-colors"
          >
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>AI Tutor</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={currentPage === 'dashboard' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </Button>
            
            {isStudent && (
              <>
                <Button
                  variant={currentPage === 'tutor' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('tutor')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Tutor
                </Button>
                <Button
                  variant={currentPage === 'exam-generator' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('exam-generator')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exam Generator
                </Button>
              </>
            )}
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{userProfile?.name || 'User'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userProfile?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userProfile?.role || 'User'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
