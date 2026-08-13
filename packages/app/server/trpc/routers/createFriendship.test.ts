import type { Context } from "@@/server/trpc/context";

import { createCallerFactory } from "@@/server/trpc";
import { getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { describe } from "vitest";

// An accepted friendship between the session user and a fresh one: the request is sent as the new user and
// Accepted as the session user, so the caller is left on the session it started with. `createFriends` is the
// Same dance between two users the suite already has
export const createFriendship = async (mockContext: Context) => {
  const friendRequestCaller = createCallerFactory(friendRequestRouter)(mockContext);
  const userId = getMockSession().user.id;
  const { user } = await mockSessionOnce(mockContext.db);
  await friendRequestCaller.sendFriendRequest(userId);
  await friendRequestCaller.acceptFriendRequest(user.id);
  return { user, userId };
};

describe.todo("createFriendship");
