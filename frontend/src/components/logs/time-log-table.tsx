import type { Project } from '../../types/appstore';
import type { TimeLogDto } from '../../types/timelog';

export interface TimeLogTableProps {
  logs: TimeLogDto[];
  projects: Project[];
  getProjectName: (id: string) => string;
  onDelete: (id: string) => void;
  deleteConfirmId: string | null;
  isDeleting: boolean;
  setDeleteConfirmId: (id: string | null) => void;
  onSort?: (field: 'date' | 'duration') => void;
  sortBy?: 'date' | 'duration';
  sortOrder?: 'asc' | 'desc';
}
