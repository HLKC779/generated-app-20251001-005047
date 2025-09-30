import { useState, useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { Folder, File, ChevronRight, ChevronDown, Plus, FolderPlus } from 'lucide-react';
import { FileNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useFileTreeStore } from '@/stores/useFileTreeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileContextMenu } from './FileContextMenu';
const FileOrFolder = ({ node, level = 0 }: { node: FileNode; level?: number }) => {
  const { activeFileId, openFile, renamingNodeId, setRenamingNodeId, renameNode } = useFileTreeStore();
  const [isOpen, setIsOpen] = useState(level === 0);
  const [renameValue, setRenameValue] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFolder = node.type === 'folder';
  const isActive = node.id === activeFileId;
  const isRenaming = node.id === renamingNodeId;
  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);
  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      openFile(node.id);
    }
  };
  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      renameNode(node.id, renameValue.trim());
    }
    setRenamingNodeId(null);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') setRenamingNodeId(null);
  };
  return (
    <FileContextMenu node={node}>
      <div>
        <div
          className={cn(
            'flex items-center py-1.5 px-2 rounded-md cursor-pointer text-sm transition-colors',
            'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
            isActive && 'bg-indigo-100 text-indigo-700 dark:bg-slate-800 dark:text-indigo-400'
          )}
          style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
          onClick={handleToggle}
        >
          {isFolder ? (
            isOpen ? (
              <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
            )
          ) : (
            <div className="w-4 mr-2" />
          )}
          {isFolder ? (
            <Folder className={cn('h-4 w-4 mr-2 flex-shrink-0', isOpen ? 'text-indigo-500' : 'text-slate-500')} />
          ) : (
            <File className="h-4 w-4 mr-2 flex-shrink-0 text-slate-500" />
          )}
          {isRenaming ? (
            <Input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              className="h-6 px-1 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate">{node.name}</span>
          )}
        </div>
        {isFolder && isOpen && node.children && (
          <div>
            {node.children.map((child) => (
              <FileOrFolder key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    </FileContextMenu>
  );
};
export function FileTree({ yDoc, yFiles }: { yDoc: Y.Doc | null; yFiles: Y.Map<any> | null }) {
  const { files, setFiles, addNode, creatingNodeType, setCreatingNodeType } = useFileTreeStore();
  const [newNodeName, setNewNodeName] = useState('');
  const newNodeInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!yFiles) return;
    const updateFiles = () => {
      const fileMap = yFiles.toJSON();
      const nodes = Object.values(fileMap);
      const tree = nodes.filter(n => !n.parentId);
      const findChildren = (node: FileNode) => {
        node.children = nodes.filter(n => n.parentId === node.id);
        node.children.forEach(findChildren);
      };
      tree.forEach(findChildren);
      setFiles(tree);
    };
    yFiles.observeDeep(updateFiles);
    updateFiles();
    return () => {
      yFiles.unobserveDeep(updateFiles);
    };
  }, [yFiles, setFiles]);
  useEffect(() => {
    if (creatingNodeType) {
      newNodeInputRef.current?.focus();
    }
  }, [creatingNodeType]);
  const handleCreateNode = () => {
    if (!newNodeName.trim() || !creatingNodeType) return;
    addNode(newNodeName.trim(), creatingNodeType.type, creatingNodeType.parentId);
    setCreatingNodeType(null);
    setNewNodeName('');
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCreateNode();
    if (e.key === 'Escape') {
      setCreatingNodeType(null);
      setNewNodeName('');
    }
  };
  const renderNewNodeInput = (level: number) => {
    if (!creatingNodeType) return null;
    return (
      <div className="flex items-center py-1.5 px-2" style={{ paddingLeft: `${level * 1 + 0.5}rem` }}>
        {creatingNodeType.type === 'folder' ? <Folder className="h-4 w-4 mr-2 flex-shrink-0 text-slate-500" /> : <File className="h-4 w-4 mr-2 flex-shrink-0 text-slate-500" />}
        <Input
          ref={newNodeInputRef}
          value={newNodeName}
          onChange={(e) => setNewNodeName(e.target.value)}
          onBlur={handleCreateNode}
          onKeyDown={handleKeyDown}
          className="h-6 px-1 text-sm"
          placeholder={creatingNodeType.type === 'file' ? 'new-file.js' : 'new-folder'}
        />
      </div>
    );
  };
  return (
    <div className="h-full w-full bg-white p-2 dark:bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-xs font-semibold uppercase text-slate-500">Explorer</h3>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCreatingNodeType({ parentId: null, type: 'file' })}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCreatingNodeType({ parentId: null, type: 'folder' })}>
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-0.5 flex-1 overflow-y-auto">
        {files.map((node) => (
          <FileOrFolder key={node.id} node={node} />
        ))}
        {creatingNodeType && creatingNodeType.parentId === null && renderNewNodeInput(0)}
      </div>
    </div>
  );
}