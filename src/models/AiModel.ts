import { Schema, model, models, Types } from "mongoose";

export interface IAiModel {
  _id: Types.ObjectId;
  name: string;
  wallet_address: string;
  learnings?: string;
}

const AiModelSchema = new Schema<IAiModel>(
  {
    name: { type: String, required: true, trim: true, index: true },
    wallet_address: { type: String, required: true, lowercase: true, index: true, unique: true },
    learnings: { type: String },
  },
  { timestamps: true, versionKey: false, collection: "ai_models" }
);

export default models.AiModel || model<IAiModel>("AiModel", AiModelSchema);


