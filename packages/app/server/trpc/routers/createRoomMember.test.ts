import type { Context } from "@@/server/trpc/context";
import type { User } from "better-auth";

import { createCallerFactory } from "@@/server/trpc";
import { mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { describe } from "vitest";

// Joining a second user to a room is an invite, a session and a join — the dance every suite that needs a
// Non-owner member was writing out at each call site. `mockUser` joins a member the suite already made to a
// Further room, which is how one member comes to be in several rooms at once
export const createRoomMember = async (mockContext: Context, roomId: string, mockUser?: User) => {
  const roomCaller = createCallerFactory(roomRouter)(mockContext);
  const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId });
  const { user } = await mockSessionOnce(mockContext.db, mockUser);
  await roomCaller.joinRoom(invite.id);
  return user;
};

describe.todo("createRoomMember");
