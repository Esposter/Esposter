import type { Context } from "@@/server/trpc/context";

import { getMockSession } from "@@/server/trpc/context.test";
import { createFriends } from "@@/server/trpc/routers/createFriends.test";
import { describe } from "vitest";

// An accepted friendship between the session user and a fresh one — `createFriends` with both defaults, keyed
// The way its callers read it
export const createFriendship = async (mockContext: Context) => ({
  user: await createFriends(mockContext),
  userId: getMockSession().user.id,
});

describe.todo("createFriendship");
