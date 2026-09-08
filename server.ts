import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { initDatabase, db } from './server/db';
import authRoutes from './server/routes/authRoutes';
import apiKeyRoutes from './server/routes/apiKeyRoutes';
import datasetRoutes from './server/routes/datasetRoutes';
import opportunitiesRoutes from './server/routes/opportunitiesRoutes';
import usageRoutes from './server/routes/usageRoutes';
import billingRoutes from './server/routes/billingRoutes';
import adminRoutes from './server/routes/adminRoutes';

async function startServer() {
  // Initialize Database Schema & Seed Data
  console.log('[DataFlow API] Initializing SQLite database and seed records...');
  initDatabase();
  console.log('[DataFlow API] Database ready.');

  const app = express();
  const PORT = 3000;

  // Basic Middlewares
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-dataflow-demo']
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root Health Endpoints (requirement 30: Health endpoint: GET /health)
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'DataFlow API Platform',
      version: '1.0.0',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      database: 'connected',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/api-keys', apiKeyRoutes);
  app.use('/api/datasets', datasetRoutes);
  app.use('/api/v1/opportunities', opportunitiesRoutes);
  app.use('/api/usage', usageRoutes);
  app.use('/api/billing', billingRoutes);
  app.use('/api/admin', adminRoutes);

  // Complete Project Export Download Endpoints
  const serveProjectZip = (req: express.Request, res: express.Response) => {
    const zipPath = path.join(process.cwd(), 'public', 'dataflow-api-complete.zip');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="dataflow-api-complete.zip"');
    res.sendFile(zipPath);
  };
  app.get('/dataflow-api-complete.zip', serveProjectZip);
  app.get('/api/export/project.zip', serveProjectZip);

  // Complete Single File Source Code
  const serveProjectSource = (req: express.Request, res: express.Response) => {
    const srcPath = path.join(process.cwd(), 'public', 'COMPLETE_SOURCE_CODE.txt');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="COMPLETE_SOURCE_CODE.txt"');
    res.sendFile(srcPath);
  };
  app.get('/COMPLETE_SOURCE_CODE.txt', serveProjectSource);
  app.get('/api/export/source.txt', serveProjectSource);

  // Automated Ingestion Scheduler Simulation (Every 15 minutes in background)
  setInterval(() => {
    try {
      const activeDatasets = db.prepare('SELECT id, name FROM datasets WHERE status = "active"').all() as any[];
      if (activeDatasets.length > 0) {
        console.log(`[Scheduler] Automated tick: ${activeDatasets.length} datasets monitored.`);
      }
    } catch (e) {
      console.error('[Scheduler Error]:', e);
    }
  }, 15 * 60 * 1000);

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DataFlow API Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[DataFlow API Server] Fatal error during startup:', err);
  process.exit(1);
});
