import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './src/backend/app.ts';
import { config } from './src/backend/config/env.ts';

async function bootstrap() {
  const app = createExpressApp();
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const express = (await import('express')).default;
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CAT Connect Server] Running on http://0.0.0.0:${PORT} (ENV: ${config.nodeEnv})`);
  });
}

bootstrap().catch((err) => {
  console.error('[CAT Connect Server Failed to Start]:', err);
  process.exit(1);
});
