export interface TimeLogDto {
  _id: string;
  projectId: string;
  userId: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetTimeLogsParams {
  startDate?: string;
  endDate?: string;
  projectIds?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

export interface GetTimeLogsResponse {
  items: TimeLogDto[];
  total: number;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateTimeLogPayload {
  projectId: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface UpdateTimeLogPayload {
  description?: string;
  projectId?: string;
  startTime?: string;
  endTime?: string;
}

export interface DeleteTimeLogResponse {
  message: string;
}
