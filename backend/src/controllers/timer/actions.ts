import { Response } from 'express';
import Timer, {
  ITimer,
  StartTimerRequest,
  StopTimerResponse,
  TimerResponse,
} from '../../models/Timer';
import TimeLog from '../../models/TimeLog';
import type { AuthRequest } from '../../middleware/auth';
import { Types } from 'mongoose';

export const pauseTimer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: 'Не авторизован' });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Невалидный ID таймера' });
      return;
    }

    const timer = await Timer.findOne({ _id: id, userId });

    if (!timer) {
      res.status(404).json({ message: 'Таймер не найден' });
      return;
    }

    if (timer.status !== 'running') {
      res.status(400).json({ message: 'Таймер не запущен' });
      return;
    }

    timer.status = 'paused';
    timer.pausedAt = new Date();
    await timer.save();

    const response: TimerResponse = {
      _id: timer._id.toString(),
      projectId: timer.projectId.toString(),
      description: timer.description,
      startTime: timer.startTime.toISOString(),
      status: timer.status,
      pausedAt: timer.pausedAt?.toISOString(),
      totalPausedDuration: timer.totalPausedDuration,
      lastResumedAt: timer.lastResumedAt?.toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('pauseTimer error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const resumeTimer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const timer: ITimer | null = await Timer.findById(id);
    if (!timer) {
      res.status(404).json({ message: 'Таймер не найден' });
      return;
    }

    if (timer.status !== 'paused') {
      res.status(400).json({ message: 'Таймер не на паузе' });
      return;
    }

    if (!timer.pausedAt) {
      res.status(400).json({ message: 'Нет времени паузы' });
      return;
    }

    const pauseDuration = Math.floor(
      (Date.now() - timer.pausedAt.getTime()) / 1000,
    );

    timer.totalPausedDuration += pauseDuration;
    timer.status = 'running';
    timer.pausedAt = undefined;
    timer.lastResumedAt = new Date();

    await timer.save();

    const response: TimerResponse = {
      _id: timer._id.toString(),
      projectId: timer.projectId.toString(),
      description: timer.description,
      startTime: timer.startTime.toISOString(),
      status: timer.status,
      totalPausedDuration: timer.totalPausedDuration,
      lastResumedAt: timer.lastResumedAt?.toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('resumeTimer error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const startTimer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const { projectId, description }: StartTimerRequest = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Не авторизован' });
      return;
    }

    if (!projectId || !description) {
      res.status(400).json({
        message: 'projectId и description обязательны',
      });
      return;
    }

    if (!Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ message: 'Невалидный ID проекта' });
      return;
    }

    const existingTimer: ITimer | null = await Timer.findOne({
      userId,
      status: { $in: ['running', 'paused'] },
    });

    if (existingTimer) {
      res.status(400).json({
        message: 'У вас уже есть активный таймер',
      });
      return;
    }

    const timer: ITimer = await Timer.create({
      userId,
      projectId,
      description,
      startTime: new Date(),
      status: 'running',
      totalPausedDuration: 0,
    });

    const response: TimerResponse = {
      _id: timer._id.toString(),
      projectId: timer.projectId.toString(),
      description: timer.description,
      startTime: timer.startTime.toISOString(),
      status: timer.status,
      totalPausedDuration: timer.totalPausedDuration,
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('startTimer error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const stopTimer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: 'Не авторизован' });
      return;
    }

    console.log('Stopping timer:', id, 'for user:', userId);

    const timer: ITimer | null = await Timer.findOne({
      _id: id,
      userId,
    });

    if (!timer) {
      res.status(404).json({ message: 'Таймер не найден' });
      return;
    }

    const endTime = new Date();
    let duration = Math.floor(
      (endTime.getTime() - timer.startTime.getTime()) / 1000,
    );

    if (timer.totalPausedDuration) {
      duration -= timer.totalPausedDuration;
    }

    if (timer.status === 'paused' && timer.pausedAt) {
      const currentPause = Math.floor(
        (endTime.getTime() - timer.pausedAt.getTime()) / 1000,
      );
      duration -= currentPause;
    }

    duration = Math.max(0, duration);

    let timeLog = null;
    try {
      timeLog = await TimeLog.create({
        projectId: timer.projectId,
        userId: timer.userId,
        description: timer.description,
        startTime: timer.startTime,
        endTime: endTime,
        duration: duration,
        timerId: timer._id,
      });

      console.log('TimeLog created:', timeLog._id.toString());
    } catch (logError: any) {
      console.error('Failed to create TimeLog:', logError.message);
    }

    await Timer.findByIdAndDelete(id);
    console.log('Timer deleted successfully');

    const response: StopTimerResponse = {
      success: true,
      message: 'Таймер остановлен',
      duration: duration,
      timeLog: timeLog
        ? {
            _id: timeLog._id.toString(),
            projectId: timeLog.projectId.toString(),
            description: timeLog.description,
            duration: timeLog.duration,
            startTime: timeLog.startTime.toISOString(),
            endTime: timeLog.endTime.toISOString(),
          }
        : null,
    };

    res.json(response);
  } catch (error: any) {
    console.error('stopTimer error:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        message: 'Ошибка валидации данных',
        errors: error.errors,
      });
      return;
    }

    if (error.name === 'MongoServerError') {
      res.status(500).json({
        message: 'Ошибка базы данных',
        code: error.code,
      });
      return;
    }

    res.status(500).json({
      message: 'Ошибка сервера: ' + error.message,
    });
  }
};
