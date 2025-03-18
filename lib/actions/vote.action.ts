"use server";

import mongoose, { ClientSession } from "mongoose";

import { Answer, Question, Vote } from "@/database";

import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  CreateVoteSchema,
  HasVotedSchema,
  UpdateVoteSchema,
} from "../validations";

export async function updateVoteCount(
  params: UpdateVoteCountParams,
  session?: ClientSession,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: UpdateVoteSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as unknown as ActionResponse;
  }

  const { targetId, targetType, voteType, change } = validationResult.params!;

  const Model = targetType === "question" ? Question : Answer;
  const voteField = voteType === "upvote" ? "upvotes" : "downvotes";

  const userId = validationResult.session?.user?.id;

  if (!userId)
    handleError(new Error("Unauthorized")) as unknown as ErrorResponse;

  try {
    const result = await Model.findByIdAndUpdate(
      targetId,
      { $inc: { [voteField]: change } },
      { new: true, session },
    );

    if (!result) {
      return handleError(
        new Error("Failed to update vote count"),
      ) as unknown as ErrorResponse;
    }

    return { success: true };
  } catch (error) {
    return handleError(error) as unknown as ErrorResponse;
  }
}

export async function createVote(
  params: CreateVoteParams,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as unknown as ActionResponse;
  }

  const { targetId, targetType, voteType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  if (!userId)
    handleError(new Error("Unauthorized")) as unknown as ErrorResponse;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingVote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    }).session(session);

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.deleteOne({ _id: existingVote._id });
        await updateVoteCount(
          { targetId, targetType, voteType, change: -1 },
          session,
        );
      } else {
        await Vote.findByIdAndUpdate(
          existingVote._id,
          { voteType },
          { new: true, session },
        );
        await updateVoteCount(
          { targetId, targetType, voteType, change: 1 },
          session,
        );
      }
    } else {
      await Vote.create([{ targetId, targetType, voteType, change: 1 }], {
        session,
      });
    }

    await session.commitTransaction();
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as unknown as ErrorResponse;
  } finally {
    session.endSession();
  }
}

export async function hasVoted(
  params: HasVotedPars,
): Promise<ActionResponse<HasVotedResponse>> {
  const validationResult = await action({
    params,
    schema: HasVotedSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as unknown as ErrorResponse;
  }

  const { targetId, targetType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const vote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    });

    if (vote)
      return {
        success: false,
        data: {
          hasDownvoted: false,
          hasUpvoted: false,
        },
      };

    return {
      success: true,
      data: {
        hasUpvoted: vote.voteType === "upvote",
        hasDownvoted: vote.voteType === "downvote",
      },
    };
  } catch (error) {
    return handleError(error) as unknown as ErrorResponse;
  }
}
