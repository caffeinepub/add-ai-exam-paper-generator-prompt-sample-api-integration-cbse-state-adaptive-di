/**
 * Onboarding page for new users to set up their profile.
 * Collects display name, email, role, and school context with comprehensive error handling including duplicate email detection.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, GraduationCap, AlertCircle } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { MyUserRole } from '../../backend';
import { useCreateUserProfile } from './useCreateUserProfile';
import { useGetSchools } from './useGetSchools';
import { mapProfileCreationError } from './profileCreationErrors';

export function OnboardingProfilePage() {
  const { identity } = useInternetIdentity();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MyUserRole | ''>('');
  const [schoolId, setSchoolId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const createProfileMutation = useCreateUserProfile();
  const { data: schools, isLoading: schoolsLoading } = useGetSchools();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!name.trim() || !email.trim() || !role || !identity) {
      return;
    }

    // Prevent self-selection of School Admin
    if (role === MyUserRole.schoolAdmin) {
      setErrorMessage('School Admin accounts must be created by an existing administrator. Please select Student, Parent, or Teacher.');
      return;
    }

    const principal = identity.getPrincipal();
    const selectedSchoolId = schoolId ? BigInt(schoolId) : null;

    try {
      await createProfileMutation.mutateAsync({
        principal,
        name: name.trim(),
        email: email.trim(),
        role: role as MyUserRole,
        schoolId: selectedSchoolId,
        groupId: null,
      });
      // Success - the query invalidation will trigger profile refetch
      // and AppShell will automatically navigate to the dashboard
    } catch (error: any) {
      console.error('Profile creation error:', error);
      
      // Use the error mapping helper to get the appropriate user-facing message
      const displayMessage = mapProfileCreationError(error);
      setErrorMessage(displayMessage);
    }
  };

  const isValid = name.trim() && email.trim() && role;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Tell us a bit about yourself to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={createProfileMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={createProfileMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <Select 
                value={role} 
                onValueChange={(value) => {
                  setRole(value as MyUserRole);
                  setErrorMessage('');
                }}
                disabled={createProfileMutation.isPending}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MyUserRole.student}>Student</SelectItem>
                  <SelectItem value={MyUserRole.parent}>Parent</SelectItem>
                  <SelectItem value={MyUserRole.teacher}>Teacher</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Note: School Admin accounts must be created by an existing administrator.
              </p>
            </div>

            {!schoolsLoading && schools && schools.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="school">School (Optional)</Label>
                <Select 
                  value={schoolId} 
                  onValueChange={setSchoolId}
                  disabled={createProfileMutation.isPending}
                >
                  <SelectTrigger id="school">
                    <SelectValue placeholder="Select your school" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {schools.map((school) => (
                      <SelectItem key={school.id.toString()} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              disabled={!isValid || createProfileMutation.isPending}
              className="w-full"
              size="lg"
            >
              {createProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
