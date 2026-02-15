import type { ActiveTimer } from './timer';
import type { AuthUser } from './user';

export interface Project {
  _id: string;
  name: string;
  description?: string | null;
  color?: string | null;
}

export interface AppState {
  user: AuthUser | null;
  token: string | null;
  projects: Project[];
  activeTimer: ActiveTimer | null;
  isLoading: boolean;

  setAuth: (payload: { user: AuthUser; token: string }) => void;
  logout: () => void;
  loadFromStorage: () => void;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;

  setActiveTimer: (timer: ActiveTimer | null) => void;
  clearActiveTimer: () => void;

  setLoading: (loading: boolean) => void;
}
