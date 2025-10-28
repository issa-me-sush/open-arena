import { Schema, model, models, Types } from "mongoose";

export interface IModelInference {
  _id: Types.ObjectId;
  model_id: Types.ObjectId;   // ref -> AiModel
  timestamp: Date;            // 15-min tick (or interval)
  prompt: string;             // base prompt
  reasoning?: string;         // optional summary/output
}

const ModelInferenceSchema = new Schema<IModelInference>(
  {
    model_id: { type: Schema.Types.ObjectId, ref: "AiModel", required: true, index: true },
    timestamp: { type: Date, required: true, index: true },
    prompt: { type: String, required: true },
    reasoning: { type: String },
  },
  { timestamps: true, versionKey: false, collection: "model_inferences" }
);

ModelInferenceSchema.index({ model_id: 1, timestamp: -1 }, { unique: true });

export default models.ModelInference || model<IModelInference>("ModelInference", ModelInferenceSchema);


