import type { Response } from 'express';
import TimeLog from '../models/TimeLog';
import type { AuthRequest } from '../middleware/auth';
import { PipelineStage, Types } from 'mongoose';
import type {
  MatchQuery,
  AnalyticsQuery,
  AnalyticsResponse,
  AggregationDayResult,
  AggregationProjectResult,
} from '../models/Analytics';
import { validateDateRange } from '../validators/analytics.validator';

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

export async function getSummary(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }
    const { startDate, endDate, projectIds } = req.query as AnalyticsQuery;

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const dateError = validateDateRange(start, end);
    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

    const match: MatchQuery = {
      userId: new Types.ObjectId(req.userId),
    };

    if (start || end) {
      match.startTime = {};
      if (start) match.startTime.$gte = start;
      if (end) match.startTime.$lte = end;
    }

    if (projectIds) {
      const ids = Array.isArray(projectIds) ? projectIds : [projectIds];

      const validIds = ids.filter((id) => Types.ObjectId.isValid(id));

      if (validIds.length === 0) {
        return res
          .status(400)
          .json({ message: 'No valid project IDs provided' });
      }

      match.projectId = {
        $in: validIds.map((id) => new Types.ObjectId(id)),
      };
    }

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalDuration: { $sum: '$duration' },
                count: { $sum: 1 },
              },
            },
          ],
          byProject: [
            {
              $group: {
                _id: '$projectId',
                totalDuration: { $sum: '$duration' },
                count: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: 'projects',
                localField: '_id',
                foreignField: '_id',
                as: 'projectInfo',
              },
            },
            {
              $unwind: {
                path: '$projectInfo',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                totalDuration: 1,
                count: 1,
                projectName: { $ifNull: ['$projectInfo.name', 'Unknown'] },
                projectColor: '$projectInfo.color',
              },
            },
            { $sort: { totalDuration: -1 } },
          ],
          byDay: [
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$startTime',
                  },
                },
                totalDuration: { $sum: '$duration' },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            { $limit: 365 },
          ],
        },
      },
    ];

    const [result] = await TimeLog.aggregate(pipeline);

    const overall = result?.overall?.[0] ?? {
      totalDuration: 0,
      count: 0,
    };

    const response: AnalyticsResponse = {
      overall: {
        totalDuration: overall.totalDuration,
        count: overall.count,
      },
      byProject: (result?.byProject ?? []).map(
        (p: AggregationProjectResult) => ({
          _id: p._id?.toString() || '',
          totalDuration: p.totalDuration,
          count: p.count,
          projectName: (p as any).projectName,
          projectColor: (p as any).projectColor,
        }),
      ),
      byDay: (result?.byDay ?? []).map((d: AggregationDayResult) => ({
        _id: d._id,
        totalDuration: d.totalDuration,
        count: d.count,
      })),
      dateRange: {
        start: start?.toISOString(),
        end: end?.toISOString(),
      },
    };

    return res.json(response);
  } catch (err: any) {
    console.error('Analytics summary error:', err);
  }
}
