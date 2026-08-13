import type { Context } from "@@/server/trpc/context";
import type { User } from "better-auth";

import { createCallerFactory } from "@@/server/trpc";
import { mockSessionOnce } from "@@/server/trpc/context.test";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { describe } from "vitest";

// An accepted friendship is a request sent as one user and accepted as the other, so it can only be set up by
// Driving both sessions — the caller is left on whatever session it had
export const createFriends = async (mockContext: Context, userA: User, userB: User) => {
  const friendRequestCaller = createCallerFactory(friendRequestRouter)(mockContext);
  await mockSessionOnce(mockContext.db, userA);
  await friendRequestCaller.sendFriendRequest(userB.id);
  await mockSessionOnce(mockContext.db, userB);
  await friendRequestCaller.acceptFriendRequest(userA.id);
};

describe.todo("createFriends");
