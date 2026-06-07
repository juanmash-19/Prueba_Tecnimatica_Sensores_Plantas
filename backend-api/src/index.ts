import { createApp } from './app';
import { initDatabase } from './db/database';

const app = createApp();
const port = Number(process.env.PORT ?? 3000);

try {
  initDatabase();
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error(error);
  process.exit(1);
}
