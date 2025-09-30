import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
import { CollaborationSession } from "./collaboration";
import { listTemplates, getTemplateContent } from "./templates";
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // Use this API for conversations. **DO NOT MODIFY**
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId); // Get existing agent or create a new one if it doesn't exist, with sessionId as the name
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({
            success: false,
            error: API_RESPONSES.AGENT_ROUTING_FAILED
        }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Add your routes here
    /**
     * List all chat sessions
     * GET /api/sessions
     */
    app.get('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const sessions = await controller.listSessions();
            return c.json({ success: true, data: sessions });
        } catch (error) {
            console.error('Failed to list sessions:', error);
            return c.json({
                success: false,
                error: 'Failed to retrieve sessions'
            }, { status: 500 });
        }
    });
    /**
     * Create a new chat session
     * POST /api/sessions
     * Body: { title?: string, sessionId?: string }
     */
    app.post('/api/sessions', async (c) => {
        try {
            const body = await c.req.json().catch(() => ({}));
            const { title, sessionId: providedSessionId, firstMessage } = body;
            const sessionId = providedSessionId || crypto.randomUUID();
            // Generate better session titles
            let sessionTitle = title;
            if (!sessionTitle) {
                const now = new Date();
                const dateTime = now.toLocaleString([], {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                if (firstMessage && firstMessage.trim()) {
                    const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
                    const truncated = cleanMessage.length > 40
                        ? cleanMessage.slice(0, 37) + '...'
                        : cleanMessage;
                    sessionTitle = `${truncated} • ${dateTime}`;
                } else {
                    sessionTitle = `Chat ${dateTime}`;
                }
            }
            await registerSession(c.env, sessionId, sessionTitle);
            return c.json({
                success: true,
                data: { sessionId, title: sessionTitle }
            });
        } catch (error) {
            console.error('Failed to create session:', error);
            return c.json({
                success: false,
                error: 'Failed to create session'
            }, { status: 500 });
        }
    });
    /**
     * Delete a chat session
     * DELETE /api/sessions/:sessionId
     */
    app.delete('/api/sessions/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const deleted = await unregisterSession(c.env, sessionId);
            if (!deleted) {
                return c.json({
                    success: false,
                    error: 'Session not found'
                }, { status: 404 });
            }
            return c.json({ success: true, data: { deleted: true } });
        } catch (error) {
            console.error('Failed to delete session:', error);
            return c.json({
                success: false,
                error: 'Failed to delete session'
            }, { status: 500 });
        }
    });
    /**
     * Update session title
     * PUT /api/sessions/:sessionId/title
     * Body: { title: string }
     */
    app.put('/api/sessions/:sessionId/title', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const { title } = await c.req.json();
            if (!title || typeof title !== 'string') {
                return c.json({
                    success: false,
                    error: 'Title is required'
                }, { status: 400 });
            }
            const controller = getAppController(c.env);
            const updated = await controller.updateSessionTitle(sessionId, title);
            if (!updated) {
                return c.json({
                    success: false,
                    error: 'Session not found'
                }, { status: 404 });
            }
            return c.json({ success: true, data: { title } });
        } catch (error) {
            console.error('Failed to update session title:', error);
            return c.json({
                success: false,
                error: 'Failed to update session title'
            }, { status: 500 });
        }
    });
    /**
     * Get session count and stats
     * GET /api/sessions/stats
     */
    app.get('/api/sessions/stats', async (c) => {
        try {
            const controller = getAppController(c.env);
            const count = await controller.getSessionCount();
            return c.json({
                success: true,
                data: { totalSessions: count }
            });
        } catch (error) {
            console.error('Failed to get session stats:', error);
            return c.json({
                success: false,
                error: 'Failed to retrieve session stats'
            }, { status: 500 });
        }
    });
    /**
     * Clear all chat sessions
     * DELETE /api/sessions
     */
    app.delete('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const deletedCount = await controller.clearAllSessions();
            return c.json({
                success: true,
                data: { deletedCount }
            });
        } catch (error) {
            console.error('Failed to clear all sessions:', error);
            return c.json({
                success: false,
                error: 'Failed to clear all sessions'
            }, { status: 500 });
        }
    });
    /**
     * WebSocket endpoint for real-time collaboration
     * GET /api/collaboration/:projectId
     */
    app.get('/api/collaboration/:projectId', async (c) => {
        const projectId = c.req.param('projectId');
        if (!projectId) {
            return c.text('Project ID is required', 400);
        }
        // Ensure the binding exists
        if (!c.env.COLLABORATION_SESSION) {
            console.error('COLLABORATION_SESSION binding is not configured.');
            return c.text('Collaboration service is not available', 500);
        }
        try {
            const id = c.env.COLLABORATION_SESSION.idFromName(projectId);
            const stub = c.env.COLLABORATION_SESSION.get(id);
            return await stub.fetch(c.req.raw);
        } catch (error) {
            console.error(`Failed to connect to CollaborationSession DO for project ${projectId}:`, error);
            return c.text('Failed to establish collaboration session', 500);
        }
    });
    /**
     * List all available project templates
     * GET /api/templates
     */
    app.get('/api/templates', async (c) => {
        if (!c.env.DB) {
            console.error('D1 binding (DB) is not configured.');
            return c.json({ success: false, error: 'Database service is not available' }, { status: 503 });
        }
        try {
            const templates = await listTemplates(c.env.DB);
            return c.json({ success: true, data: templates });
        } catch (error) {
            console.error('Failed to list templates:', error);
            return c.json({ success: false, error: 'Failed to retrieve templates' }, { status: 500 });
        }
    });
    /**
     * Get content for a specific template
     * GET /api/templates/:templateId
     */
    app.get('/api/templates/:templateId', async (c) => {
        if (!c.env.R2_TEMPLATES) {
            console.error('R2 binding (R2_TEMPLATES) is not configured.');
            return c.json({ success: false, error: 'Storage service is not available' }, { status: 503 });
        }
        try {
            const { templateId } = c.req.param();
            const r2Object = await getTemplateContent(c.env.R2_TEMPLATES, templateId);
            if (r2Object === null) {
                return c.json({ success: false, error: 'Template not found' }, { status: 404 });
            }
            // Use a more specific type guard to differentiate R2Object from R2ObjectBody
            if (r2Object && 'httpMetadata' in r2Object) {
                // It's an R2Object
                const headers = new Headers();
                r2Object.writeHttpMetadata(headers);
                headers.set('etag', r2Object.httpEtag);
                return new Response(r2Object.body, { headers });
            } else {
                // It's an R2ObjectBody (just the stream) or null
                return new Response(r2Object);
            }
        } catch (error) {
            console.error('Failed to get template content:', error);
            return c.json({ success: false, error: 'Failed to retrieve template content' }, { status: 500 });
        }
    });
    /**
     * Simulate a project deployment
     * POST /api/projects/:projectId/deploy
     */
    app.post('/api/projects/:projectId/deploy', async (c) => {
        const { projectId } = c.req.param();
        // Simulate a build/deployment process
        await new Promise(resolve => setTimeout(resolve, 3000));
        const isSuccess = Math.random() > 0.1; // 90% success rate
        const newDeployment = {
            id: `dpl_${crypto.randomUUID().slice(0, 8)}`,
            projectId,
            version: `v1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
            status: isSuccess ? 'Success' : 'Failed',
            deployedAt: new Date().toISOString(),
            url: isSuccess ? `${projectId.slice(0, 8)}.vibecode.app` : '-',
            commit: `feat: deploy project (${crypto.randomUUID().slice(0, 7)})`,
        };
        return c.json({ success: true, data: newDeployment });
    });
}