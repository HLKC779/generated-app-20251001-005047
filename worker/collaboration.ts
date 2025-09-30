import { DurableObject } from 'cloudflare:workers';
import type { Env } from './core-utils';
// This is a simplified in-memory implementation for a Yjs backend.
// For production, you would want to persist the Yjs document state,
// for example, by periodically saving it to R2 or another storage layer.
// The y-websocket library has adapters for this (e.g., y-leveldb).
export class CollaborationSession extends DurableObject<Env> {
  // We will hold the Yjs document updates in memory for this session.
  // Each Durable Object instance represents a single project's collaboration session.
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  async fetch(request: Request): Promise<Response> {
    // This Durable Object only supports WebSocket upgrades.
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected a WebSocket upgrade request', { status: 426 });
    }
    // Create a new WebSocket pair.
    const { 0: client, 1: server } = new WebSocketPair();
    // This forwards the WebSocket connection to the y-websocket server logic,
    // which is running inside the Durable Object.
    // The `handleSession` method is a required part of the y-websocket DO server API.
    this.ctx.acceptWebSocket(server);
    // Return the client WebSocket to the user.
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}