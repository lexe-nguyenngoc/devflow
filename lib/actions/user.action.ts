"use server";

import { FilterQuery, SortOrder } from "mongoose";

import { User } from "@/database";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { PaginatedSearchParamsSchema } from "../validations";

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
