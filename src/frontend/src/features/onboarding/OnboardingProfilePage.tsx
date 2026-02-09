/**
 * Onboarding page for new users to set up their profile.
 * Collects display name, role, and school/group context.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, GraduationCap } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { MyUserRole } from '../../backend';
import { useCreateUserProfile } from './useCreateUserProfile';
import { useGetSchools } from './useGetSchools';

export function OnboardingProfilePage() {
  const { identity } = useInternetIdentity();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MyUserRole | ''>('');
  const [schoolId, setSchoolId] = useState<string>('');

  const createProfileMutation = useCreateUserProfile();
  const { data: schools, isLoading: schoolsLoading } = useGetSchools();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !role || !identity) {
      return;
    }

    const principal = identity.getPrincipal();
    const selectedSchoolId = schoolId ? BigInt(schoolId) : null;

    createProfileMutation.mutate({
      principal,
      name: name.trim(),
      email: email.trim(),
      role: role as MyUserRole,
      schoolId: selectedSchoolId,
      groupId: null,
    });
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
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <Select value={role} onValueChange={(value) => setRole(value as MyUserRole)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MyUserRole.student}>Student</SelectItem>
                  <SelectItem value={MyUserRole.parent}>Parent</SelectItem>
                  <SelectItem value={MyUserRole.teacher}>Teacher</SelectItem>
                  <SelectItem value={MyUserRole.schoolAdmin}>School Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!schoolsLoading && schools && schools.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="school">School (Optional)</Label>
                <Select value={schoolId} onValueChange={setSchoolId}>
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
