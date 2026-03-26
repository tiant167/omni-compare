# Omni-Compare Documentation

Welcome to the Omni-Compare developer documentation. This knowledge base is structured to facilitate progressive disclosure—allowing developers and AI agents to quickly find relevant information without being overwhelmed.

## Directory Structure

### 🏗️ Architecture (`/docs/architecture`)
- [Agent Flow & Human-in-the-Loop](./architecture/agent-flow.md) - Explains the core ReAct loop, tool calling, and how we interrupt the LLM for human input.
- [Tech Stack](./architecture/tech-stack.md) - Overview of Next.js, Vercel AI SDK, and Gemini integration.

### 📝 Guidelines (`/docs/guidelines`)
- [AI SDK Rules](./guidelines/ai-sdk-rules.md) - Best practices and patterns for using Vercel AI SDK v3+.
- [Coding Standards](./guidelines/coding-standards.md) - Project-specific TypeScript, React, and Tailwind conventions.

### ⚠️ Precautions (`/docs/precautions`)
- [Known Issues & Gotchas](./precautions/known-issues.md) - Common pitfalls, such as AI SDK stream response format errors, `useChat` state management, and Next.js strictness errors you might encounter.
