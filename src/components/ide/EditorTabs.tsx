import { useFileTreeStore } from '@/stores/useFileTreeStore';
import { cn } from '@/lib/utils';
import { X, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileNode } from '@/lib/types';
import { useCallback } from 'react';
export function EditorTabs() {
  const { openFileIds, activeFileId, setActiveFileId, closeFile, files } = useFileTreeStore();
  const getFileById = useCallback((nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = getFileById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);
  if (openFileIds.length === 0) {
    return null;
  }
  return (
    <div className="flex items-center bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      {openFileIds.map((fileId) => {
        const file = getFileById(files, fileId);
        if (!file) return null;
        const isActive = fileId === activeFileId;
        return (
          <div
            key={fileId}
            onClick={() => setActiveFileId(fileId)}
            className={cn(
              'flex items-center gap-2 pl-3 pr-2 py-2 text-sm border-r border-slate-200 dark:border-slate-800 cursor-pointer transition-colors',
              isActive
                ? 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200'
                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
            )}
          >
            <File className="h-4 w-4" />
            <span className="truncate">{file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-sm"
              onClick={(e) => {
                e.stopPropagation();
                closeFile(fileId);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}