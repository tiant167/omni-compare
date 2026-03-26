export const mockModel: any = {
  specificationVersion: 'v3',
  provider: 'mock',
  modelId: 'mock-model',
  defaultObjectGenerationMode: 'json',
  
  async doGenerate() {
    return { 
      text: 'Mocked generate',
      finishReason: 'stop',
      usage: { promptTokens: 0, completionTokens: 0 },
      rawCall: { rawPrompt: null, rawSettings: {} }
    };
  },
  
  async doStream(options: any) {
    console.log('[Mock Model doStream args]:', Object.keys(options || {}));
    const messages = options?.prompt || options?.messages || [];
    const lastMessage = messages[messages.length - 1] || { role: 'user' };
    const isToolResult = lastMessage.role === 'tool';
    
    return {
      stream: new ReadableStream<any>({
        start(controller) {
          if (!isToolResult) {
            controller.enqueue({ type: 'text-delta', textDelta: 'I will help you compare these. First, let me check your preferences.\n\n' });
            controller.enqueue({
              type: 'tool-call-delta',
              toolCallType: 'function',
              toolCallId: 'call_mock_123',
              toolName: 'askUserForPreference',
              argsTextDelta: '{"question":"What matters most to you in this comparison?","options":["Performance","Battery Life","Price"]}'
            });
            controller.enqueue({ type: 'finish', finishReason: 'tool-calls', usage: { promptTokens: 0, completionTokens: 0 } });
          } else {
            // @ts-ignore
            const answer = lastMessage.content?.[0]?.result?.answer || 'custom';
            controller.enqueue({ type: 'text-delta', textDelta: `Based on your preference for "${answer}", the clear winner is Option A because it provides the best balance of your desired features!` });
            controller.enqueue({ type: 'finish', finishReason: 'stop', usage: { promptTokens: 0, completionTokens: 0 } });
          }
          controller.close();
        }
      }),
      rawCall: { rawPrompt: null, rawSettings: {} }
    };
  }
};
