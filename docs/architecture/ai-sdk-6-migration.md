# Vercel AI SDK 6.0 Migration Guide & Troubleshooting

This document summarizes the critical changes and traps encountered during the migration from AI SDK 3.x to 6.0 (specifically around the UI Message Stream protocol).

## 1. Protocol Shift: Data Stream vs. UI Message Stream

AI SDK 6.0 introduces a new, structured SSE protocol. Older versions used a simple prefixed string format (e.g., legacy prefixes), while 6.0 uses JSON-based chunks.

- **Old (Legacy):** (Legacy string-prefixed format)
- **New (v6):** `data: {"type":"text-delta","id":"...","delta":"Hello"}`

### The Trap
If your backend uses `result.toUIMessageStreamResponse()`, but your frontend `@ai-sdk/react` version is `< 4.0.0-beta` (or uses older `useChat` logic), the frontend will receive the data but **render nothing**. This is because the old `useChat` does not know how to parse the JSON `text-delta` chunks.

## 2. Mandatory Version Alignment

To use the new protocol, your `package.json` must align these specific (often beta) versions:

```json
{
  "dependencies": {
    "ai": "^4.0.0",
    "@ai-sdk/react": "^4.0.0-beta.42",
    "@ai-sdk/google": "^1.0.0"
  }
}
```
> [!IMPORTANT]
> Note that `@ai-sdk/react` versioning may not match `ai` package versioning. Check the official [migration guide](https://ai-sdk.dev/docs/migration-guides/migration-guide-6-0) for the latest compatible versions.

## 3. Frontend Rendering: From `content` to `parts`

In SDK 6.0, `message.content` is often empty or incomplete during streaming if the model generates complex multi-part responses (text + tool calls). You **must** iterate over `message.parts`.

### Polymorphic Rendering Pattern
Because different beta versions of the SDK might use slightly different property names (`args` vs `input`, `tool-invocation` vs `tool-call`), use a robust polymorphic renderer:

```tsx
{message.parts?.map((part, index) => {
  if (part.type === 'text') {
    return <div key={index}>{part.text}</div>;
  }

  // Handle various tool invocation shapes
  const tool = part.toolInvocation || part;
  if (part.type.includes('tool') || part.toolInvocation) {
    const args = tool.args || tool.input;
    const state = tool.state; // 'call' (old) or 'input-available' (new)
    // ... render your tool components
  }
})}
```

## 4. Manual Mocking SSE Format

If you need to mock the backend without an LLM (e.g., for UI testing), your `ReadableStream` must now emit the exact sequence of v6 chunks:

1. `data: {"type":"start","messageId":"..."}`
2. `data: {"type":"text-start","id":"..."}`
3. `data: {"type":"text-delta","id":"...","delta":"..."}`
4. `data: {"type":"text-end","id":"..."}`
5. `data: {"type":"finish"}`

> [!WARNING]
> Missing any of these steps (especially `type: start`) will cause `useChat` to ignore the stream entirely.

## 6. Model Naming & Provider Versioning (Google)

In SDK 6.0, model naming conventions for Google Generative AI are strict but often inconsistent across documentation. 

### The Gemini Trap
- **Recommended Model:** `gemini-3.1-pro-preview` is currently optimized for agentic and tool-calling workflows.
- **Common Error:** Using `gemini-1.5-pro` or `gemini-1.5-pro-latest` may result in `models/gemini-1.5-pro is not found for API version v1beta` errors if the provider is defaulting to a specific version.
- **Solution:** Always use the latest preview strings confirmed in the [Google Generative AI Documentation](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai#model-capabilities).

## 7. Critical: Manual Message Mapping for Tool Results

If using a manual mapping function for `CoreMessage` (mandatory in some beta versions of v6 to ensure stability), you **must** explicitly map the `role: 'tool'` (tool outputs).

### The Missing Chain Breakdown
If you only map `user` and `assistant` roles, the model will successfully call a tool (e.g., Search), but it will **never see the results** of that search. It will appear to "hang" or stop after the tool call.

```typescript
// Correct Mapping for Tool Results
if (msg.role === 'tool') {
  return {
    role: 'tool',
    content: msg.content.map(c => ({
      type: 'tool-result',
      toolCallId: c.toolCallId,
      toolName: c.toolName,
      result: c.result,
    })),
  };
}
```
