# Technology Stack

Omni-Compare is built on a modern, React-based full-stack architecture tailored for AI Agent execution.

## Core Framework
- **Next.js (App Router):** Provides the React frontend and fast, serverless backend API routes (`app/api/...`) that execute the secure LLM logic.
- **React & Tailwind CSS:** Drives the user interface, incorporating responsive layouts and Lucide icons for visual affordances.

## AI Infrastructure
- **Gemini (`gemini-3.1-pro-preview`):** Acts as the central brain ("Agent") for reasoning, tool utilization, and comparison analysis.
- **Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/react`):** Handles the complex data stream protocol between the server and client, allowing real-time text streaming and seamless Client/Server tool execution parsing.
