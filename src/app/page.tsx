// @ts-nocheck
'use client';

import { useChat } from '@ai-sdk/react';
import { Bot, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MessageItem } from '@/components/chat/MessageItem';

export default function Chat() {
  const [input, setInput] = useState('');
  const chatContext = useChat({
    api: '/api/chat',
    maxSteps: 5,
  });
  
  const { messages, addToolResult, isLoading, error, append, sendMessage } = chatContext as any;

  const handleInputChange = (e: any) => setInput(e.target.value);
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const sendFn = append || sendMessage;
    if (sendFn) {
      sendFn({ role: 'user', content: input });
    } else {
       console.error('No append or sendMessage found in useChat!');
    }
    setInput('');
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if any tool is currently waiting for user interaction
  const requiresInteraction = messages.some(
    (m: any) => m.toolInvocations?.some((tool: any) => tool.toolName === 'askUserForPreference' && tool.state === 'call')
  );

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-900 font-sans">
      <header className="mb-6 flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          Omni-Compare
        </div>
        <p className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          Agentic AI Engine
        </p>
      </header>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong>Error: </strong> {error.message || JSON.stringify(error)}
        </div>
      )}
      
      <pre className="p-2 text-xs bg-gray-900 text-green-400 overflow-x-auto break-all w-full max-h-40 overflow-y-auto">{JSON.stringify(messages, null, 2)}</pre>
      <div className="flex-1 overflow-y-auto mb-6 pr-2 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center space-y-6 p-8">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-800">
              <Bot className="w-10 h-10 text-blue-500 opacity-80" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">What would you like to compare?</h2>
            <p className="text-slate-500 max-w-md text-lg leading-relaxed">
              Enter any two products, concepts, or places. I'll analyze them using live web data and help you make the best decision.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <span className="text-xs bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 shadow-sm">Macbook M3 vs XPS 15</span>
              <span className="text-xs bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 shadow-sm">React vs Vue</span>
              <span className="text-xs bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 shadow-sm">Tesla Model 3 vs Polestar 2</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {messages.map((m) => (
              <MessageItem key={m.id} message={m} addToolResult={addToolResult} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex relative items-center shadow-lg rounded-xl">
        <input
          className="w-full h-14 pl-6 pr-14 rounded-xl border border-slate-200 text-base dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-400 dark:disabled:bg-slate-900"
          value={input || ''}
          placeholder={requiresInteraction ? "Please answer the AI's question above..." : "Compare Macbook Pro M3 and XPS 15..."}
          onChange={handleInputChange}
          disabled={requiresInteraction || isLoading}
        />
        <button 
          type="submit"
          disabled={requiresInteraction || isLoading || !(input || '').trim()}
          className="absolute right-2 p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:hover:bg-blue-500"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </form>
    </div>
  );
}
