import { model, models, Schema, Types } from "mongoose";

export interface IAnswer {
  author: Types.ObjectId;
  question: Types.ObjectId;
  content: string;
  upvote: number;
  downvote: number;
}

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

const Answer = models?.Account || model<IAnswer>("Answer", AnswerSchema);
export default Answer;
