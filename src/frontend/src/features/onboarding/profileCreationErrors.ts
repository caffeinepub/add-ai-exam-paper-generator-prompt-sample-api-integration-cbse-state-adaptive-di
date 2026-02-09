/**
 * Helper module to map backend profile creation errors into user-facing messages.
 * Ensures exact error messages are displayed for specific cases like duplicate emails.
 */

export function mapProfileCreationError(error: any): string {
  if (!error?.message) {
    return 'Failed to create profile. Please try again.';
  }

  const errorMessage = error.message;

  // Check for exact "Email already registered" message first
  if (errorMessage.includes('Email already registered')) {
    return 'Email already registered';
  }

  // Check for profile already exists for this principal
  if (errorMessage.includes('Profile already exists')) {
    return 'A profile already exists for your account. Please refresh the page.';
  }

  // Check for authentication issues
  if (errorMessage.includes('Only authenticated users can create user profiles')) {
    return 'You must be logged in to create a profile. Please log in and try again.';
  }

  // Check for permission issues related to schoolAdmin role specifically
  if (errorMessage.includes('You do not have permission to create this type of profile')) {
    return 'You do not have permission to create this type of profile. Please contact an administrator.';
  }

  // Check for other authorization/permission errors (but not the specific schoolAdmin message)
  if (errorMessage.includes('Unauthorized') && errorMessage.includes('Can only create your own profile')) {
    return 'You can only create a profile for yourself.';
  }

  // Check for invalid data
  if (errorMessage.includes('Invalid')) {
    return 'Invalid profile information. Please check your inputs and try again.';
  }

  // For any other error, return the original message if it seems user-friendly
  // (doesn't contain technical jargon like "trap", "canister", etc.)
  const technicalTerms = ['trap', 'canister', 'actor', 'principal', 'candid'];
  const containsTechnicalTerms = technicalTerms.some(term => 
    errorMessage.toLowerCase().includes(term.toLowerCase())
  );

  if (!containsTechnicalTerms && errorMessage.length < 200) {
    return errorMessage;
  }

  // Fallback for technical or unclear errors
  return 'Failed to create profile. Please try again.';
}
