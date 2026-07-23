# Gemini & Genkit Integration

## Architectural Patterns
- **Server-Side Only**: All Genkit flows and Gemini API calls must be executed in a server-side context (`'use server'` or API routes).
- **Genkit Flows**: Prefer `ai.defineFlow` for orchestrating complex AI interactions.
- **Typed Outputs**: Always use Zod schemas for structured outputs to ensure reliability.

## Prompt Management
- Current prompts are defined in `src/ai/flows/`. 
- For complex prompts, consider extracting them to a dedicated directory if they exceed 50 lines.

## Guidelines
- **Input Validation**: Strictly validate all user inputs before passing them to prompts.
- **Error Handling**: Gracefully handle model timeouts or blocked content.
