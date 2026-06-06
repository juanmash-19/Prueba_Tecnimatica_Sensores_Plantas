import express from 'express';
import cors from 'cors';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(notFoundHandler as any);
app.use(errorHandler as any);

const PORT = process.env.PORT ?? '3000';
app.listen(Number(PORT), () => console.log(`Server listening on http://localhost:${PORT}`));
