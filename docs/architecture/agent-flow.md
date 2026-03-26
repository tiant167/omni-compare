# Agent Flow & Human-in-the-Loop

Omni-Compare uses an Agentic architecture powered by Gemini and the Vercel AI SDK.

## Core Execution Loop (ReAct)
1. **User Prompt:** The user provides an open-ended comparison request.
2. **System Prompt Injection:** The Agent is instructed to act as "Omni-Compare", evaluate the request, and determine if it needs more information to proceed.
3. **Tool Calling (Reasoning & Action):** The Agent uses tools to fetch live data (e.g., `webSearch`).

## Human-in-the-Loop (Dynamic Interruption)
When the LLM encounters a subjective decision point (e.g., determining which feature trade-off the user prefers), it dynamically triggers the `askUserForPreference` tool.

### How it Works:
1. The LLM signals a tool call for `askUserForPreference` with a dynamically generated question and options.
2. The server intercepts the execution and streams this tool call to the client via the SDK Generic Data Protocol.
3. The frontend `MessageItem` intercepts the `call` state and renders the `HumanInteractionForm`.
4. The main chat input is dynamically disabled to force the user to interact with the active form.
5. Upon submission, the frontend calls `addToolResult()`, appending the user's answer to the conversation and resuming the LLM's generation loop to output the final recommendation.
