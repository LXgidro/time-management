import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeLog extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  description: string;
  startTime: Date;
  endTime: Date;
  duration: number;
}

const TimeLogSchema = new Schema<ITimeLog>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<ITimeLog>('TimeLog', TimeLogSchema);
