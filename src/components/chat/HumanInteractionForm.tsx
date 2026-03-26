import { useState } from 'react';
import { HelpCircle, Send } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  question: string;
  options: string[];
  onSubmit: (result: { answer: string }) => void;
}

export function HumanInteractionForm({ question, options, onSubmit }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const finalAnswer = selected === 'custom' ? customInput : selected;
    if (finalAnswer && finalAnswer.trim()) {
      onSubmit({ answer: finalAnswer.trim() });
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border-2 border-blue-500 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl dark:bg-slate-800 dark:border-blue-400 w-[28rem] max-w-full my-4">
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-1">
        <HelpCircle className="w-5 h-5" />
        Question for You
      </div>
      <p className="text-slate-800 dark:text-slate-200 font-medium mb-2 leading-snug">{question}</p>
      
      <div className="flex flex-col gap-2">
        {options?.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(opt)}
            className={clsx(
              "text-left px-4 py-3 rounded-lg border transition-all duration-200 leading-snug",
              selected === opt 
                ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-200 shadow-sm" 
                : "bg-transparent border-slate-200 hover:border-blue-300 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500"
            )}
          >
            {opt}
          </button>
        ))}
        
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Or type your own preference..."
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              setSelected('custom');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            className={clsx(
              "w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none transition-all dark:bg-slate-900 dark:text-white",
              selected === 'custom'
                ? "border-blue-500 focus:ring-1 focus:ring-blue-500"
                : "border-slate-200 focus:border-blue-400 dark:border-slate-700"
            )}
          />
          <button 
            onClick={handleSubmit} 
            disabled={!selected || (selected === 'custom' && !customInput.trim())}
            className="absolute right-2 top-2 bottom-2 p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg disabled:opacity-30 dark:hover:bg-slate-800 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {selected && selected !== 'custom' && (
        <button 
          onClick={() => handleSubmit()}
          className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
        >
          Submit Response
        </button>
      )}
    </div>
  );
}
