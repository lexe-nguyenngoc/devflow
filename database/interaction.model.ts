import { model, models, Schema, Types } from "mongoose";

export interface IInteraction {
  user: Types.ObjectId;
  action: string;
  actionId: string;
  actionType: "question" | "answer";
}

const InteractionSchema = new Schema<IInteraction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    actionId: { type: String, required: true },
    actionType: { type: String, enum: ["question", "answer"], required: true },
  },
  { timestamps: true },
);

const Interaction =
  models?.Interaction || model<IInteraction>("Interaction", InteractionSchema);
export default Interaction;
