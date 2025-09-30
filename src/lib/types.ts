import type { D1Database, R2Bucket, DurableObject, DurableObjectNamespace as CFDurableObjectNamespace } from '@cloudflare/workers-types';
import * as Y from 'yjs';
// Re-export the imported DurableObjectNamespace for use in the application.
export type { CFDurableObjectNamespace };
export interface Project {
  id: string;
  name: string;
  framework: 'React' | 'Vue' | 'Svelte' | 'Node';
  lastUpdated: string;
  thumbnailUrl: string;
  templateContent?: string;
}
export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}
export interface Template {
  id: string;
  name: string;
  description: string;
  tags: string[];
  author: string;
  avatarUrl: string;
  installs: number;
  framework: 'React' | 'Vue' | 'Svelte' | 'Node';
}
export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  parentId: string | null;
}
export interface Deployment {
  id: string;
  projectId: string;
  version: string;
  status: 'Success' | 'Building' | 'Failed';
  deployedAt: string;
  url: string;
  commit: string;
}
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Owner' | 'Admin' | 'Developer';
}
export interface Plan {
  name: string;
  price: string;
  features: string[];
}
export interface FileTreeStore {
  openFileIds: string[];
  activeFileId: string | null;
  setActiveFileId: (fileId: string | null) => void;
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  files: FileNode[];
  setFiles: (files: FileNode[]) => void;
  addNode: (name: string, type: 'file' | 'folder', parentId: string | null) => void;
  deleteNode: (nodeId: string) => void;
  renameNode: (nodeId: string, newName: string) => void;
  renamingNodeId: string | null;
  setRenamingNodeId: (nodeId: string | null) => void;
  creatingNodeType: { parentId: string | null; type: 'file' | 'folder' } | null;
  setCreatingNodeType: (node: { parentId: string | null; type: 'file' | 'folder' } | null) => void;
  yDoc: Y.Doc | null;
  setYDoc: (doc: Y.Doc) => void;
  yFiles: Y.Map<any> | null;
  setYFiles: (files: Y.Map<any>) => void;
}
// This Env type is for the frontend to understand the worker's environment.
// The worker has its own Env type in `worker/core-utils.ts`.
export interface Env {
  CF_AI_BASE_URL: string;
  CF_AI_API_KEY: string;
  SERPAPI_KEY: string;
  OPENROUTER_API_KEY: string;
  CHAT_AGENT: CFDurableObjectNamespace<any>;
  APP_CONTROLLER: CFDurableObjectNamespace<any>;
  COLLABORATION_SESSION: CFDurableObjectNamespace<any>;
  DB: D1Database;
  R2_TEMPLATES: R2Bucket;
}