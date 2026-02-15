import type { Project } from '../../types/appstore';

interface ProjectSelectProps {
  projects: Project[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  includeCreateOption?: boolean;
  onCreateNew?: () => void;
}

export function ProjectSelect({
  projects,
  value,
  onChange,
  placeholder = 'Выберите проект',
  includeCreateOption = false,
  onCreateNew,
}: ProjectSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value === 'create' && onCreateNew) {
            onCreateNew();
          } else {
            onChange(e.target.value);
          }
        }}
        className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg bg-white focus:outline-none focus:border-orange-400 appearance-none cursor-pointer"
      >
        <option value="">
          {projects.length === 0 ? 'Нет проектов' : placeholder}
        </option>

        {includeCreateOption && (
          <option value="create" className="text-orange-500 font-medium">
            ＋ Создать новый проект...
          </option>
        )}

        {projects.map((project) => (
          <option key={project._id} value={project._id}>
            {project.name}
          </option>
        ))}
      </select>

      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
