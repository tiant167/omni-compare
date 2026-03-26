# Precautions & Known Issues

## 1. AI API Stream Resolution Protocol
The Vercel AI SDK stream requires highly specific payload formats to correctly stitch data onto the client.
- **Protocol Markers:** Text chunks must be prefixed with `0:` and a quote block. Tool calls must be prefixed with `9:`.
- **Custom Mocks:** If building mock models or manually sending streaming headers, ensure `headers: { 'x-vercel-ai-data-stream': 'v1' }` is present to prevent frontend misparsing. Use fallback methods like `return result.toDataStreamResponse?.() ?? result.toAIStreamResponse?.()` since SDK version types evolve.

## 2. Directory Operations While Running
**Do not** execute sweeping directory restructuring (`mv`, `rm -rf`) on core paths like `app/` or `src/` while the Next.js `npm run dev` server is active. Turbopack will lose filesystem context and crash gracefully with `ENOENT` scandir errors. Terminate and restart the server if you must move files.

## 3. Human-in-the-Loop Interruption Blockers
If a tool requires client-side resolution (e.g., answering a question), the AI Agent essentially **pauses**.
- **Gotcha:** If the user refreshes the page mid-pause, or the application loses connection state, that tool invocation chain is orphaned. Ensure any long-term session history caches these states correctly if implementing database retrieval.
