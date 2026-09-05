import type { Context } from "@@/server/trpc/context";
import type { User } from "better-auth";

import { createCallerFactory } from "@@/server/trpc";
import { mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { describe } from "vitest";

// Two of these in flight at once cannot work, and the way they fail says nothing about why: `createInvite` keeps
// One invite per member per room, so the second call deletes the link the first is about to join through, and
// `mockSessionOnce` queues a single session that whichever join gets there first consumes. Both surface as an
// Unrelated "Invite is not found", so the guard names the real cause where a comment would only be read after
let isCreating = false;
// Joining a second user to a room is an invite, a session and a join. `mockUser` joins a member the suite
// Already made to a further room, which is how one member comes to be in several rooms at once
export const createRoomMember = (mockContext: Context, roomId: string, mockUser?: User) => {
  if (isCreating)
    throw new InvalidOperationError(
      Operation.Create,
      createRoomMember.name,
      "called while another call is in flight — it queues a one-shot session and replaces its caller's invite for the room, so two at once consume each other's. Await them one at a time",
    );

  isCreating = true;
  return withFinalizerAsync(
    async () => {
      const roomCaller = createCallerFactory(roomRouter)(mockContext);
      const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId });
      const { user } = await mockSessionOnce(mockContext.db, mockUser);
      await roomCaller.joinRoom(invite.id);
      return user;
    },
    () => {
      isCreating = false;
    },
  );
};

describe.todo("createRoomMember");
