import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { fail } from './errors.js';
export function projectRoutes() {
  const router = Router();
  const projects = new Map();
  router.get('/', (req, res) => {
    const { tech, limit = '20', offset = '0' } = req.query;
    if (tech !== undefined && (typeof tech !== 'string' || !tech.trim() || tech.length > 40)) throw fail(400, 'tech must be a nonempty string up to 40 characters');
    if (typeof limit !== 'string' || !/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 100) throw fail(400, 'limit must be an integer from 1 to 100');
    if (typeof offset !== 'string' || !/^\d+$/.test(offset) || !Number.isSafeInteger(Number(offset))) throw fail(400, 'offset must be a nonnegative safe integer');
    const matches = [...projects.values()].filter(p => tech === undefined || p.tech === tech.trim().toLowerCase());
    res.json({ data: matches.slice(Number(offset), Number(offset) + Number(limit)), total: matches.length, limit: Number(limit), offset: Number(offset) });
  });
  router.post('/', async (req, res) => {
    if (!req.is('application/json')) throw fail(415, 'Use Content-Type: application/json');
    const body = req.body;
    if (!body || Array.isArray(body) || typeof body !== 'object') throw fail(400, 'A JSON object is required');
    for (const [key, max] of [['title', 120], ['tech', 40]]) {
      if (typeof body[key] !== 'string' || !body[key].trim() || body[key].length > max) throw fail(400, `${key} must be a nonempty string up to ${max} characters`);
    }
    const project = { id: randomUUID(), title: body.title.trim(), tech: body.tech.trim().toLowerCase(), createdAt: new Date().toISOString() };
    projects.set(project.id, project);
    res.location(`/projects/${project.id}`).status(201).json({ data: project });
  });
  router.get('/:id', async (req, res) => {
    const project = projects.get(req.params.id);
    if (!project) throw fail(404, 'Project not found');
    res.json({ data: project });
  });
  return router;
}
