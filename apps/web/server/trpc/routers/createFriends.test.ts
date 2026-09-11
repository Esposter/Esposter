import type { Context } from "@@/server/trpc/context";
import type { User } from "better-auth";

import { createCallerFactory } from "@@/server/trpc";
import { getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { describe } from "vitest";

// An accepted friendship is a request sent as one user and accepted as the other, so it can only be set up by
// Driving both sessions — the caller is left on whatever session it had. Either user omitted is the default
// Identity: the requester is minted fresh, and the accepter is the session user, who needs no queued session
export const createFriends = async (mockContext: Context, requester?: User, accepter?: User) => {
  const friendRequestCaller = createCallerFactory(friendRequestRouter)(mockContext);
  const { user } = await mockSessionOnce(mockContext.db, requester);
  await friendRequestCaller.sendFriendRequest(accepter?.id ?? getMockSession().user.id);
  if (accepter) await mockSessionOnce(mockContext.db, accepter);
  await friendRequestCaller.acceptFriendRequest(user.id);
  return user;
};

describe.todo("createFriends");
