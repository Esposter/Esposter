import type { Context } from "#server/trpc/context";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { createCallerFactory } from "#server/trpc/index";
import { trpcRouter } from "#server/trpc/routers/index";
import { roomRouter } from "#server/trpc/routers/room/index";

const name = "name";
const query = "query";

// The search history router's cases for the app-wide live topic check: a room's history is the viewer's own searches in
// It, and a search the viewer runs adds one
export const createSearchHistoryLiveTopicCalls = async (context: Context): Promise<LiveTopicCalls> => {
  const room = await createCallerFactory(roomRouter)(context).createRoom({ name });
  return {
    queries: [
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).searchHistory.readSearchHistories({ roomId: room.id }),
        path: "searchHistory.readSearchHistories",
      },
    ],
    writes: [
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).searchHistory.createSearchHistory({ query, roomId: room.id }),
        path: "searchHistory.createSearchHistory",
      },
    ],
  };
};
