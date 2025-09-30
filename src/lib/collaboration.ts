import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
export const createCollaborationProvider = (projectId: string, ydoc: Y.Doc) => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.host;
  const wsUrl = `${protocol}://${host}/api/collaboration/${projectId}`;
  // The y-websocket provider handles WebSocket connection, awareness, and document synchronization.
  const provider = new WebsocketProvider(wsUrl, projectId, ydoc);
  // Optional: Log provider status for debugging
  provider.on('status', (event: { status: string }) => {
    console.log(`[Collaboration] Provider status: ${event.status}`);
  });
  return provider;
};