import { formatDurationTimer } from '../../utils/formatDuration';
import { ConfirmButtons } from '../../components/ui/confirm-buttons';
import { TrashIcon } from '../../icons/Icons';
import dayjs from 'dayjs';
import type { TimeLogTableProps } from '../logs/time-log-table';

export function TimeLogTable({
  logs,
  projects,
  getProjectName,
  onDelete,
  deleteConfirmId,
  isDeleting,
  setDeleteConfirmId,
  onSort,
  sortBy,
  sortOrder,
}: TimeLogTableProps) {
  const renderSortIcon = (field: 'date' | 'duration') => {
    if (sortBy !== field)
      return <span className="invisible w-4 h-4">placeholder</span>;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b-2 border-orange-300">
            <th className="text-left py-3 px-4 w-[20%]">
              {onSort ? (
                <button
                  onClick={() => onSort('date')}
                  className="flex items-center gap-2 hover:text-orange-400 transition-colors w-full"
                >
                  <span className="flex items-center gap-2">
                    <span>Дата</span>
                    <span className="w-4 h-4 shrink-0">
                      {renderSortIcon('date')}
                    </span>
                  </span>
                </button>
              ) : (
                'Дата'
              )}
            </th>
            <th className="text-left py-3 px-4 w-[25%]">Проект</th>
            <th className="text-left py-3 px-4 w-[30%]">Описание</th>
            <th className="text-left py-3 px-4 w-[15%]">
              {onSort ? (
                <button
                  onClick={() => onSort('duration')}
                  className="flex items-center gap-2 hover:text-orange-400 transition-colors w-full"
                >
                  <span className="flex items-center gap-2">
                    <span>Длительность</span>
                    <span className="w-4 h-4 shrink-0">
                      {renderSortIcon('duration')}
                    </span>
                  </span>
                </button>
              ) : (
                'Длительность'
              )}
            </th>
            <th className="py-3 px-4 w-[10%]"></th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const project = projects.find((p) => p._id === log.projectId);

            return (
              <tr
                key={log._id}
                className="border-b border-orange-300 hover:bg-orange-300 transition-colors"
              >
                <td className="py-3 px-4 whitespace-nowrap">
                  {dayjs(log.startTime).format('DD.MM.YYYY HH:mm')}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 truncate">
                    {project?.color && (
                      <span
                        className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                    )}
                    <span className="truncate">
                      {getProjectName(log.projectId)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 truncate">{log.description}</td>
                <td className="py-3 px-4 font-mono whitespace-nowrap">
                  {formatDurationTimer(log.duration)}
                </td>
                <td className="py-3 px-2 ">
                  {deleteConfirmId === log._id ? (
                    <ConfirmButtons
                      onConfirm={() => onDelete(log._id)}
                      onCancel={() => setDeleteConfirmId(null)}
                      isDeleting={isDeleting}
                    />
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(log._id)}
                      disabled={isDeleting}
                      className="p-1.5  bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors"
                      title="Удалить запись"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
