import { Schema, model, models, Types } from "mongoose";

export interface ILeaderboardSnapshot {
  _id: Types.ObjectId;
  date: Date;
  model_id: Types.ObjectId;
  total_value: number;
  realized_pnl: number;
  unrealized_pnl: number;
  top_positions?: string[];
}

const LeaderboardSnapshotSchema = new Schema<ILeaderboardSnapshot>(
  {
    date: { type: Date, required: true, index: true },
    model_id: { type: Schema.Types.ObjectId, ref: "Model", required: true, index: true },
    total_value: { type: Number, required: true },
    realized_pnl: { type: Number, default: 0 },
    unrealized_pnl: { type: Number, default: 0 },
    top_positions: [String],
  },
  { timestamps: true, versionKey: false, collection: "leaderboard_snapshots" }
);

LeaderboardSnapshotSchema.index({ model_id: 1, date: 1 }, { unique: true });

export default models.LeaderboardSnapshot ||
  model<ILeaderboardSnapshot>("LeaderboardSnapshot", LeaderboardSnapshotSchema);


