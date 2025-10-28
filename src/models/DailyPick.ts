import { Schema, model, models, Types } from "mongoose";

export interface IDailyPick {
  _id: Types.ObjectId;
  date: Date;
  selected_markets: string[];
}

const DailyPickSchema = new Schema<IDailyPick>(
  {
    date: { type: Date, required: true, index: true },
    selected_markets: { type: [String], required: true, default: [] },
  },
  { timestamps: true, versionKey: false, collection: "daily_picks" }
);

DailyPickSchema.index({ date: 1 }, { unique: true });

export default models.DailyPick || model<IDailyPick>("DailyPick", DailyPickSchema);


