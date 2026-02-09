# Specification

## Summary
**Goal:** Fix onboarding profile creation so authenticated users can self-create non-admin profiles, and add duplicate-email validation with correct UI error messaging.

**Planned changes:**
- Update backend authorization logic so an authenticated Internet Identity user can create their own Student/Parent/Teacher profile (principal == caller) without hitting a permission error.
- Ensure backend rejects anonymous/unauthenticated profile creation with a clear authentication-required error.
- Keep School Admin self-service profile creation disallowed unless explicitly authorized.
- Add backend email uniqueness validation during profile creation (case-insensitive, trims whitespace) and reject duplicates with the exact error text: "Email already registered".
- Update onboarding UI error handling to display "Email already registered" when returned by the backend, and avoid showing the generic permission error for other failure reasons.
- Preserve current post-success behavior: refetch/invalidate `['currentUserProfile']` and proceed to the correct dashboard without manual refresh.

**User-visible outcome:** Logged-in users can successfully create Student/Parent/Teacher profiles during onboarding; attempts to reuse an email show "Email already registered"; School Admin self-signup remains blocked; and onboarding error messages are accurate to the underlying failure.
