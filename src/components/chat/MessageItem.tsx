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
        {message.content && (
          <div className={clsx("px-5 py-3.5 whitespace-pre-wrap text-[15px] leading-relaxed shadow-sm", 
            isUser ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" : "bg-white border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-2xl rounded-tl-sm")}>
            {message.content}
          </div>
        )}

        {message.toolInvocations?.map((tool: any) => (
          <div key={tool.toolCallId} className="w-full flex justify-start">
            {tool.toolName === 'webSearch' && (
              <div className="mt-3 flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700 shadow-sm max-w-[24rem]">
                <Search className={clsx("w-4 h-4 mt-0.5 shrink-0 transition-colors", tool.state === 'call' ? "text-blue-500 animate-pulse" : "text-slate-400")} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-700 dark:text-slate-200">
                    {tool.state === 'call' ? 'Searching web...' : 'Searched web'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate border-l-2 pl-2 border-slate-300 dark:border-slate-600">
                    "{tool.args?.query}"
                  </div>
                </div>
                {tool.state === 'result' && <CheckCircle2 className="w-4 h-4 ml-auto text-green-500 mt-0.5 shrink-0" />}
              </div>
            )}
            
            {tool.toolName === 'askUserForPreference' && (
              <div className="w-full">
                {tool.state === 'call' ? (
                  <HumanInteractionForm 
                    question={tool.args.question} 
                    options={tool.args.options} 
                    onSubmit={(result) => addToolResult({ toolCallId: tool.toolCallId, result })} 
                  />
                ) : (
                  <div className="mt-3 flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl dark:bg-blue-900/20 dark:border-blue-800 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-400 mb-1">Your response</div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">"{tool.result?.answer}"</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
