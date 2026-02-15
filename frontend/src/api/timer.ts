import { httpClient } from './httpClient';
import type {
  ActiveTimer,
  StartTimerPayload,
  StopTimerResponse,
} from '../types/timer';

export async function startTimerApi(
  payload: StartTimerPayload,
): Promise<ActiveTimer> {
  try {
    const { data } = await httpClient.post<ActiveTimer>(
      '/timer/start',
      payload,
    );
    return data;
  } catch (error) {
    console.error('Failed to start timer:', error);
    throw error;
  }
}

export async function pauseTimerApi(timerId: string): Promise<ActiveTimer> {
  try {
    const { data } = await httpClient.patch<ActiveTimer>(
      `/timer/${timerId}/pause`,
    );
    return data;
  } catch (error) {
    console.error(`Failed to pause timer ${timerId}:`, error);
    throw error;
  }
}

export async function resumeTimerApi(timerId: string): Promise<ActiveTimer> {
  try {
    const { data } = await httpClient.patch<ActiveTimer>(
      `/timer/${timerId}/resume`,
    );
    return data;
  } catch (error) {
    console.error(`Failed to resume timer ${timerId}:`, error);
    throw error;
  }
}

export async function stopTimerApi(
  timerId: string,
): Promise<StopTimerResponse> {
  try {
    const { data } = await httpClient.patch<StopTimerResponse>(
      `/timer/${timerId}/stop`,
      {},
    );
    return data;
  } catch (error) {
    console.error(`Failed to stop timer ${timerId}:`, error);
    throw error;
  }
}

export async function getActiveTimerApi(): Promise<ActiveTimer | null> {
  try {
    const { data } = await httpClient.get<ActiveTimer | null>('/timer/active');
    return data;
  } catch (error) {
    console.error('Failed to get active timer:', error);
    throw error;
  }
}
