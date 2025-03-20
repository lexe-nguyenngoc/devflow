"use server";

import { FilterQuery, PipelineStage, SortOrder, Types } from "mongoose";

import { Answer, Question, User } from "@/database";

import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  GetUserAnswersSchema,
  GetUserQuestionsSchema,
  GetUserSchema,
  GetUserTagsSchema,
  PaginatedSearchParamsSchema,
} from "../validations";

export async function getUsers(
  params: PaginatedSearchParams,
): Promise<ActionResponse<{ users: User[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as unknown as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = validationResult.params!;
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = pageSize;

  const filterQuery: FilterQuery<typeof User> = {};

  if (query) {
    filterQuery.$or = [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }

  const SORT_OPTIONS: { [key: string]: { [key: string]: SortOrder } } = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { reputation: -1 },
  };
  const sortCriteria =
    SORT_OPTIONS[filter as keyof typeof SORT_OPTIONS] || SORT_OPTIONS.newest;

  try {
    const totalUsers = await User.countDocuments(filterQuery);
    const users = await User.find(filterQuery)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalUsers > skip + users.length;

    return {
      success: true,
      data: {
        users: JSON.parse(JSON.stringify(users)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as unknown as ErrorResponse;
  }
}

export async function getUser(
  params: GetUserParams,
): Promise<
  ActionResponse<{ user: User; totalQuestions: number; totalAnswers: number }>
> {
  const validationResult = await action({
    params,
    schema: GetUserSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as unknown as ErrorResponse;
  }

  const { userId } = params;

  try {
    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");

    const [totalQuestions, totalAnswers] = await Promise.all([
      Question.countDocuments({ author: userId }),
      Answer.countDocuments({ author: userId }),
    ]);

    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(user)),
        totalQuestions,
        totalAnswers,
      },
    };
  } catch (error) {
    return handleError(error) as unknown as ErrorResponse;
  }
}

export async function getUserQuestions(
  params: GetUserQuestionsParams,
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetUserQuestionsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as unknown as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 10 } = params;

  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  try {
    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");

    const [totalQuestions, questions] = await Promise.all([
      Question.countDocuments({ author: userId }),
      Question.find({ author: userId })
        .populate("tags", "name")
        .populate("author", "name image")
        .skip(skip)
        .limit(limit),
    ]);

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as unknown as ErrorResponse;
  }
}

export async function getUserAnswers(
  params: GetUserAnswersParams,
): Promise<ActionResponse<{ answers: Answer[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetUserAnswersSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as unknown as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 10 } = params;

  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  try {
    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");

    const [totalAnswers, answers] = await Promise.all([
      Answer.countDocuments({ author: userId }),
      Answer.find({ author: userId })
        .populate("author", "_id name image")
        .skip(skip)
        .limit(limit),
    ]);

    const isNext = totalAnswers > skip + answers.length;

    return {
      success: true,
      data: {
        answers: JSON.parse(JSON.stringify(answers)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as unknown as ErrorResponse;
  }
}

export async function getUserTopTags(params: GetUserTagsParams): Promise<
  ActionResponse<{
    tags: { _id: string; name: string; count: number }[];
  }>
> {
  const validationResult = await action({
    params,
    schema: GetUserTagsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as unknown as ErrorResponse;
  }

  const { userId } = params;

  try {
    const pipeline: PipelineStage[] = [
      { $match: { author: new Types.ObjectId(userId) } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "tags",
          localField: "_id",
          foreignField: "_id",
          as: "tagInfo",
        },
      },
      { $unwind: "$tagInfo" },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: " $tagInfo._id", name: "$tagInfo.name", count: 1 } },
    ];

    const tags = await Question.aggregate(pipeline);
    return { success: true, data: { tags: JSON.parse(JSON.stringify(tags)) } };
  } catch (error) {
    return handleError(error) as unknown as ErrorResponse;
  }
}
