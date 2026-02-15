import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import timeLogsRouter from './routes/timelogs';
import analyticsRouter from './routes/analytics';
import timerRouter from './routes/timer';
import { authMiddleware } from './middleware/auth';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/timer', timerRouter);
app.use('/api/projects', authMiddleware, projectsRouter);
app.use('/api/timelogs', authMiddleware, timeLogsRouter);
app.use('/api/analytics', authMiddleware, analyticsRouter);
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Путь не найден', path: req.originalUrl });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/time_management';

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
