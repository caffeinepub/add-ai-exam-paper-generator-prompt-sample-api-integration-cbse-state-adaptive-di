# LLM Demo Setup Instructions

This application uses a generic LLM API integration to power AI features including the Exam Generator and AI Tutor. To enable these features for client demos, you need to configure the LLM API credentials.

## Quick Setup

1. **Copy the environment template:**
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

2. **Set your API key:**
   Open `frontend/.env.local` and set your LLM API key:
   ```env
   VITE_LLM_API_KEY=your-actual-api-key-here
   ```

3. **Configure your provider (if not using OpenAI):**
   Set the appropriate base URL and model for your provider:
   ```env
   # For Gemini:
   VITE_LLM_API_URL=https://generativelanguage.googleapis.com/v1beta
   VITE_LLM_MODEL=gemini-1.5-pro
   
   # For OpenAI (default):
   VITE_LLM_API_URL=https://api.openai.com/v1
   VITE_LLM_MODEL=gpt-4
   ```

4. **Restart the development server:**
   ```bash
   npm run start
   ```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_LLM_API_KEY` | **Yes** | None | Your LLM API key |
| `VITE_LLM_API_URL` | No | `https://api.openai.com/v1` | Base URL for the LLM API |
| `VITE_LLM_MODEL` | No | `gpt-4` | Model identifier to use |

## Supported LLM Providers

The integration uses the OpenAI chat completions API format. You can configure different providers by setting the appropriate `VITE_LLM_API_URL` and `VITE_LLM_MODEL`:

### OpenAI
