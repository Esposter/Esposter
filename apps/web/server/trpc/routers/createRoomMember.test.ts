import type { AuthSession } from "#server/models/auth/AuthSession";
import type { Context } from "#server/trpc/context";

import { createCallerFactory } from "#server/trpc";
import { createMockAuthSession, createMockContext } from "#server/trpc/context.test";
import { inviteRouter } from "#server/trpc/routers/invite";
import { roomRouter } from "#server/trpc/routers/room";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { describe } from "vitest";

// Two of these in flight at once cannot work, and the way they fail says nothing about why: `createInvite` keeps one
// Invite per member per room, so the second call deletes the link the first is about to join through, which surfaces
// As an unrelated "Invite is not found". The guard names the real cause where a comment would only be read after
let isCreating = false;
// Joining a second user to a room is an invite from the context's caller and a join as the new member. `mockUser`
// Joins a member the suite already made to a further room, which is how one member comes to be in several rooms at once
export const createRoomMember = (mockContext: Context, roomId: string, mockUser?: AuthSession["user"]) => {
  if (isCreating)
    throw new InvalidOperationError(
      Operation.Create,
      createRoomMember.name,
      "called while another call is in flight — it replaces its caller's invite for the room, so two at once consume each other's. Await them one at a time",
    );

  isCreating = true;
  return withFinalizerAsync(
    async () => {
      const invite = await createCallerFactory(inviteRouter)(mockContext).createInvite({
        expireAfterMinutes: 0,
        maxUses: 0,
        roomId,
      });
      const memberAuthSession = await createMockAuthSession(mockContext.db, mockUser);
      await createCallerFactory(roomRouter)(await createMockContext(memberAuthSession)).joinRoom(invite.id);
      return memberAuthSession.user;
    },
    () => {
      isCreating = false;
    },
  );
};

describe.todo("createRoomMember");
