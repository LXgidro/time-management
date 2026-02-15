import type { Response } from 'express';
import TimeLog from '../models/TimeLog';
import type { AuthRequest } from '../middleware/auth';

export async function getTimeLogs(req: AuthRequest, res: Response) {
  try {
    const {
      projectId,
      projectIds,
      startDate,
      endDate,
      page = '1',
      limit = '20',
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query as {
      projectId?: string;
      projectIds?: string | string[];
      startDate?: string;
      endDate?: string;
      page?: string;
      limit?: string;
      sortBy?: 'date' | 'duration';
      sortOrder?: 'asc' | 'desc';
    };

    const filters: Record<string, unknown> = {
      userId: req.userId,
    };

    let projectFilter: string[] = [];

    if (projectIds) {
      if (Array.isArray(projectIds)) {
        projectFilter = projectIds;
      } else if (typeof projectIds === 'string') {
        projectFilter = [projectIds];
      }
    } else if (projectId) {
      projectFilter = [projectId];
    }

    if (projectFilter.length > 0) {
      filters.projectId = { $in: projectFilter };
    }

    if (startDate || endDate) {
      filters.startTime = {};
      if (startDate) {
        (filters.startTime as any).$gte = new Date(startDate);
      }
      if (endDate) {
        (filters.startTime as any).$lte = new Date(endDate);
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    const sortOptions: Record<string, 1 | -1> = {};
    if (sortBy === 'date') {
      sortOptions.startTime = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'duration') {
      sortOptions.duration = sortOrder === 'asc' ? 1 : -1;
    }

    const [items, total] = await Promise.all([
      TimeLog.find(filters)
        .sort(sortOptions)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      TimeLog.countDocuments(filters),
    ]);

    return res.json({
      items,
      total,
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortOrder,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
}

export async function deleteTimeLog(req: AuthRequest, res: Response) {
  try {
    const log = await TimeLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!log) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
}
