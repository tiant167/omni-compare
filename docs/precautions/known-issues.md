# Precautions & Known Issues

## 1. AI API Stream Resolution Protocol
The Vercel AI SDK 6.0 stream uses a structured SSE (Server-Sent Events) JSON protocol.
- **Protocol Markers:** Text chunks and tool calls are no longer prefixed with simple numbers like `0:` or `9:`. They are now JSON packets (e.g., `{"type":"text-delta"}`).
- **Custom Mocks:** If building mock models, ensure you send **all required SSE chunks**### Vercel AI SDK 6.0 Tool-Result Chain Break

- **Issue:** The agent executes a tool (e.g., Web Search) but fails to generate a final response based on the search results.
- **Cause:** Manual message mapping in `route.ts` was likely missing the `role: 'tool'` (tool-result) case.
- **Fix:** Ensure the mapper explicitly converts `messages` with `role: 'tool'` into `CoreMessage` objects with `type: 'tool-result'` content parts.

### Gemini "Model Not Found" (404/v1beta)

- **Issue:** `Error: models/gemini-1.5-pro is not found for API version v1beta`.
- **Cause:** Incorrect model identifier for the current SDK version/API endpoint.
- **Fix:** Use `gemini-3.1-pro-preview` as the model string, as it is the most stable for agentic tasks in SDK 6.0.

## 2. Directory Operations While Running
**Do not** execute sweeping directory restructuring (`mv`, `rm -rf`) on core paths like `app/` or `src/` while the Next.js `npm run dev` server is active. Turbopack will lose filesystem context and crash gracefully with `ENOENT` scandir errors. Terminate and restart the server if you must move files.

## 3. Human-in-the-Loop Interruption Blockers
If a tool requires client-side resolution (e.g., answering a question), the AI Agent essentially **pauses**.
- **Gotcha:** If the user refreshes the page mid-pause, or the application loses connection state, that tool invocation chain is orphaned. Ensure any long-term session history caches these states correctly if implementing database retrieval.
