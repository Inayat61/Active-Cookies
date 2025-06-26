import { promises as fs } from 'fs';
import path from 'path';

// Ensure logs directory exists for tests
beforeAll(async () => {
  const logsDir = path.join(process.cwd(), 'logs');
  try {
    await fs.access(logsDir);
  } catch {
    await fs.mkdir(logsDir, { recursive: true });
  }
});
