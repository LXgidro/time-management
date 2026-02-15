import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITimer extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  description: string;
  startTime: Date;
  status: 'running' | 'paused';
  pausedAt?: Date;
  totalPausedDuration: number;
  lastResumedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface HasTimerFields {
  startTime: Date;
  status: 'running' | 'paused';
  pausedAt?: Date;
  totalPausedDuration: number;
}

export type PopulatedProject = {
  _id: Types.ObjectId;
  name: string;
  color?: string;
};

export interface StartTimerRequest {
  projectId: string;
  description: string;
}

export interface TimerResponse {
  _id: string;
  projectId: string;
  description: string;
  startTime: string;
  status: 'running' | 'paused';
  pausedAt?: string;
  totalPausedDuration: number;
  lastResumedAt?: string;
  elapsedSeconds?: number;
  project?: {
    _id: string;
    name: string;
    color?: string;
  };
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

const TimerSchema = new Schema<ITimer>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    startTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['running', 'paused'],
      default: 'running',
      required: true,
    },
    pausedAt: { type: Date },
    totalPausedDuration: { type: Number, default: 0 },
    lastResumedAt: { type: Date },
  },
  { timestamps: true },
);

TimerSchema.index({ userId: 1, status: 1 });

export default mongoose.model<ITimer>('Timer', TimerSchema);
