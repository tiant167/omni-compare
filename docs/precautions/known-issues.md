# Precautions & Known Issues

## 1. AI API Stream Resolution Protocol
The Vercel AI SDK 6.0 stream uses a structured SSE (Server-Sent Events) JSON protocol.
- **Protocol Markers:** Text chunks and tool calls are no longer prefixed with simple numbers like `0:` or `9:`. They are now JSON packets (e.g., `{"type":"text-delta"}`).
- **Custom Mocks:** If building mock models, ensure you send **all required SSE chunks** (type `start`, `text-start`, etc.) and set the header `x-vercel-ai-ui-message-stream: v1` to prevent logic failure in `useChat`. Use `result.toUIMessageStreamResponse()` for official implementations.

## 2. Directory Operations While Running
**Do not** execute sweeping directory restructuring (`mv`, `rm -rf`) on core paths like `app/` or `src/` while the Next.js `npm run dev` server is active. Turbopack will lose filesystem context and crash gracefully with `ENOENT` scandir errors. Terminate and restart the server if you must move files.

## 3. Human-in-the-Loop Interruption Blockers
If a tool requires client-side resolution (e.g., answering a question), the AI Agent essentially **pauses**.
- **Gotcha:** If the user refreshes the page mid-pause, or the application loses connection state, that tool invocation chain is orphaned. Ensure any long-term session history caches these states correctly if implementing database retrieval.
