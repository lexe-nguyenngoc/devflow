import mongoose from "mongoose";
import { NextResponse } from "next/server";
import slugify from "slugify";

import Account from "@/database/account.model";
import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-error";
import dbConnect from "@/lib/mongoose";
import { SingInWithOAuthSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json();

  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validatedData = SingInWithOAuthSchema.safeParse({
      provider,
      providerAccountId,
      user,
    });

    if (!validatedData.success)
      throw new ValidationError(validatedData.error.flatten().fieldErrors);

    const existingUser = await findOrCreateUser(user, session);
    await findOrCreateAccount(
      {
        userId: existingUser._id,
        name: user.name,
        image: user.image,
        provider,
        providerAccountId,
      },
      session,
    );

    await session.commitTransaction();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    await session.abortTransaction();
    return handleError(error, "api") as APIErrorResponse;
  } finally {
    session.endSession();
  }
}

const findOrCreateUser = async (
  userData: {
    name: string;
    username: string;
    email: string;
    image: string;
  },
  session: mongoose.ClientSession,
) => {
  const { name, username, email, image } = userData;

  const normalizedUsername = slugify(username, {
    lower: true,
    strict: true,
    trim: true,
  });

  const existingUser = await User.findOne({ email }).session(session);

  if (!existingUser) {
    const [newUser] = await User.create(
      [{ name, username: normalizedUsername, email, image }],
      { session },
    );

    return newUser;
  }

  const updatedData: { name?: string; image?: string } = {};

  if (existingUser.name !== name) updatedData.name = name;
  if (existingUser.image !== image) updatedData.image = image;

  if (Object.keys(updatedData).length > 0) {
    await User.updateOne(
      { _id: existingUser._id },
      { $set: updatedData },
    ).session(session);
  }

  return existingUser;
};

const findOrCreateAccount = async (
  accountData: {
    userId: string;
    name: string;
    image: string;
    provider: string;
    providerAccountId: string;
  },
  session: mongoose.ClientSession,
) => {
  const { userId, name, image, provider, providerAccountId } = accountData;
  const existingAccount = await Account.findOne({
    userId,
    provider,
    providerAccountId,
  }).session(session);

  if (!existingAccount) {
    await Account.create(
      [{ userId, name, image, provider, providerAccountId }],
      { session },
    );
  }
};
