import type { Context } from "#server/trpc/context";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { createCallerFactory } from "#server/trpc/index";
import { trpcRouter } from "#server/trpc/routers/index";
import { roomRouter } from "#server/trpc/routers/room/index";

const name = "name";
const displayName = "displayName";

// The membership router's cases for the app-wide live topic check: the viewer's room list reads its memberships, and a
// Save of a membership, or a cleared mention badge, changes what that list shows
export const createUserToRoomLiveTopicCalls = async (context: Context): Promise<LiveTopicCalls> => {
  const room = await createCallerFactory(roomRouter)(context).createRoom({ name });
  return {
    queries: [
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).userToRoom.readMyUsersToRooms({ roomIds: [room.id] }),
        path: "userToRoom.readMyUsersToRooms",
      },
    ],
    writes: [
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).userToRoom.clearMentionCount({ roomId: room.id }),
        path: "userToRoom.clearMentionCount",
      },
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).userToRoom.updateUserToRoom({ displayName, roomId: room.id }),
        path: "userToRoom.updateUserToRoom",
      },
    ],
  };
};
