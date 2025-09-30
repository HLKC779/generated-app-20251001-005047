import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useFileTreeStore } from '@/stores/useFileTreeStore';
import { FileNode } from '@/lib/types';
import { FilePlus, FolderPlus, Edit, Trash2 } from 'lucide-react';
interface FileContextMenuProps {
  node: FileNode;
  children: React.ReactNode;
}
export function FileContextMenu({ node, children }: FileContextMenuProps) {
  const { setRenamingNodeId, deleteNode, setCreatingNodeType } = useFileTreeStore();
  const handleNewFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCreatingNodeType({ parentId: node.id, type: 'file' });
  };
  const handleNewFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCreatingNodeType({ parentId: node.id, type: 'folder' });
  };
  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingNodeId(node.id);
  };
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${node.name}"?`)) {
      deleteNode(node.id);
    }
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent onContextMenu={(e) => e.stopPropagation()}>
        {node.type === 'folder' && (
          <>
            <ContextMenuItem onClick={handleNewFile} className="gap-2">
              <FilePlus className="h-4 w-4" /> New File
            </ContextMenuItem>
            <ContextMenuItem onClick={handleNewFolder} className="gap-2">
              <FolderPlus className="h-4 w-4" /> New Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onClick={handleRename} className="gap-2">
          <Edit className="h-4 w-4" /> Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="gap-2 text-red-500 focus:text-red-500">
          <Trash2 className="h-4 w-4" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}