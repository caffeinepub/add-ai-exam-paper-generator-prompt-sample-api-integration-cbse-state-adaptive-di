# Specification

## Summary
**Goal:** Enable safe local testing of the Gemini integration by loading the API key from a developer-only environment file (not committed), and document the setup clearly in English.

**Planned changes:**
- Ensure the frontend reads the LLM API key from `VITE_LLM_API_KEY` via the existing env-based configuration path, intended for use in a non-committed local env file (e.g., `frontend/.env.local`).
- Preserve existing behavior when `VITE_LLM_API_KEY` is missing: show the current configuration error and do not attempt LLM calls.
- Update `LLM_DEMO_SETUP.md` with clear English instructions for local Gemini testing, including where to put the API key and how `VITE_LLM_API_URL` and `VITE_LLM_MODEL` control provider/model selection.
- Keep committed templates repo-safe (e.g., `frontend/.env.example` remains committed with no real API key populated) and ensure the provided key is not present in any source-controlled file.

**User-visible outcome:** Developers can locally test Gemini by placing their API key in a local-only env file; if not configured, the app continues to show the existing configuration error, and setup docs explain the required env vars without exposing secrets.
