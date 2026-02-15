import type { Project } from '../../types/appstore';
import { formatDurationReadable } from '../../utils/formatDuration';
import { PencilIcon, TrashIcon } from '../../icons/Icons';
import { ConfirmButtons } from './confirm-buttons';

interface ProjectCardProps {
  project: Project;
  stats: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  deleteConfirmId: string | null;
  isDeleting: boolean;
  setDeleteConfirmId: (id: string | null) => void;
}

export function ProjectCard({
  project,
  stats,
  onEdit,
  onDelete,
  deleteConfirmId,
  isDeleting,
  setDeleteConfirmId,
}: ProjectCardProps) {
  const isConfirming = deleteConfirmId === project._id;

  return (
    <div className="rounded-xl border-2 bg-gray-50 border-orange-300 p-3 hover:border-orange-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          {project.color && (
            <div
              className="w-5 h-5 rounded-full shrink-0"
              style={{ backgroundColor: project.color || '#EF4444' }}
            />
          )}
          <h3 className="font-semibold text-lg">{project.name}</h3>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-10">
        {project.description || ''}
      </p>

      <div className="text-sm text-gray-600 mb-4">
        Потрачено времени:{' '}
        <span className="font-semibold text-gray-900">
          {formatDurationReadable(stats || 0)}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(project._id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-orange-300 hover:bg-orange-300 hover:border-orange-400 rounded-lg text-sm font-medium transition-colors"
        >
          <PencilIcon className="w-4 h-4" />
          Редактировать
        </button>

        <div className="w-20 flex items-center justify-center">
          {isConfirming ? (
            <ConfirmButtons
              onConfirm={() => onDelete(project._id)}
              onCancel={() => setDeleteConfirmId(null)}
              isDeleting={isDeleting}
            />
          ) : (
            <button
              onClick={() => setDeleteConfirmId(project._id)}
              disabled={isDeleting}
              className="p-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors"
              title="Удалить запись"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
