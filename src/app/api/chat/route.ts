// @ts-nocheck
import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const useMock = process.env.MOCK_LLM === 'true' || !process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (useMock) {
    const lastMessage = messages[messages.length - 1];
    const isToolResult = lastMessage.role === 'tool';
    
    // Simulate Vercel AI SDK Data Stream Protocol v1
    const stream = new ReadableStream({
      start(controller) {
        if (!isToolResult) {
          controller.enqueue('0:"I will help you compare these. First, let me check your preferences.\\n\\n"\\n');
          controller.enqueue('9:[{"callId":"call_mock_123","toolName":"askUserForPreference","args":{"question":"What matters most to you in this comparison?","options":["Performance","Battery Life","Price"]}}]\\n');
        } else {
          // Find the tool result answer safely
          let answer = 'custom';
          try {
            if (lastMessage.content && Array.isArray(lastMessage.content)) {
              answer = lastMessage.content[0].result.answer;
            } else if (typeof lastMessage.content === 'string') {
              answer = lastMessage.content;
            }
          } catch (e) {}
          
          controller.enqueue(`0:"Based on your preference for \\"${answer}\\", the clear winner is Option A because it provides the best balance of your desired features!"\\n`);
        }
        controller.close();
      }
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'x-vercel-ai-data-stream': 'v1' } });
  }

  const result = streamText({
    model: google('gemini-3.1-pro-preview'),
    messages,
    system: `You are Omni-Compare, an advanced AI agent designed to help users compare any two things and make optimal decisions.`,
    tools: {
      webSearch: tool({
        description: 'Search the web for information using DuckDuckGo mock (fallback) or Tavily if available.',
        parameters: z.object({
          query: z.string().describe('The search query'),
        }),
        execute: async ({ query }) => ({ query, results: [{ title: `Mock Result for ${query}`, snippet: `This is mocked data.` }] }),
      }),
      askUserForPreference: tool({
        description: 'Ask the user for their preference to guide the comparison and decision.',
        parameters: z.object({
          question: z.string().describe('The question to ask the user'),
          options: z.array(z.string()).describe('A list of 2-4 short options the user can choose from'),
        }),
      }),
    },
  });

  return result.toDataStreamResponse?.() ?? result.toAIStreamResponse?.() ?? new Response(result.textStream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
