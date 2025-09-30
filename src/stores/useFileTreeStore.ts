import { create } from 'zustand';
import * as Y from 'yjs';
import { FileNode, FileTreeStore } from '@/lib/types';
export const useFileTreeStore = create<FileTreeStore>((set, get) => ({
  openFileIds: [],
  activeFileId: null,
  setActiveFileId: (fileId) => set({ activeFileId: fileId }),
  openFile: (fileId) => {
    set((state) => {
      if (!state.openFileIds.includes(fileId)) {
        return {
          openFileIds: [...state.openFileIds, fileId],
          activeFileId: fileId,
        };
      }
      return { activeFileId: fileId };
    });
  },
  closeFile: (fileId) => {
    set((state) => {
      const newOpenFileIds = state.openFileIds.filter((id) => id !== fileId);
      let newActiveFileId = state.activeFileId;
      if (state.activeFileId === fileId) {
        const closingIndex = state.openFileIds.indexOf(fileId);
        if (newOpenFileIds.length > 0) {
          // Select the next tab, or the previous one if it was the last tab
          newActiveFileId = newOpenFileIds[Math.min(closingIndex, newOpenFileIds.length - 1)];
        } else {
          newActiveFileId = null;
        }
      }
      return {
        openFileIds: newOpenFileIds,
        activeFileId: newActiveFileId,
      };
    });
  },
  files: [],
  setFiles: (files) => set({ files }),
  renamingNodeId: null,
  setRenamingNodeId: (nodeId) => set({ renamingNodeId: nodeId }),
  creatingNodeType: null,
  setCreatingNodeType: (node) => set({ creatingNodeType: node }),
  yDoc: null,
  setYDoc: (doc) => set({ yDoc: doc }),
  yFiles: null,
  setYFiles: (files) => set({ yFiles: files }),
  addNode: (name, type, parentId) => {
    const { yDoc, yFiles } = get();
    if (!yDoc || !yFiles) return;
    const fileId = crypto.randomUUID();
    const newNode: FileNode = {
      id: fileId,
      name,
      type,
      parentId,
      content: type === 'file' ? `// ${name}\n` : undefined,
    };
    yDoc.transact(() => {
      yFiles.set(fileId, newNode);
      if (type === 'file') {
        yDoc.getText(fileId).insert(0, newNode.content || '');
      }
    });
  },
  deleteNode: (nodeId) => {
    const { yDoc, yFiles, activeFileId, setActiveFileId, closeFile } = get();
    if (!yDoc || !yFiles) return;
    const nodesToDelete = new Set<string>([nodeId]);
    const findChildrenRecursive = (id: string) => {
      for (const [key, node] of yFiles.entries()) {
        if (node.parentId === id) {
          nodesToDelete.add(key);
          if (node.type === 'folder') {
            findChildrenRecursive(key);
          }
        }
      }
    };
    findChildrenRecursive(nodeId);
    yDoc.transact(() => {
      nodesToDelete.forEach((id) => {
        yFiles.delete(id);
        if (yDoc.getText(id).length > 0) {
          yDoc.getText(id).delete(0, yDoc.getText(id).length);
        }
      });
    });
    nodesToDelete.forEach(id => closeFile(id));
    if (nodesToDelete.has(activeFileId!)) {
      setActiveFileId(null);
    }
  },
  renameNode: (nodeId, newName) => {
    const { yFiles } = get();
    if (!yFiles) return;
    const node = yFiles.get(nodeId);
    if (node) {
      yFiles.set(nodeId, { ...node, name: newName });
    }
  },
}));