import { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useTheme } from '@/hooks/use-theme';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import * as monaco from 'monaco-editor';
import { FileNode } from '@/lib/types';
import { WelcomePanel } from './WelcomePanel';
interface CodeEditorProps {
  yDoc: Y.Doc | null;
  provider: WebsocketProvider | null;
  activeFile: FileNode | null;
}
export function CodeEditor({ yDoc, provider, activeFile }: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { isDark } = useTheme();
  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };
  useEffect(() => {
    if (!editorRef.current || !yDoc || !provider || !activeFile) {
      return;
    }
    const yText = yDoc.getText(activeFile.id);
    const model = editorRef.current.getModel();
    if (!model) return;
    const monacoBinding = new MonacoBinding(
      yText,
      model,
      new Set([editorRef.current]),
      provider.awareness
    );
    // Update Monaco editor language based on file extension
    const extension = activeFile.name.split('.').pop();
    let language = 'plaintext';
    if (extension === 'js' || extension === 'jsx') language = 'javascript';
    if (extension === 'ts' || extension === 'tsx') language = 'typescript';
    if (extension === 'css') language = 'css';
    if (extension === 'html') language = 'html';
    if (extension === 'json') language = 'json';
    if (extension === 'md') language = 'markdown';
    monaco.editor.setModelLanguage(model, language);
    return () => {
      monacoBinding.destroy();
    };
  }, [yDoc, provider, activeFile]);
  if (!activeFile) {
    return <WelcomePanel />;
  }
  return (
    <div className="h-full w-full bg-[#1e1e1e]">
      <Editor
        key={activeFile.id} // Re-mount editor when file changes to ensure clean state
        height="100%"
        defaultValue={yDoc?.getText(activeFile.id).toString()}
        theme={isDark ? 'vs-dark' : 'light'}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}