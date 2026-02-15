import { Response } from 'express';
import Timer, { PopulatedProject, TimerResponse } from '../../models/Timer';
import type { AuthRequest } from '../../middleware/auth';
import { calculateElapsedSeconds } from '../timer/utils';

export const getActiveTimer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: 'Не авторизован' });
      return;
    }

    const timer = await Timer.findOne({
      userId,
      status: { $in: ['running', 'paused'] },
    }).populate<{ projectId: PopulatedProject }>('projectId', 'name color');

    if (!timer) {
      res.json(null);
      return;
    }

    const elapsedSeconds = calculateElapsedSeconds(timer);

    const project = timer.projectId as PopulatedProject;
    const projectIdString = project._id.toString();

    const timerWithElapsed: TimerResponse = {
      _id: timer._id.toString(),
      projectId: projectIdString,
      description: timer.description,
      startTime: timer.startTime.toISOString(),
      status: timer.status,
      pausedAt: timer.pausedAt?.toISOString(),
      totalPausedDuration: timer.totalPausedDuration,
      lastResumedAt: timer.lastResumedAt?.toISOString(),
      elapsedSeconds,
      project: {
        _id: projectIdString,
        name: project.name,
        color: project.color,
      },
    };

    res.json(timerWithElapsed);
  } catch (error: any) {
    console.error('getActiveTimer error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
