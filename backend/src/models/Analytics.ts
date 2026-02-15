import mongoose from 'mongoose';

export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  projectIds?: string | string[];
  userId?: string;
}

export interface MatchQuery {
  userId: mongoose.Types.ObjectId;
  startTime?: {
    $gte?: Date;
    $lte?: Date;
  };
  projectId?: {
    $in: mongoose.Types.ObjectId[];
  };
}

export interface AggregationProjectResult {
  _id: mongoose.Types.ObjectId;
  totalDuration: number;
  count: number;
  projectInfo?: {
    name: string;
    color?: string;
  };
}

export interface AggregationDayResult {
  _id: string;
  totalDuration: number;
  count: number;
}

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

export interface OverallSummary {
  totalDuration: number;
  count: number;
}

export interface AnalyticsResponse {
  overall: OverallSummary;
  byProject: ProjectSummary[];
  byDay: DaySummary[];
  dateRange: {
    start?: string;
    end?: string;
  };
}
