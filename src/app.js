import express from 'express';
import { randomUUID } from 'node:crypto';
import { projectRoutes } from './projects.js';
import { errorHandler, fail } from './errors.js';
export function createApp({ logger = console.log } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    req.requestId = randomUUID();
    res.set('X-Request-Id', req.requestId);
    res.set('X-Content-Type-Options', 'nosniff');
    res.on('finish', () => logger(JSON.stringify({ requestId: req.requestId, method: req.method, status: res.statusCode })));
    next();
  });
  app.use(express.json({ limit: '16kb' }));
  app.get('/', (req, res) => res.json({ name: 'NeuraOne Projects API', version: '1.0.0', storage: 'in-memory demo' }));
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/projects', projectRoutes());
  app.use((req, res, next) => next(fail(404, 'Route not found')));
  app.use(errorHandler);
  return app;
}
