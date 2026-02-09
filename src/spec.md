# Specification

## Summary
**Goal:** Fix Student Dashboard quick-action navigation so “AI Tutor” and “Exam Generator” tiles open their respective in-app pages.

**Planned changes:**
- Wire the Student Dashboard “AI Tutor” and “Exam Generator” quick-action card click/activation handlers to AppShell’s existing in-app navigation state (e.g., `setCurrentPage`), so they navigate to Tutor and Exam Generator views.
- Update AppShell to pass a navigation handler into `StudentDashboardPage` while keeping existing Parent Dashboard behavior and Header navigation unchanged.
- Ensure the quick-action cards are implemented as accessible interactive elements (or support keyboard activation via Enter/Space) while remaining visually clickable.

**User-visible outcome:** When logged in as a student, clicking (or keyboard-activating) the “AI Tutor” or “Exam Generator” quick-action card on the Student Dashboard opens the same Tutor or Exam Generator page as selecting those items from the header.
