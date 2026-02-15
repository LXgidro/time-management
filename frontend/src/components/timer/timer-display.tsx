import { type Project } from '../../types/appstore';
import { type ActiveTimer } from '../../types/timer';
import { formatDurationTimer } from '../../utils/formatDuration';
import { PauseIcon, PlayIcon } from '../../icons/Icons';
import { StopIcon } from '@heroicons/react/24/outline';
import { ProjectSelect } from '../../components/ui/project-select';

interface TimerDisplayProps {
  activeTimer: ActiveTimer | null;
  elapsedSeconds: number;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  selectedProjectId: string;
  onProjectChange: (id: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  projects: Project[];
  onCreateNewProject: () => void;
}

export function TimerDisplay({
  activeTimer,
  elapsedSeconds,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
  selectedProjectId,
  onProjectChange,
  description,
  onDescriptionChange,
  projects,
  onCreateNewProject,
}: TimerDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-50">
      {activeTimer ? (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-6">
            <div className="text-7xl font-mono font-light text-gray-900">
              {formatDurationTimer(elapsedSeconds)}
            </div>
            <div className="flex flex-row gap-2">
              {isPaused ? (
                <button
                  onClick={onResume}
                  className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center hover:border-green-600 transition-colors"
                >
                  <PlayIcon className="w-6 h-6 text-green-600 ml-0.5" />
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="w-12 h-12 rounded-full border-2 border-orange-300 flex items-center justify-center hover:border-orange-400 transition-colors"
                >
                  <PauseIcon className="w-6 h-6 text-orange-600" />
                </button>
              )}
              <button
                onClick={onStop}
                className="w-12 h-12 rounded-full border-2 border-orange-300 flex items-center justify-center hover:border-orange-400 transition-colors"
              >
                <StopIcon className="w-6 h-6 text-orange-600" />
              </button>
            </div>
          </div>
          <div className="h-6">
            {isPaused && (
              <span className="text-lg text-orange-500">(пауза)</span>
            )}
          </div>

          <div className="w-full max-w-md mb-4">
            <label className="block text-sm text-gray-600 mb-2">Проект</label>
            <div className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg bg-white text-gray-900">
              {projects.find((p) => p._id === activeTimer.projectId)?.name ||
                'Неизвестный проект'}
            </div>
          </div>

          <div className="w-full max-w-md mb-4">
            <label className="block text-sm text-gray-600 mb-2">Описание</label>
            <div className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg bg-white text-gray-900">
              {activeTimer.description}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-6">
            <div className="text-7xl font-mono font-light text-gray-300">
              00:00:00
            </div>
            <div className="flex flex-row gap-2">
              <button
                onClick={onStart}
                className="w-12 h-12 rounded-full border-2 border-orange-300 flex items-center justify-center hover:border-orange-400 transition-colors"
              >
                <PlayIcon className="w-6 h-6 text-orange-600 ml-0.5" />
              </button>
              <div className="w-12 h-12" />
            </div>
          </div>
          <div className="h-6" />

          <div className="w-full max-w-md mb-4">
            <label className="block text-sm text-gray-600 mb-2">
              Выбор проекта
            </label>
            <ProjectSelect
              projects={projects}
              value={selectedProjectId}
              onChange={onProjectChange}
              placeholder="Выберите проект"
              includeCreateOption
              onCreateNew={onCreateNewProject}
            />
          </div>

          <div className="w-full max-w-md mb-4">
            <label className="block text-sm text-gray-600 mb-2">
              Добавьте описание
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
