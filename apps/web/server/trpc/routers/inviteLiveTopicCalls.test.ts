import { trpcRouter } from "#server/trpc/routers/index";
import type { Context } from "#server/trpc/context";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { createMockAuthSession, createMockCaller } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { createRoomMember } from "#server/trpc/routers/createRoomMember.test";
import { inviteRouter } from "#server/trpc/routers/invite";
import { roomRouter } from "#server/trpc/routers/room/index";

const name = "name";

// The invite router's cases for the app-wide live topic check: the landing page reads a link by its code, a member reads
// Their own link, and the room's list reads every link. Creating and revoking a link change what those reads answer
export const createInviteLiveTopicCalls = async (context: Context): Promise<LiveTopicCalls> => {
  const inviteCaller = createCallerFactory(inviteRouter)(context);
  const newRoom = await createCallerFactory(roomRouter)(context).createRoom({ name });
  // Joining a member mints the owner's link on the way, so the owner's own link is minted after it
  const member = await createRoomMember(context, newRoom.id);
  const createUnlimitedInvite = (roomId: string, caller = inviteCaller) =>
    caller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId });
  const newInvite = await createUnlimitedInvite(newRoom.id);
  const memberInvite = await createUnlimitedInvite(
    newRoom.id,
    await createMockCaller(inviteRouter, await createMockAuthSession(context.db, member)),
  );

  return {
    queries: [
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).invite.readInvite(newInvite.id),
        path: "invite.readInvite",
      },
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).invite.readMyInvite({ roomId: newRoom.id }),
        path: "invite.readMyInvite",
      },
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).invite.readRoomInvites({ roomId: newRoom.id }),
        path: "invite.readRoomInvites",
      },
    ],
    writes: [
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).invite.createInvite({
            expireAfterMinutes: 0,
            maxUses: 0,
            roomId: newRoom.id,
          }),
        path: "invite.createInvite",
      },
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).invite.revokeInvite({ id: memberInvite.id, roomId: newRoom.id }),
        path: "invite.revokeInvite",
      },
    ],
  };
};
