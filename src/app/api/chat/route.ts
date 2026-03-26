// @ts-nocheck
import { streamText, tool, convertToModelMessages } from 'ai';
import { tavily } from '@tavily/core';

// Initialize Tavily client
const tvly = process.env.TAVILY_API_KEY ? tavily({ apiKey: process.env.TAVILY_API_KEY }) : null;

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
        controller.enqueue('data: {"type":"start","messageId":"msg_mock"}\n\n');
        if (!isToolResult) {
          controller.enqueue('data: {"type":"text-start","id":"txt1"}\n\n');
          controller.enqueue('data: {"type":"text-delta","id":"txt1","delta":"I will help you compare these. First, let me check your preferences.\\n\\n"}\n\n');
          controller.enqueue('data: {"type":"text-end","id":"txt1"}\n\n');
          controller.enqueue('data: {"type":"tool-input-start","toolCallId":"call_mock_123","toolName":"askUserForPreference"}\n\n');
          controller.enqueue('data: {"type":"tool-input-available","toolCallId":"call_mock_123","toolName":"askUserForPreference","input":{"question":"What matters most to you in this comparison?","options":["Performance","Battery Life","Price"]}}\n\n');
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
          
          controller.enqueue(`data: {"type":"text-start","id":"txt2"}\n\n`);
          controller.enqueue(`data: {"type":"text-delta","id":"txt2","delta":"Based on your preference for ${answer}, the clear winner is Option A because it provides the best balance of your desired features!"}\n\n`);
          controller.enqueue(`data: {"type":"text-end","id":"txt2"}\n\n`);
        }
        controller.enqueue(`data: {"type":"finish"}\n\n`);
        controller.close();
      }
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'x-vercel-ai-ui-message-stream': 'v1' } });
  }

  const result = streamText({
    model: google('gemini-3.1-pro-preview'),
    messages,
    system: `You are Omni-Compare, an advanced AI agent designed to help users compare any two things and make optimal decisions.`,
    tools: {
      webSearch: tool({
        description: 'Search the web for up-to-date information.',
        parameters: z.object({
          query: z.string().describe('The search query'),
        }),
        execute: async ({ query }) => {
          if (!tvly) {
            console.warn('TAVILY_API_KEY is not set. Using mock search results.');
            return { query, results: [{ title: `Mock Result for ${query}`, snippet: `This is mocked data. Please configure TAVILY_API_KEY for live web results.` }] };
          }
          
          try {
            console.log(`[Tavily] Searching for: ${query}`);
            const response = await tvly.search(query, {
              searchDepth: 'basic',
              maxResults: 5,
            });
            return { query, results: response.results };
          } catch (error) {
            console.error('Tavily search error:', error);
            return { query, error: 'Web search failed. Proceed with general knowledge.' };
          }
        },
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

  // @ts-ignore
  return result.toUIMessageStreamResponse?.() ?? result.toDataStreamResponse?.();
}
