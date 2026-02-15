import type {
  CreateTimeLogPayload,
  DeleteTimeLogResponse,
  GetTimeLogsParams,
  GetTimeLogsResponse,
  TimeLogDto,
  UpdateTimeLogPayload,
} from '../types/timelog';
import { httpClient } from './httpClient';

export async function getTimeLogsApi(params: GetTimeLogsParams = {}) {
  try {
    const { data } = await httpClient.get<GetTimeLogsResponse>('/timelogs', {
      params,
    });
    return data;
  } catch (error) {
    console.error('Failed to fetch time logs:', error);
    throw error;
  }
}

export async function createTimeLogApi(payload: CreateTimeLogPayload) {
  try {
    const { data } = await httpClient.post<TimeLogDto>(
      '/timelogs/manual',
      payload,
    );
    return data;
  } catch (error) {
    console.error('Failed to create time log:', error);
    throw error;
  }
}

export async function updateTimeLogApi(
  logId: string,
  payload: UpdateTimeLogPayload,
) {
  try {
    const { data } = await httpClient.patch<TimeLogDto>(
      `/timelogs/${logId}`,
      payload,
    );
    return data;
  } catch (error) {
    console.error(`Failed to update time log ${logId}:`, error);
    throw error;
  }
}

export async function deleteTimeLogApi(logId: string) {
  try {
    const { data } = await httpClient.delete<DeleteTimeLogResponse>(
      `/timelogs/${logId}`,
    );
    return data;
  } catch (error) {
    console.error(`Failed to delete time log ${logId}:`, error);
    throw error;
  }
}
