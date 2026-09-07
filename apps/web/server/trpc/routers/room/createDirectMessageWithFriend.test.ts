import type { Context } from "@@/server/trpc/context";

import { createCallerFactory } from "@@/server/trpc";
import { createMockUser, getMockSession } from "@@/server/trpc/context.test";
import { createFriends } from "@@/server/trpc/routers/createFriends.test";
import { directMessageRouter } from "@@/server/trpc/routers/room/directMessage";
import { describe } from "vitest";

// A direct message only exists between friends, so every suite that needs one needs the same preamble: the
// Session user, a fresh friend, and the room the two of them share
export const createDirectMessageWithFriend = async (mockContext: Context) => {
  const mainUser = getMockSession().user;
  const user = await createMockUser(mockContext.db);
  await createFriends(mockContext, mainUser, user);
  const directMessageCaller = createCallerFactory(directMessageRouter)(mockContext);
  const directMessage = await directMessageCaller.createDirectMessage([user.id]);
  return { directMessage, mainUser, user };
};

describe.todo("createDirectMessageWithFriend");
