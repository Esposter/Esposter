import type { AuthSession } from "#server/models/auth/AuthSession";
import type { Context } from "#server/trpc/context";

import { createCallerFactory } from "#server/trpc";
import { createMockAuthSession, createMockContext } from "#server/trpc/context.test";
import { friendRequestRouter } from "#server/trpc/routers/friendRequest";
import { assert, describe } from "vitest";

// An accepted friendship is a request sent as one user and accepted as the other. The requester omitted is a fresh
// User, and the accepter omitted is the context's own caller
export const createFriends = async (
  mockContext: Context,
  requester?: AuthSession["user"],
  accepter?: AuthSession["user"],
) => {
  const requesterAuthSession = await createMockAuthSession(mockContext.db, requester);
  const accepterContext = accepter
    ? await createMockContext(await createMockAuthSession(mockContext.db, accepter))
    : mockContext;
  const accepterId = accepterContext.user?.id;
  assert.exists(accepterId);
  await createCallerFactory(friendRequestRouter)(await createMockContext(requesterAuthSession)).sendFriendRequest(
    accepterId,
  );
  await createCallerFactory(friendRequestRouter)(accepterContext).acceptFriendRequest(requesterAuthSession.user.id);
  return requesterAuthSession.user;
};

describe.todo("createFriends");
