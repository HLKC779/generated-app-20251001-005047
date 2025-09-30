import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  Clipboard,
  Check,
  Code,
  AlertTriangle,
} from 'lucide-react';
import * as Y from 'yjs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { chatService, renderToolCall } from '@/lib/chat';
import type { ChatState, Message } from '../../../worker/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useFileTreeStore } from '@/stores/useFileTreeStore';
interface ChatPanelProps {
  yDoc: Y.Doc | null;
}
const parseMessageContent = (content: string) => {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part) => {
    const match = part.match(/```(\w*)\n([\s\S]*?)```/);
    if (match) {
      return { type: 'code' as const, content: match[2], language: match[1] };
    }
    return { type: 'text' as const, content: part };
  });
};
const CodeBlock = ({ code, yDoc }: { code: string; yDoc: Y.Doc | null }) => {
  const [copied, setCopied] = useState(false);
  const activeFileId = useFileTreeStore((state) => state.activeFileId);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleInsert = () => {
    if (yDoc && activeFileId) {
      const yText = yDoc.getText(activeFileId);
      // Replace the entire content of the editor with the new code.
      yText.delete(0, yText.length);
      yText.insert(0, code);
      toast.success('Code inserted into the active file.');
    } else {
      toast.error('No active file selected to insert code into.');
    }
  };
  return (
    <div className="bg-slate-900 rounded-md my-2 relative group">
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" onClick={handleInsert} disabled={!yDoc || !activeFileId}>
                <Code className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert into Editor</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Clipboard className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? 'Copied!' : 'Copy Code'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <pre className="p-4 text-sm text-slate-300 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};
const MessageContent = ({ message, yDoc }: { message: Message; yDoc: Y.Doc | null }) => {
  const contentParts = parseMessageContent(message.content);
  return (
    <>
      {contentParts.map((part, index) => (
        <Fragment key={index}>
          {part.type === 'text' ? (
            <p className="whitespace-pre-wrap">{part.content}</p>
          ) : (
            <CodeBlock code={part.content} yDoc={yDoc} />
          )}
        </Fragment>
      ))}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="mt-2 pt-2 border-t border-current/20 space-y-1">
          {message.toolCalls.map((tool, idx) => (
            <Badge
              key={idx}
              variant={message.role === 'user' ? 'secondary' : 'outline'}
              className="text-xs"
            >
              {renderToolCall(tool)}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
};
export function ChatPanel({ yDoc }: ChatPanelProps) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    sessionId: chatService.getSessionId(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    streamingMessage: '',
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadCurrentSession = useCallback(async () => {
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setChatState((prev) => ({
        ...prev,
        ...response.data,
        sessionId: chatService.getSessionId(),
      }));
    }
  }, []);
  useEffect(() => {
    loadCurrentSession();
  }, [loadCurrentSession]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages, chatState.streamingMessage]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    setIsLoading(true);
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: message,
      timestamp: Date.now(),
    };
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      streamingMessage: '',
    }));
    const response = await chatService.sendMessage(message, chatState.model, (chunk) => {
      setChatState((prev) => ({
        ...prev,
        streamingMessage: (prev.streamingMessage || '') + chunk,
      }));
    });
    if (response.success) {
      await loadCurrentSession();
    } else {
      const errorMessage = response.error || 'An unknown error occurred.';
      toast.error('AI Assistant Error', { description: errorMessage });
      setChatState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Error: ${errorMessage}\n\nPlease check the important notice about AI functionality. You may need to self-deploy with your own API keys.`,
            timestamp: Date.now(),
          },
        ],
        streamingMessage: '',
      }));
    }
    setIsLoading(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };
  const handleClear = async () => {
    await chatService.clearMessages();
    await loadCurrentSession();
  };
  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-950">
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-semibold">AI Assistant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClear} title="Clear conversation">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {chatState.messages.length === 0 && !chatState.streamingMessage && (
            <div className="text-center text-slate-500 py-8 text-sm">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Ask me anything to get started.</p>
            </div>
          )}
          {chatState.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex text-sm', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[90%] p-3 rounded-lg',
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : msg.content.startsWith('Error:')
                    ? 'bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200'
                    : 'bg-slate-100 dark:bg-slate-800'
                )}
              >
                {msg.content.startsWith('Error:') && (
                  <div className="flex items-center gap-2 mb-2 font-semibold">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Assistant Error</span>
                  </div>
                )}
                <MessageContent message={msg} yDoc={yDoc} />
              </div>
            </motion.div>
          ))}
          {chatState.streamingMessage && (
            <div className="flex justify-start text-sm">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg max-w-[90%]">
                <p className="whitespace-pre-wrap">
                  {chatState.streamingMessage}
                  <span className="animate-pulse">|</span>
                </p>
              </div>
            </div>
          )}
          {(isLoading || chatState.isProcessing) &&
            !chatState.streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to generate or modify code..."
            className="pr-12 text-sm"
            rows={1}
            disabled={isLoading || chatState.isProcessing}
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            disabled={!input.trim() || isLoading || chatState.isProcessing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-slate-400 mt-2 text-center">
          AI may produce inaccurate information.
        </p>
      </div>
    </div>
  );
}