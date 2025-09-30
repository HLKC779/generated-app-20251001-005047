import { useState, useEffect, useCallback } from 'react';
import * as Y from 'yjs';
import { useDebounce } from 'react-use';
import { FileNode } from '@/lib/types';
interface PreviewPanelProps {
  yFiles: Y.Map<any> | null;
  yDoc: Y.Doc | null;
}
const createHtml = (code: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: sans-serif; color: #333; }
      </style>
    </head>
    <body>
      ${code}
      <script type="module">
        // Basic error catching for scripts in the preview
        window.addEventListener('error', (event) => {
          console.error('Preview Error:', event.error);
          const errorDiv = document.createElement('div');
          errorDiv.style.color = 'red';
          errorDiv.style.position = 'fixed';
          errorDiv.style.bottom = '10px';
          errorDiv.style.left = '10px';
          errorDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
          errorDiv.style.padding = '10px';
          errorDiv.style.border = '1px solid red';
          errorDiv.style.borderRadius = '5px';
          errorDiv.style.fontFamily = 'monospace';
          errorDiv.textContent = 'Script Error: ' + event.message;
          document.body.appendChild(errorDiv);
        });
      </script>
    </body>
    </html>
  `;
};
export function PreviewPanel({ yFiles, yDoc }: PreviewPanelProps) {
  const [srcDoc, setSrcDoc] = useState('');
  const findIndexHtml = useCallback((): FileNode | null => {
    if (!yFiles) return null;
    for (const file of yFiles.values()) {
      if (file.name === 'index.html') {
        return file;
      }
    }
    return null;
  }, [yFiles]);
  const updateSrcDoc = useCallback(() => {
    const indexFile = findIndexHtml();
    if (indexFile && yDoc) {
      const code = yDoc.getText(indexFile.id).toString();
      setSrcDoc(createHtml(code));
    } else {
      setSrcDoc(createHtml('<div>Create an <strong>index.html</strong> file to see the preview.</div>'));
    }
  }, [findIndexHtml, yDoc]);
  useDebounce(updateSrcDoc, 300, [updateSrcDoc]);
  useEffect(() => {
    if (!yDoc) return;
    const indexFile = findIndexHtml();
    if (!indexFile) {
      updateSrcDoc(); // Set initial "not found" message
      return;
    }
    const yText = yDoc.getText(indexFile.id);
    const observer = () => {
      updateSrcDoc();
    };
    yText.observe(observer);
    updateSrcDoc(); // Initial render
    return () => {
      yText.unobserve(observer);
    };
  }, [yDoc, findIndexHtml, updateSrcDoc]);
  return (
    <iframe
      title="Live Preview"
      srcDoc={srcDoc}
      className="h-full w-full bg-white"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}