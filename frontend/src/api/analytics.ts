import { httpClient } from './httpClient';

export interface ProjectSummary {
  _id: string;
  totalDuration: number;
  count: number;
  projectName?: string;
  projectColor?: string;
}

export interface DaySummary {
  _id: string;
  totalDuration: number;
  count: number;
}

export interface AnalyticsSummary {
  overall: {
    totalDuration: number;
    count: number;
  };
  byProject: ProjectSummary[];
  byDay: DaySummary[];
}

export interface GetAnalyticsParams {
  startDate?: string;
  endDate?: string;
  projectIds?: string[];
}

export async function getAnalyticsSummaryApi(params: GetAnalyticsParams) {
  const { data } = await httpClient.get<AnalyticsSummary>(
    '/analytics/summary',
    {
      params,
    },
  );
  return data;
}
