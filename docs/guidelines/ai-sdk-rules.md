# AI SDK Rules

To maintain stability and predictability using the Vercel AI SDK, adhere to these guidelines:

1. **Import Origins:** 
   - Core Server utilities (`streamText`, `tool`) MUST be imported from the `ai` package.
   - Core React hooks (`useChat`) MUST be imported from `@ai-sdk/react`.
   - Providers MUST be imported from their specific packages (e.g., `@ai-sdk/google`).

2. **React State vs SDK State (v3+):**
   - **Crucial:** The `useChat` hook in the newest AI SDK iterations does not reliably expose the raw `input` string or its handlers (`handleInputChange`, `handleSubmit`) directly inside its return type.
   - **Rule:** Always manage the user input field using a standard React `useState('')` hook. Use the SDK's `append` or `sendMessage` method to dispatch the input to the agent to avoid UI component crashes.

3. **Tool Resolution Context:**
   - **Server-Side Tools:** E.g., `webSearch`. These tools must define an `execute: async ({ args }) => ...` function. The SDK automatically resolves them.
   - **Client-Side Tools (Human-in-the-Loop):** E.g., `askUserForPreference`. These tools MUST NOT define an `execute` function on the server. The client intercepts these and must resolve them via `addToolResult({ toolCallId, result })`.
