import { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { Header } from '@/components/Header';
import { FileTree } from '@/components/ide/FileTree';
import { CodeEditor } from '@/components/ide/CodeEditor';
import { ChatPanel } from '@/components/ide/ChatPanel';
import { PreviewPanel } from '@/components/ide/PreviewPanel';
import { TerminalPanel } from '@/components/ide/TerminalPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Terminal, Monitor, Loader2, FileCode, Bot, Rocket } from 'lucide-react';
import { createCollaborationProvider } from '@/lib/collaboration';
import { useProjectStore } from '@/stores/useProjectStore';
import { useFileTreeStore } from '@/stores/useFileTreeStore';
import { FileNode } from '@/lib/types';
import { EditorTabs } from '@/components/ide/EditorTabs';
import { StatusBar } from '@/components/ide/StatusBar';
import { DeploymentPanel } from '@/components/ide/DeploymentPanel';
export function IdePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useProjectStore((state) => state.projects.find(p => p.id === projectId));
  const { activeFileId, setActiveFileId, files, setYDoc, setYFiles, yDoc, yFiles, openFile } = useFileTreeStore();
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [isLoading, setIsLoading] = useState(true);
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
  useEffect(() => {
    if (!projectId || !project) {
      setIsLoading(false);
      return;
    }
    const doc = new Y.Doc();
    const wsProvider = createCollaborationProvider(projectId, doc);
    wsProvider.on('status', (event: { status: 'connected' | 'disconnected' }) => {
      setConnectionStatus(event.status);
    });
    const filesMap = doc.getMap('files');
    if (filesMap.size === 0) {
      const initialFileId = crypto.randomUUID();
      const initialFile: FileNode = {
        id: initialFileId,
        name: 'index.html',
        type: 'file',
        content: project.templateContent || '',
        parentId: null,
      };
      filesMap.set(initialFileId, initialFile);
      doc.getText(initialFileId).insert(0, initialFile.content || '');
      openFile(initialFileId);
    }
    setYDoc(doc);
    setProvider(wsProvider);
    setYFiles(filesMap);
    setIsLoading(false);
    return () => {
      wsProvider.disconnect();
      doc.destroy();
    };
  }, [projectId, project, openFile, setYDoc, setYFiles]);
  useEffect(() => {
    if (!yFiles || !activeFileId) return;
    const handleFileDeletion = () => {
      if (!yFiles.has(activeFileId)) {
        setActiveFileId(null);
      }
    };
    yFiles.observe(handleFileDeletion);
    return () => {
      yFiles.unobserve(handleFileDeletion);
    };
  }, [yFiles, activeFileId, setActiveFileId]);
  if (!project && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }
  if (isLoading || !project || !yDoc || !yFiles) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
          <p className="text-slate-500 dark:text-slate-400">Loading Project...</p>
        </div>
      </div>
    );
  }
  const activeFile = activeFileId ? getFileById(files, activeFileId) : null;
  return (
    <div className="flex h-screen w-full flex-col bg-slate-100 dark:bg-slate-900">
      <Header projectName={project.name} />
      <main className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={20} minSize={15}>
            <Tabs defaultValue="files" className="h-full w-full flex flex-col">
              <TabsList className="m-2">
                <TabsTrigger value="files" className="gap-2"><FileCode className="h-4 w-4" /> Files</TabsTrigger>
                <TabsTrigger value="chat" className="gap-2"><Bot className="h-4 w-4" /> AI Chat</TabsTrigger>
              </TabsList>
              <TabsContent value="files" className="flex-1 overflow-auto">
                <FileTree yDoc={yDoc} yFiles={yFiles} />
              </TabsContent>
              <TabsContent value="chat" className="flex-1">
                <ChatPanel yDoc={yDoc} />
              </TabsContent>
            </Tabs>
          </Panel>
          <PanelResizeHandle className="w-1 bg-slate-200 dark:bg-slate-800 hover:bg-indigo-500 transition-colors" />
          <Panel defaultSize={55} minSize={30} className="flex flex-col">
            <EditorTabs />
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                yDoc={yDoc}
                provider={provider}
                activeFile={activeFile}
              />
            </div>
            <StatusBar connectionStatus={connectionStatus} activeFile={activeFile?.name || null} />
          </Panel>
          <PanelResizeHandle className="w-1 bg-slate-200 dark:bg-slate-800 hover:bg-indigo-500 transition-colors" />
          <Panel defaultSize={25} minSize={20}>
            <Tabs defaultValue="preview" className="h-full w-full flex flex-col">
              <TabsList className="m-2">
                <TabsTrigger value="preview" className="gap-2">
                  <Monitor className="h-4 w-4" /> Preview
                </TabsTrigger>
                <TabsTrigger value="terminal" className="gap-2">
                  <Terminal className="h-4 w-4" /> Terminal
                </TabsTrigger>
                <TabsTrigger value="deployments" className="gap-2">
                  <Rocket className="h-4 w-4" /> Deployments
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="preview"
                className="flex-1 bg-white dark:bg-slate-950"
              >
                <PreviewPanel yFiles={yFiles} yDoc={yDoc} />
              </TabsContent>
              <TabsContent
                value="terminal"
                className="flex-1 bg-black text-white font-mono text-sm"
              >
                <TerminalPanel />
              </TabsContent>
              <TabsContent value="deployments" className="flex-1">
                <DeploymentPanel />
              </TabsContent>
            </Tabs>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}