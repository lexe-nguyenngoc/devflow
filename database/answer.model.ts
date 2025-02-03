import { Document, model, models, Schema, Types } from "mongoose";

export interface IAnswer {
  author: Types.ObjectId;
  question: Types.ObjectId;
  content: string;
  upvote: number;
  downvote: number;
}
export interface IAnswerDoc extends IAnswer, Document {}

const AnswerSchema = new Schema<IAnswer>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    content: { type: String, required: true },
    upvote: { type: Number, required: true },
    downvote: { type: Number, required: true },
  },
  { timestamps: true },
);

const Answer = models?.Answer || model<IAnswer>("Answer", AnswerSchema);
export default Answer;
