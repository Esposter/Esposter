import type { Context } from "#server/trpc/context";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { createCallerFactory } from "#server/trpc/index";
import { trpcRouter } from "#server/trpc/routers/index";
import { roomRouter } from "#server/trpc/routers/room/index";

const name = "name";
const words = ["a"];

// The room filter router's cases for the app-wide live topic check: a room's word filter is read by its managers, and a
// Save changes what that read answers
export const createFilterLiveTopicCalls = async (context: Context): Promise<LiveTopicCalls> => {
  const room = await createCallerFactory(roomRouter)(context).createRoom({ name });
  return {
    queries: [
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).room.filter.readRoomFilter({ roomId: room.id }),
        path: "room.filter.readRoomFilter",
      },
    ],
    writes: [
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).room.filter.upsertRoomFilter({ roomId: room.id, words }),
        path: "room.filter.upsertRoomFilter",
      },
    ],
  };
};
