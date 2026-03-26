// @ts-nocheck
import { Message } from 'ai';
import { User, Bot, Search, CheckCircle2 } from 'lucide-react';
import { HumanInteractionForm } from './HumanInteractionForm';
import { clsx } from 'clsx';

export function MessageItem({ message, addToolResult }: { message: Message, addToolResult: (args: { toolCallId: string, result: any }) => void }) {
  const isUser = message.role === 'user';

  return (
    <div className={clsx("flex gap-4 w-full", isUser ? "flex-row-reverse" : "")}>
      <div className={clsx("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm", 
        isUser ? "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300" : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300")}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      
      <div className={clsx("flex flex-col max-w-[85%]", isUser ? "items-end" : "items-start")}>
        {/* Fallback to text content for older messages or simple string inputs */}
        {(!message.parts || message.parts.length === 0) && message.content && (
          <div className={clsx("px-5 py-3.5 whitespace-pre-wrap text-[15px] leading-relaxed shadow-sm", 
            isUser ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" : "bg-white border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-2xl rounded-tl-sm")}>
            {message.content}
          </div>
        )}

        {/* AI SDK v6 Multi-part Message Rendering */}
        {message.parts?.map((part: any, index: number) => {
          if (part.type === 'text') {
            return (
              <div key={`${message.id}-${index}`} className={clsx("px-5 py-3.5 whitespace-pre-wrap text-[15px] leading-relaxed shadow-sm", 
                isUser ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" : "bg-white border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-2xl rounded-tl-sm",
                index > 0 ? "mt-3" : ""
              )}>
                {part.text}
              </div>
            );
          }

          const isToolCall = part.type.includes('tool') || part.toolInvocation;
          if (isToolCall) {
            // Robust polymorphic structure handler for @ai-sdk/react@4.0.0-beta handling args vs input
            const rawTool = part.toolInvocation || part;
            const toolName = rawTool.toolName || (part.type.startsWith('tool-') && !part.type.includes('call') ? part.type.replace('tool-', '') : 'unknown');
            const args = rawTool.args || rawTool.input || {};
            const state = rawTool.state === 'call' || rawTool.state === 'input-available' || !rawTool.result ? 'call' : 'result';
            const result = rawTool.result || rawTool.output;
            
            return (
              <div key={rawTool.toolCallId || index} className="w-full flex justify-start mt-3">
                {toolName === 'webSearch' && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 shadow-sm max-w-[24rem]">
                    <Search className={clsx("w-4 h-4 mt-0.5 shrink-0 transition-colors", state === 'call' ? "text-blue-500 animate-pulse" : "text-slate-400")} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-700 dark:text-slate-200">
                        {state === 'call' ? 'Searching web...' : 'Searched web'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate border-l-2 pl-2 border-slate-300 dark:border-slate-600">
                        "{args?.query}"
                      </div>
                    </div>
                    {state === 'result' && <CheckCircle2 className="w-4 h-4 ml-auto text-green-500 mt-0.5 shrink-0" />}
                  </div>
                )}
                
                {toolName === 'askUserForPreference' && (
                  <div className="w-full">
                    {state === 'call' ? (
                      <HumanInteractionForm 
                        question={args?.question} 
                        options={args?.options} 
                        onSubmit={(userResult) => addToolResult({ toolCallId: rawTool.toolCallId, result: userResult })} 
                      />
                    ) : (
                      <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl dark:bg-blue-900/20 dark:border-blue-800 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-400 mb-1">Your response</div>
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">"{result?.answer}"</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
