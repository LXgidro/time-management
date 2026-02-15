import { type TimeLogDto } from '../../types/timelog';
import { formatDurationTimer } from '../../utils/formatDuration';
import dayjs from 'dayjs';

interface RecentLogsListProps {
  logs: TimeLogDto[];
  getProjectName: (id: string) => string;
  onViewAll: () => void;
}

export function RecentLogsList({
  logs,
  getProjectName,
  onViewAll,
}: RecentLogsListProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Недавние записи</h3>
        <button
          onClick={onViewAll}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          Все записи →
        </button>
      </div>

      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log._id}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-2 border-orange-300"
          >
            <div>
              <div className="font-medium text-gray-900">{log.description}</div>
              <div className="text-sm text-gray-600">
                {getProjectName(log.projectId)} •{' '}
                {dayjs(log.startTime).format('DD.MM.YYYY HH:mm')}
              </div>
            </div>
            <div className="font-mono font-semibold text-gray-900">
              {formatDurationTimer(log.duration)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
