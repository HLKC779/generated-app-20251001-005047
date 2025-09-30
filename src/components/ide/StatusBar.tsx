import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
interface StatusBarProps {
  connectionStatus: 'connected' | 'disconnected';
  activeFile: string | null;
}
export function StatusBar({ connectionStatus, activeFile }: StatusBarProps) {
  const isConnected = connectionStatus === 'connected';
  return (
    <div className="flex h-6 items-center justify-between bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>{activeFile || 'No file selected'}</span>
        <span>UTF-8</span>
        <span>Spaces: 2</span>
      </div>
    </div>
  );
}