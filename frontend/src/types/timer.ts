export interface StartTimerPayload {
  projectId: string;
  description: string;
}

export interface UpdateTimerPayload {
  description?: string;
  projectId?: string;
}

export interface ActiveTimer {
  _id: string;
  projectId: string;
  project?: {
    _id: string;
    name: string;
    color?: string;
  };
  description: string;
  startTime: string;
  pausedAt?: string;
  totalPausedDuration?: number;
  status: 'running' | 'paused';
  elapsedSeconds: number;
}

export interface StopTimerResponse {
  success: boolean;
  message: string;
  duration: number;
  timeLog: {
    _id: string;
    projectId: string;
    description: string;
    duration: number;
    startTime: string;
    endTime: string;
  } | null;
}
