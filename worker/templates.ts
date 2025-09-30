import type { D1Database, R2Bucket, R2Object, R2ObjectBody } from '@cloudflare/workers-types';
import { Template } from "../src/lib/types";
import { Env } from './core-utils';
const mockTemplates: Omit<Template, 'id'>[] = [
{
  name: 'React + Vite Starter',
  description: 'A blazing fast React starter kit with Vite, Tailwind CSS, and TypeScript.',
  tags: ['React', 'Vite', 'Official'],
  author: 'VibeCode Team',
  avatarUrl: 'https://github.com/cloudflare.png',
  installs: 12500,
  framework: 'React'
},
{
  name: 'Next.js Commerce',
  description: 'A full-featured e-commerce template built with Next.js App Router.',
  tags: ['Next.js', 'E-commerce', 'Community'],
  author: 'Jane Doe',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  installs: 8200,
  framework: 'React'
},
{
  name: 'Vue 3 + Nuxt 3 Blog',
  description: 'A content-focused blog template with Nuxt 3, Vue 3, and Markdown support.',
  tags: ['Vue', 'Nuxt', 'Blog'],
  author: 'John Smith',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
  installs: 5600,
  framework: 'Vue'
},
{
  name: 'SvelteKit SaaS Boilerplate',
  description: 'Launch your SaaS quickly with this SvelteKit boilerplate, including auth and payments.',
  tags: ['Svelte', 'SaaS', 'Community'],
  author: 'Svelte Enthusiast',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
  installs: 9800,
  framework: 'Svelte'
},
{
  name: 'Hono API Server',
  description: 'A lightweight and fast API server template using Hono for Cloudflare Workers.',
  tags: ['Hono', 'API', 'Official'],
  author: 'VibeCode Team',
  avatarUrl: 'https://github.com/cloudflare.png',
  installs: 15000,
  framework: 'Node'
}];
export async function listTemplates(db: D1Database): Promise<Template[]> {
  try {
    const { results } = await db.prepare("SELECT * FROM templates").all<Template>();
    if (results && results.length > 0) {
      return results;
    }
    console.log("No templates found in D1, seeding with mock data...");
    const stmt = db.prepare(
      "INSERT INTO templates (id, name, description, tags, author, avatarUrl, installs, framework) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const inserts = mockTemplates.map((t) => {
      const id = crypto.randomUUID();
      return { ...t, id };
    });
    await db.batch(
      inserts.map((t) => stmt.bind(t.id, t.name, t.description, JSON.stringify(t.tags), t.author, t.avatarUrl, t.installs, t.framework))
    );
    return inserts.map((t) => ({ ...t, tags: t.tags as any }));
  } catch (e: any) {
    console.error("D1 query failed, returning mock data. Error:", e.message);
    return mockTemplates.map((t) => ({ ...t, id: crypto.randomUUID() }));
  }
}
export async function getTemplateContent(r2: R2Bucket, templateId: string): Promise<R2Object | R2ObjectBody | null> {
  try {
    // R2 .get() can return R2Object, R2ObjectBody, or null.
    // We return the result directly to be handled by the caller.
    const object = await r2.get(`templates/${templateId}.html`);
    if (object !== null) {
      return object;
    }
    // Fallback for old .json extension for backward compatibility
    return await r2.get(`templates/${templateId}.json`);
  } catch (e) {
    console.error(`Failed to fetch template ${templateId} from R2:`, e);
    return null;
  }
}